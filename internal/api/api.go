package api

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/hbbb/go-backend-template/internal/plaid"
	"net"
	"net/http"
	"time"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/gofrs/uuid"
	"github.com/gorilla/mux"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

type API struct {
	logger     *zap.Logger
	statsd     *statsd.Client
	redis      *redis.Client
	db         *sql.DB
	httpClient *http.Client
	ctx        context.Context

	// TODO: Maybe add repositories here. Unclear if I like that pattern enough to do it
	// accountRepo      domain.AccountRepository
	// liveActivityRepo domain.LiveActivityRepository
}

func NewAPI(ctx context.Context, logger *zap.Logger, redis *redis.Client, db *sql.DB) *API {
	return &API{
		logger:     logger,
		redis:      redis,
		db:         db,
		httpClient: &http.Client{},
		ctx:        ctx,
	}
}

func (a *API) Server(port int) (*http.Server, error) {
	router, err := a.Routes()
	if err != nil {
		return nil, err
	}

	return &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: router,
	}, nil
}

func (a *API) Routes() (*mux.Router, error) {
	r := mux.NewRouter()

	r.HandleFunc("/health", a.healthCheckHandler).Methods("GET")

	if err := plaid.Routes(a.ctx, r.PathPrefix("/plaid").Subrouter()); err != nil {
		return nil, err
	}

	r.Use(a.loggingMiddleware)
	r.Use(a.requestIdMiddleware)

	return r, nil
}

func (a *API) requestIdMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := uuid.Must(uuid.NewV4()).String()
		w.Header().Set("X-Apollo-Request-Id", id)
		next.ServeHTTP(w, r)
	})
}

type LoggingResponseWriter struct {
	w          http.ResponseWriter
	statusCode int
	bytes      int
}

func (lrw *LoggingResponseWriter) Header() http.Header {
	return lrw.w.Header()
}

func (lrw *LoggingResponseWriter) Write(bb []byte) (int, error) {
	wb, err := lrw.w.Write(bb)
	lrw.bytes += wb
	return wb, err
}

func (lrw *LoggingResponseWriter) WriteHeader(statusCode int) {
	lrw.w.WriteHeader(statusCode)
	lrw.statusCode = statusCode
}

func (a *API) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip logging health checks
		if r.RequestURI == "/v1/health" {
			next.ServeHTTP(w, r)
			return
		}

		start := time.Now()
		lrw := &LoggingResponseWriter{w: w}

		// Call the next handler, which can be another middleware in the chain, or the final handler.
		next.ServeHTTP(lrw, r)

		duration := time.Since(start).Milliseconds()

		remoteAddr := r.Header.Get("X-Forwarded-For")
		if remoteAddr == "" {
			if ip, _, err := net.SplitHostPort(r.RemoteAddr); err != nil {
				remoteAddr = "unknown"
			} else {
				remoteAddr = ip
			}
		}

		fields := []zap.Field{
			zap.Int64("duration", duration),
			zap.String("method", r.Method),
			zap.String("remote#addr", remoteAddr),
			zap.Int("response#bytes", lrw.bytes),
			zap.Int("status", lrw.statusCode),
			zap.String("uri", r.RequestURI),
			zap.String("request#id", lrw.Header().Get("X-Apollo-Request-Id")),
		}

		if lrw.statusCode < 500 {
			a.logger.Info("", fields...)
		} else {
			err := lrw.Header().Get("X-API-Error")
			a.logger.Error(err, fields...)
		}

		tags := []string{fmt.Sprintf("status:%d", lrw.statusCode)}
		_ = a.statsd.Histogram("api.latency", float64(duration), nil, 1.0)
		_ = a.statsd.Incr("api.calls", tags, 1.0)
		if lrw.statusCode >= 500 {
			_ = a.statsd.Incr("api.errors", nil, 1.0)
		}
	})
}
