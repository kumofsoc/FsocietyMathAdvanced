package httptransport

import (
	"context"
	"net/http"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

type HealthChecker interface {
	Ping(context.Context) error
}

type SystemHandler struct {
	db          HealthChecker
	environment string
}

func NewSystemHandler(db HealthChecker, environment string) *SystemHandler {
	return &SystemHandler{db: db, environment: environment}
}

func (h *SystemHandler) Health(w http.ResponseWriter, _ *http.Request) {
	httputil.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *SystemHandler) Ready(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := h.db.Ping(ctx); err != nil {
		httputil.WriteError(w, http.StatusServiceUnavailable, "not_ready", "Service dependencies are not ready", nil)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func (h *SystemHandler) Meta(w http.ResponseWriter, _ *http.Request) {
	httputil.WriteJSON(w, http.StatusOK, map[string]string{
		"service":     "visualmath-backend",
		"apiVersion":  "v1",
		"environment": h.environment,
	})
}
