package httpserver

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/config"
)

type Server struct {
	http *http.Server
}

func New(cfg config.Config, handler http.Handler) *Server {
	return &Server{http: &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.HTTPPort),
		Handler:           handler,
		ReadHeaderTimeout: cfg.ReadHeaderTimeout,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       cfg.IdleTimeout,
	}}
}

func (s *Server) Run() error {
	err := s.http.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		return nil
	}
	return err
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.http.Shutdown(ctx)
}
