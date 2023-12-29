package cmd

import (
	"context"
	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func CheckCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "check",
		Short: "Checks connection to plaid",
		RunE: func(cmd *cobra.Command, args []string) error {
			configuration := plaid.NewConfiguration()
			configuration.AddDefaultHeader("PLAID-CLIENT-ID", viper.GetString("plaid.client_id"))
			configuration.AddDefaultHeader("PLAID-SECRET", viper.GetString("plaid.secret"))
			configuration.UseEnvironment(plaid.Development)

			_ = plaid.NewAPIClient(configuration)
			//api := client.PlaidApi
			return nil
		},
	}
}
