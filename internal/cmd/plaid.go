package cmd

import (
	"context"

	"github.com/spf13/cobra"
)

func PlaidCmd(ctx context.Context) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "plaid",
		Short: "plaid commands",
	}

	cmd.AddCommand(PlaidTokenCmd(ctx))

	return cmd
}
