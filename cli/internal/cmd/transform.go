package cmd

import (
	"context"

	"github.com/politicker/budgeted/internal/cmdutil"
	"github.com/politicker/budgeted/internal/csv"
	"github.com/spf13/cobra"
)

func TransformCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "transform",
		Short: "transform data from json to csv",
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonStorage, csvStorage, err := cmdutil.Dirs()
			if err != nil {
				return err
			}

			if err := csv.ExtractAccounts(ctx, jsonStorage, csvStorage); err != nil {
				return err
			}

			return csv.ExtractTransactions(ctx, jsonStorage, csvStorage)
		},
	}
}
