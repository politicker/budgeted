package cmd

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	"github.com/politicker/budgeted/internal/db"
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

			driver, err := sql.Open("sqlite3", filepath.Join(os.Getenv("HOME"), ".config", "budgeted", "db.sqlite"))
			if err != nil {
				return err
			}

			queries := db.New(driver)

			pc, err := plaid.NewClientFromConfig(ctx, isSandBox, queries)
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
