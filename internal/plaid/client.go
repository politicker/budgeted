package plaid

import (
	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/spf13/viper"
)

func newClient() *plaid.APIClient {
	configuration := plaid.NewConfiguration()
	configuration.AddDefaultHeader("PLAID-CLIENT-ID", viper.GetString("plaid.client_id"))
	configuration.AddDefaultHeader("PLAID-SECRET", viper.GetString("plaid.secret"))
	configuration.UseEnvironment(plaid.Development)

	return plaid.NewAPIClient(configuration)
}
