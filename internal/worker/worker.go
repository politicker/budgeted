package worker

import (
	"context"
	"time"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

const pollDuration = 100 * time.Millisecond

type NewWorkerFn func(context.Context, *zap.Logger, *statsd.Client /* database connection, */, *redis.Client, int) Worker
type Worker interface {
	Start() error
	Stop()
}
