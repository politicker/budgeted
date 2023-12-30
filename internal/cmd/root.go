package cmd

import (
	"context"
	"errors"
	"github.com/spf13/viper"
	_ "net/http/pprof"
	"os"
	"runtime"
	"runtime/pprof"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

func Execute(ctx context.Context) error {
	_ = godotenv.Load()

	profile := false

	viper.SetConfigName("config")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()
	err := viper.ReadInConfig()
	if err != nil {
		return err
	}

	if viper.GetString("plaid.client_id") == "" {
		return errors.New("plaid.client_id is not set")
	}

	if viper.GetString("plaid.secret") == "" {
		return errors.New("plaid.secret is not set")
	}

	rootCmd := &cobra.Command{
		Use:   "go-backend-template",
		Short: "Put a description of the service here",
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			if !profile {
				return nil
			}

			f, perr := os.Create("cpu.pprof")
			if perr != nil {
				return perr
			}

			_ = pprof.StartCPUProfile(f)
			return nil
		},
		PersistentPostRunE: func(cmd *cobra.Command, args []string) error {
			if !profile {
				return nil
			}

			pprof.StopCPUProfile()

			f, perr := os.Create("mem.pprof")
			if perr != nil {
				return perr
			}
			defer func(f *os.File) {
				_ = f.Close()
			}(f)

			runtime.GC()
			err := pprof.WriteHeapProfile(f)
			return err
		},
	}

	rootCmd.PersistentFlags().BoolVarP(&profile, "profile", "p", false, "record CPU pprof")

	rootCmd.AddCommand(APICmd(ctx))
	rootCmd.AddCommand(SchedulerCmd(ctx))
	rootCmd.AddCommand(WorkerCmd(ctx))
	rootCmd.AddCommand(CheckCmd(ctx))
	rootCmd.AddCommand(PlaidServerCmd(ctx))

	// I'm not sure what this is for.
	// go func() {
	// 	_ = http.ListenAndServe("localhost:6060", nil)
	// }()

	if err := rootCmd.Execute(); err != nil {
		return err
	}

	return nil
}
