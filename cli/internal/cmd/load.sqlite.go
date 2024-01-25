package cmd

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	"github.com/politicker/budgeted/internal/csv"
	"github.com/politicker/budgeted/internal/db"
	"github.com/spf13/cobra"
)

func LoadSqliteCmd() *cobra.Command {
	command := cobra.Command{
		Use:   "sqlite",
		Short: "load data from sqlite",
		RunE: func(cmd *cobra.Command, args []string) error {

			driver, err := sql.Open("sqlite3", filepath.Join(os.Getenv("HOME"), ".config", "budgeted", "db.sqlite"))
			if err != nil {
				return err
			}

			queries := db.New(driver)
			ctx := context.Background()
			err = csv.LoadTransactions(ctx, queries)
			if err != nil {
				return err
			}

			err = csv.LoadAccounts(ctx, queries)
			if err != nil {
				return err
			}

			return nil
		},
	}

	return &command
}
