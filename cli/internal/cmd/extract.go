package cmd

import (
	"context"
	"database/sql"
	"path/filepath"

	"github.com/politicker/budgeted/internal/cmdutil"
	"github.com/politicker/budgeted/internal/db"
	"github.com/politicker/budgeted/internal/domain"
	"github.com/spf13/cobra"
)

func ExtractCmd(ctx context.Context) *cobra.Command {
	command := cobra.Command{
		Use:   "extract",
		Short: "fetch data from the Plaid API and save it",
		RunE: func(cmd *cobra.Command, args []string) error {
			isSandBox, err := cmd.Flags().GetBool("sandbox")
			if err != nil {
				return err
			}

			driver, err := sql.Open("sqlite3", filepath.Join(cmdutil.ConfigDir(), "db.sqlite"))
			if err != nil {
				return err
			}

			queries := db.New(driver)

			pc, err := domain.PlaidClientFromConfig(ctx, isSandBox, queries)
			if err != nil {
				return err
			}

			err = domain.ExtractPlaidData(ctx, pc, queries)
			if err != nil {
				return err
			}

			return nil
		},
	}

	command.PersistentFlags().Bool("sandbox", false, "Use sandbox credentials")
	command.PersistentFlags().BoolP("force", "f", false, "Force overwrite of existing data")

	return &command
}
