package cmd

import (
	"context"

	"github.com/spf13/cobra"
)

func LoadCmd(ctx context.Context) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "load",
		Short: "load data",
	}

	cmd.AddCommand(LoadCsvCmd(ctx))
	cmd.AddCommand(LoadPlaidDataCmd(ctx))
	cmd.AddCommand(LoadSqliteCmd())

	return cmd
}
