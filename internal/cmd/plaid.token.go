package cmd

import (
	"context"
	"errors"
	"github.com/politicker/budgeted/internal/plaid"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func PlaidTokenCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "token",
		Short: "create plaid access token",
		RunE: func(cmd *cobra.Command, args []string) error {
			publicToken := viper.GetString("plaid.public_token")

			if publicToken == "" {
				return errors.New("plaid.public_token is not set")
			}

			return plaid.ExchangeToken(ctx, publicToken)
		},
	}
}
