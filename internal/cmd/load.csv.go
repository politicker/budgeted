package cmd

import (
	"context"
	"github.com/spf13/cobra"
)

func LoadCsvCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "load csv",
		Short: "load data into csv",
		RunE: func(cmd *cobra.Command, args []string) error {
			//return plaid.RunServer(ctx)
			return nil
		},
	}
}
