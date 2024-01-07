package cmd

import (
	"context"
	"errors"
	"github.com/politicker/budgeted/internal/plaid"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"log"
	"os"
	"path"
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

			sandboxSecret := ""

			if isSandBox {
				sandboxSecret = viper.GetString("plaid.sandbox_secret")
				if sandboxSecret == "" {
					return errors.New("plaid.sandbox_secret is not set")
				}
			}

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
				if err := os.MkdirAll(path.Join(jsonStorage, "transactions"), 0755); err != nil {
					return err
				}
				if err := os.MkdirAll(path.Join(jsonStorage, "accounts"), 0755); err != nil {
					return err
				}
			} else if err != nil {
				return err
			} else if !info.IsDir() {
				return errors.New("json storage is not a directory")
			}

			return plaid.LoadTransactions(ctx, accessToken, jsonStorage, sandboxSecret)
		},
	}

	command.PersistentFlags().Bool("sandbox", false, "Use sandbox credentials")

	return &command
}
