package cmdutil

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"os"
	"path"
	"path/filepath"

	"go.uber.org/zap"

	_ "github.com/lib/pq"
	"github.com/politicker/budgeted/internal/cmdutil"
	"github.com/redis/go-redis/v9"
)

func NewLogger(service string) *zap.Logger {
	env := os.Getenv("ENV")
	logger, _ := zap.NewProduction(zap.Fields(
		zap.String("env", env),
		zap.String("service", service),
	))

	if env == "" || env == "development" {
		logger, _ = zap.NewDevelopment()
	}

	return logger
}

func NewDBConnection(ctx context.Context) (*sql.DB, error) {
	db, err := sql.Open("postgres", "")
	if err != nil {
		return nil, err
	}

	return db, nil
}

func NewRedisConnection(ctx context.Context) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	return rdb
}

func Dirs() (string, string, error) {
	jsonStorage := filepath.Join(cmdutil.ConfigDir(), "json")
	info, err := os.Stat(jsonStorage)
	if os.IsNotExist(err) {
		log.Println("creating json storage directory", jsonStorage)
		if err := os.MkdirAll(path.Join(jsonStorage, "transactions"), 0755); err != nil {
			return "", "", err
		}
		if err := os.MkdirAll(path.Join(jsonStorage, "accounts"), 0755); err != nil {
			return "", "", err
		}
	} else if err != nil {
		return "", "", err
	} else if !info.IsDir() {
		return "", "", errors.New("json storage is not a directory")
	}

	csvStorage := filepath.Join(ConfigDir(), "csv")
	info, err = os.Stat(csvStorage)
	if os.IsNotExist(err) {
		log.Println("creating csv storage directory", jsonStorage)
		if err := os.MkdirAll(csvStorage, 0755); err != nil {
			return "", "", err
		}
	} else if err != nil {
		return "", "", err
	} else if !info.IsDir() {
		return "", "", errors.New("csv storage is not a directory")
	}

	return jsonStorage, csvStorage, nil
}

func ConfigDir() string {
	configDir := os.Getenv("CONFIG_DIR")
	if configDir != "" {
		return configDir
	}

	if os.Getenv("APPDATA") != "" {
		return path.Join(os.Getenv("APPDATA"), "budgeted")
	}

	return path.Join(os.Getenv("HOME"), ".config", "budgeted")
}
