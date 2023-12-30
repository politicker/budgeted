package cmd

import (
	"context"
	"github.com/hbbb/go-backend-template/internal/plaid"
	"github.com/spf13/cobra"
)

func PlaidServerCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "plaid server",
		Short: "Loads plaid UI",
		RunE: func(cmd *cobra.Command, args []string) error {
			return plaid.RunServer(ctx)
		},
	}
}
