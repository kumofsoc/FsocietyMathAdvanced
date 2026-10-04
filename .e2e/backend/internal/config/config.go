package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/domain"
)

type Config struct {
	AppEnv             string
	HTTPPort           int
	DatabaseURL        string
	JWTSecret          string
	JWTAccessTTL       time.Duration
	JWTRefreshTTL      time.Duration
	RefreshCookieName  string
	CORSAllowedOrigins []string
	LogLevel           string
	ReadHeaderTimeout  time.Duration
	ReadTimeout        time.Duration
	WriteTimeout       time.Duration
	IdleTimeout        time.Duration
	ShutdownTimeout    time.Duration
	MediaEnabled       bool
	MediaStoragePath   string
	MediaMaxAudioBytes int64
}

func Load() (Config, error) {
	cfg := Config{
		AppEnv:             envOr("APP_ENV", "local"),
		DatabaseURL:        strings.TrimSpace(os.Getenv("DATABASE_URL")),
		JWTSecret:          strings.TrimSpace(os.Getenv("JWT_SECRET")),
		RefreshCookieName:  envOr("REFRESH_COOKIE_NAME", "fsociety_refresh"),
		CORSAllowedOrigins: splitCSV(envOr("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
		LogLevel:           strings.ToLower(envOr("LOG_LEVEL", "info")),
		MediaStoragePath:   envOr("MEDIA_STORAGE_PATH", "./data/media"),
	}

	var err error
	if cfg.MediaEnabled, err = boolEnv("MEDIA_ENABLED", false); err != nil {
		return Config{}, err
	}
	if cfg.MediaMaxAudioBytes, err = int64Env("MEDIA_MAX_AUDIO_BYTES", domain.HardMaxAudioBytes); err != nil {
		return Config{}, err
	}
	if cfg.HTTPPort, err = intEnv("HTTP_PORT", 8080); err != nil {
		return Config{}, err
	}
	if cfg.JWTAccessTTL, err = durationEnv("JWT_ACCESS_TTL", 15*time.Minute); err != nil {
		return Config{}, err
	}
	if cfg.JWTRefreshTTL, err = durationEnv("JWT_REFRESH_TTL", 30*24*time.Hour); err != nil {
		return Config{}, err
	}
	if cfg.ReadHeaderTimeout, err = durationEnv("HTTP_READ_HEADER_TIMEOUT", 5*time.Second); err != nil {
		return Config{}, err
	}
	if cfg.ReadTimeout, err = durationEnv("HTTP_READ_TIMEOUT", 15*time.Second); err != nil {
		return Config{}, err
	}
	if cfg.WriteTimeout, err = durationEnv("HTTP_WRITE_TIMEOUT", 30*time.Second); err != nil {
		return Config{}, err
	}
	if cfg.IdleTimeout, err = durationEnv("HTTP_IDLE_TIMEOUT", 60*time.Second); err != nil {
		return Config{}, err
	}
	if cfg.ShutdownTimeout, err = durationEnv("HTTP_SHUTDOWN_TIMEOUT", 10*time.Second); err != nil {
		return Config{}, err
	}

	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) Validate() error {
	if c.HTTPPort < 1 || c.HTTPPort > 65535 {
		return fmt.Errorf("HTTP_PORT must be between 1 and 65535")
	}
	if strings.TrimSpace(c.DatabaseURL) == "" {
		return errors.New("DATABASE_URL is required")
	}
	if len(c.JWTSecret) < 32 {
		return errors.New("JWT_SECRET must contain at least 32 bytes")
	}
	if c.JWTAccessTTL <= 0 {
		return errors.New("JWT_ACCESS_TTL must be positive")
	}
	if c.JWTRefreshTTL <= c.JWTAccessTTL {
		return errors.New("JWT_REFRESH_TTL must be greater than JWT_ACCESS_TTL")
	}
	if strings.TrimSpace(c.RefreshCookieName) == "" {
		return errors.New("REFRESH_COOKIE_NAME is required")
	}
	if len(c.CORSAllowedOrigins) == 0 {
		return errors.New("CORS_ALLOWED_ORIGINS must contain at least one origin")
	}
	for _, origin := range c.CORSAllowedOrigins {
		if origin == "*" && c.AppEnv == "production" {
			return errors.New("wildcard CORS origin is forbidden in production")
		}
	}
	if c.MediaMaxAudioBytes <= 0 || c.MediaMaxAudioBytes > domain.HardMaxAudioBytes {
		return fmt.Errorf("MEDIA_MAX_AUDIO_BYTES must be between 1 and %d", domain.HardMaxAudioBytes)
	}
	if c.MediaEnabled && strings.TrimSpace(c.MediaStoragePath) == "" {
		return errors.New("MEDIA_STORAGE_PATH is required when media is enabled")
	}
	return nil
}

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func boolEnv(key string, fallback bool) (bool, error) {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.ParseBool(raw)
	if err != nil {
		return false, fmt.Errorf("%s must be a boolean: %w", key, err)
	}
	return value, nil
}

func int64Env(key string, fallback int64) (int64, error) {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", key, err)
	}
	return value, nil
}

func intEnv(key string, fallback int) (int, error) {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", key, err)
	}
	return value, nil
}

func durationEnv(key string, fallback time.Duration) (time.Duration, error) {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback, nil
	}
	value, err := time.ParseDuration(raw)
	if err != nil {
		return 0, fmt.Errorf("%s must be a duration: %w", key, err)
	}
	return value, nil
}

func splitCSV(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if value := strings.TrimSpace(part); value != "" {
			out = append(out, value)
		}
	}
	return out
}
