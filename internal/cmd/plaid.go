package cmd

import (
	"context"
	"fmt"
	webview "github.com/webview/webview_go"
	"time"

	"github.com/plaid/plaid-go/v20/plaid"

	"github.com/spf13/cobra"

	"github.com/spf13/viper"
)

const html = `<div style="background-color: white"><button id="increment">Tap me</button>
<div>You tapped <span id="count">0</span> time(s).</div>
<script>
  const [incrementElement, countElement] =
    document.querySelectorAll("#increment, #count");
  document.addEventListener("DOMContentLoaded", () => {
    incrementElement.addEventListener("click", () => {
      window.increment().then(result => {
        countElement.textContent = result.count;
      });
    });
  });
</script></div>`

type IncrementResult struct {
	Count uint `json:"count"`
}

func PlaidCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "plaid",
		Short: "Loads plaid UI",
		RunE: func(cmd *cobra.Command, args []string) error {
			configuration := plaid.NewConfiguration()
			configuration.AddDefaultHeader("PLAID-CLIENT-ID", viper.GetString("plaid.client_id"))
			configuration.AddDefaultHeader("PLAID-SECRET", viper.GetString("plaid.secret"))
			configuration.UseEnvironment(plaid.Development)

			client := plaid.NewAPIClient(configuration)
			ctx := context.Background()

			// This should correspond to a unique id for the current user.
			// Typically, this will be a user ID number from your application.
			// Personally identifiable information, such as an email address or phone number, should not be used here.
			user := plaid.LinkTokenCreateRequestUser{
				ClientUserId: time.Now().String(),
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

			fmt.Println(linkTokenCreateResp.GetLinkToken())

			var count uint = 0
			w := webview.New(false)
			defer w.Destroy()
			w.SetTitle("Bind Example")
			w.SetSize(480, 320, webview.HintNone)

			// A binding that increments a value and immediately returns the new value.
			w.Bind("increment", func() IncrementResult {
				count++
				return IncrementResult{Count: count}
			})

			w.SetHtml(html)
			w.Run()

			return nil
		},
	}
}
