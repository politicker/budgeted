package plaid

import (
	"embed"
	"fmt"
	"html/template"
	"io"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/spf13/viper"
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

func (pc *APIClient) Routes(router *mux.Router) error {
	if viper.GetString("plaid.client_user_id") == "" {
		return errors.New("plaid.client_user_id must be set")
	}

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

	linkTokenCreateResp, _, err := pc.PlaidApi.LinkTokenCreate(pc.ctx).LinkTokenCreateRequest(*request).Execute()
	if err != nil {
		if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
			return errors.New(plaidErr.GetErrorMessage())
		} else {
			return err
		}
	}

	linkToken := linkTokenCreateResp.GetLinkToken()

	fmt.Printf("Link token: %s\n", linkToken)

	router.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		data := map[string]string{
			"PlaidLinkToken": linkToken,
		}

		w.WriteHeader(http.StatusOK)
		err = tmpl.ExecuteTemplate(w, "index.html", data)
		if err != nil {
			panic(err)
		}
	})

	router.HandleFunc("/success", func(w http.ResponseWriter, r *http.Request) {
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

		err = pc.ExchangeToken(token)
		if err != nil {
			panic(err)
		}

		_, _ = w.Write([]byte("Success!"))
	})

	return nil
}
