package cmd

import (
	"context"
	"errors"
	"github.com/politicker/budgeted/internal/plaid"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"log"
	"os"
)

func LoadPlaidDataCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "plaid-data",
		Short: "load data from plaid",
		RunE: func(cmd *cobra.Command, args []string) error {
			accessToken := viper.GetString("plaid.access_token")
			if accessToken == "" {
				return errors.New("plaid.access_token is not set")
			}

			jsonStorage := viper.GetString("storage.json")
			if jsonStorage == "" {
				return errors.New("storage.json is not set")
			}

			info, err := os.Stat(jsonStorage)

			if os.IsNotExist(err) {
				log.Println("creating json storage directory", jsonStorage)
				err := os.MkdirAll(jsonStorage, 0755)
				if err != nil {
					return err
				}
			} else if err != nil {
				return err
			} else if !info.IsDir() {
				return errors.New("json storage is not a directory")
			}

			return plaid.LoadTransactions(ctx, accessToken, jsonStorage)
		},
	}
}
