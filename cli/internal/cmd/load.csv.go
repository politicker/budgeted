package cmd

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/politicker/budgeted/internal/csv"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func LoadCsvCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "csv",
		Short: "load data into csv",
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonStorage := viper.GetString("storage.json")
			if jsonStorage == "" {
				return errors.New("storage.json is not set")
			}

			csvStorage := viper.GetString("storage.csv")
			if csvStorage == "" {
				return errors.New("storage.csv is not set")
			}

			info, err := os.Stat(csvStorage)
			if os.IsNotExist(err) {
				log.Println("creating csv storage directory", jsonStorage)
				err := os.MkdirAll(csvStorage, 0755)
				if err != nil {
					return err
				}
			} else if err != nil {
				return err
			} else if !info.IsDir() {
				return errors.New("csv storage is not a directory")
			}

			if err = csv.ExtractAccounts(ctx, jsonStorage, csvStorage); err != nil {
				return err
			}

			return csv.ExtractTransactions(ctx, jsonStorage, csvStorage)
		},
	}
}
