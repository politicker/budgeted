package cmd

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"time"

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

			err = queries.ImportLogCreate(ctx, time.Now())
			if err != nil {
				return err
			}

			importLogId, err := queries.ImportLogGetLastInsertID(ctx)
			if err != nil {
				return err
			}

			err = csv.LoadTransactions(ctx, queries, importLogId)
			if err != nil {
				return err
			}

			err = csv.LoadAccounts(ctx, queries, importLogId)
			if err != nil {
				return err
			}

			err = queries.ImportLogComplete(ctx, importLogId)
			if err != nil {
				return err
			}

			return nil
		},
	}

	return &command
}
