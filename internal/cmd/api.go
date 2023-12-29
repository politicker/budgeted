package cmd

import (
	"context"
	"os"
	"strconv"

	"github.com/hbbb/go-backend-template/internal/api"
	"github.com/hbbb/go-backend-template/internal/cmdutil"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

func APICmd(ctx context.Context) *cobra.Command {
	var port int

	cmd := &cobra.Command{
		Use:   "api",
		Args:  cobra.ExactArgs(0),
		Short: "Start the API server",
		RunE: func(cmd *cobra.Command, args []string) error {
			port = 4000
			if os.Getenv("PORT") != "" {
				port, _ = strconv.Atoi(os.Getenv("PORT"))
			}

			logger := cmdutil.NewLogger("api")
			defer func() { _ = logger.Sync() }()

			db, err := cmdutil.NewDBConnection(ctx)
			if err != nil {
				return err
			}
			defer db.Close()

			redis := cmdutil.NewRedisConnection(ctx)
			defer redis.Close()

			api := api.NewAPI(ctx, logger, redis, db)
			srv := api.Server(port)

			go func() { _ = srv.ListenAndServe() }()

			logger.Info("API server started", zap.Int("port", port))

			<-ctx.Done()
			_ = srv.Shutdown(ctx)

			return nil
		},
	}

	return cmd
}
