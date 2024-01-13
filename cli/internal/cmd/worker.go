package cmd

import (
	"context"

	"github.com/spf13/cobra"
)

func WorkerCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "worker",
		Short: "Runs background jobs",
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
}
