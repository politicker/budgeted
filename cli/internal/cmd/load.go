package cmd

import (
	"context"
	"database/sql"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	"github.com/politicker/budgeted/internal/cmdutil"
	"github.com/politicker/budgeted/internal/db"
	"github.com/politicker/budgeted/internal/domain"
	"github.com/spf13/cobra"
)

func LoadCmd(ctx context.Context) *cobra.Command {
	command := cobra.Command{
		Use:   "load",
		Short: "load CSV data into SQLite database",
		RunE: func(cmd *cobra.Command, args []string) error {

			driver, err := sql.Open("sqlite3", filepath.Join(cmdutil.ConfigDir(), "db.sqlite"))
			if err != nil {
				return err
			}

			queries := db.New(driver)
			ctx := context.Background()

			err = domain.Import(ctx, queries, func(ctx context.Context, importLogId int64) error {
				err = domain.LoadTransactions(ctx, queries, importLogId)
				if err != nil {
					return err
				}

				err = domain.LoadAccounts(ctx, queries, importLogId)
				if err != nil {
					return err
				}

				err = domain.LoadAccountBalances(ctx, queries, importLogId)
				if err != nil {
					return err
				}

				return nil
			})
			if err != nil {
				return err
			}

			return nil
		},
	}

	return &command
}
