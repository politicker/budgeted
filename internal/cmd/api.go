package cmd

import (
	"context"
	"database/sql"
	"github.com/redis/go-redis/v9"
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
			defer func(db *sql.DB) { _ = db.Close() }(db)

			r := cmdutil.NewRedisConnection(ctx)
			defer func(r *redis.Client) { _ = r.Close() }(r)

			a := api.NewAPI(ctx, logger, r, db)
			srv, err := a.Server(port)
			if err != nil {
				return err
			}

			go func() { _ = srv.ListenAndServe() }()

			logger.Info("API server started", zap.Int("port", port))

			<-ctx.Done()
			_ = srv.Shutdown(ctx)

			return nil
		},
	}

	return cmd
}
