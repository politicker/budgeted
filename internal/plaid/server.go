package plaid

import (
	"context"
	"embed"
	"fmt"
	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/spf13/viper"
	"html/template"
	"io"
	"net/http"
)

//go:embed template/*
var templates embed.FS

var tmpl *template.Template

func init() {
	var err error
	tmpl, err = template.ParseFS(templates, "template/*.html")
	if err != nil {
		panic(err)
	}
}

func RunServer(ctx context.Context) error {
	client := newClient()

	// This should correspond to a unique id for the current user.
	// Typically, this will be a user ID number from your application.
	// Personally identifiable information, such as an email address or phone number, should not be used here.
	user := plaid.LinkTokenCreateRequestUser{
		ClientUserId: viper.GetString("plaid.client_user_id"),
	}

	request := plaid.NewLinkTokenCreateRequest(
		"Plaid Quickstart",
		"en",
		[]plaid.CountryCode{plaid.COUNTRYCODE_US},
		user,
	)

	request.SetProducts([]plaid.Products{plaid.PRODUCTS_TRANSACTIONS})

	linkTokenCreateResp, _, err := client.PlaidApi.LinkTokenCreate(ctx).LinkTokenCreateRequest(*request).Execute()
	if err != nil {
		return err
	}

	linkToken := linkTokenCreateResp.GetLinkToken()

	fmt.Printf("Link token: %s\n", linkToken)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		data := map[string]string{
			"PlaidLinkToken": linkToken,
		}

		err = tmpl.ExecuteTemplate(w, "index.html", data)
		if err != nil {
			panic(err)
		}
	})

	http.HandleFunc("/success", func(w http.ResponseWriter, r *http.Request) {
		tokenBytes, err := io.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}

		token := string(tokenBytes)
		viper.Set("plaid.public_token", token)
		err = viper.WriteConfig()
		if err != nil {
			panic(err)
		}

		_, _ = w.Write([]byte("Success!"))
	})

	return http.ListenAndServe(":8080", nil)
}