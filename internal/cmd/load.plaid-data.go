package cmd

import (
	"context"
	"github.com/politicker/budgeted/internal/plaid"
	"github.com/spf13/cobra"
)

func LoadPlaidDataCmd(ctx context.Context) *cobra.Command {
	command := cobra.Command{
		Use:   "plaid-data",
		Short: "load data from plaid",
		RunE: func(cmd *cobra.Command, args []string) error {
			isSandBox, err := cmd.Flags().GetBool("sandbox")
			if err != nil {
				return err
			}

			client, err := plaid.NewClientFromConfig(ctx, isSandBox)
			if err != nil {
				return err
			}

			return client.LoadTransactions()
		},
	}

	command.PersistentFlags().Bool("sandbox", false, "Use sandbox credentials")

	return &command
}
