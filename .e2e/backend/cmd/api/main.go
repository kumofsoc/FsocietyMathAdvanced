package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/app"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/config"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/database"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httpserver"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		slog.Error("load config", "error", err)
		os.Exit(1)
	}

	logger := newLogger(cfg.LogLevel)
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	db, err := database.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("open database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	handler := app.Handler(app.Dependencies{Config: cfg, Logger: logger, DB: db})
	server := httpserver.New(cfg, handler)

	errCh := make(chan error, 1)
	go func() { errCh <- server.Run() }()
	logger.Info("server started", "port", cfg.HTTPPort, "environment", cfg.AppEnv)

	select {
	case err := <-errCh:
		if err != nil {
			logger.Error("server stopped unexpectedly", "error", err)
			os.Exit(1)
		}
	case <-ctx.Done():
		logger.Info("shutdown signal received")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
		os.Exit(1)
	}
	logger.Info("server stopped")
}

func newLogger(level string) *slog.Logger {
	var slogLevel slog.Level
	switch level {
	case "debug":
		slogLevel = slog.LevelDebug
	case "warn":
		slogLevel = slog.LevelWarn
	case "error":
		slogLevel = slog.LevelError
	default:
		slogLevel = slog.LevelInfo
	}
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slogLevel}))
}
