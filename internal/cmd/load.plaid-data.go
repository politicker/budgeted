package cmd

import (
	"context"

	"github.com/pkg/errors"
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

			pc, err := plaid.NewClientFromConfig(ctx, isSandBox)
			if err != nil {
				return err
			}

			err = pc.LoadTransactions(ctx)
			if err != nil {
				return errors.Wrap(err, "failed to load transactions")
			}

			err = pc.LoadAccounts(ctx)
			if err != nil {
				return errors.Wrap(err, "failed to load accounts")
			}

			return nil
		},
	}

	command.PersistentFlags().Bool("sandbox", false, "Use sandbox credentials")

	return &command
}
