package activityhttp

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/domain"
	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

type ActivityService interface {
	List(context.Context, string, *time.Time, *time.Time) ([]domain.Event, error)
	Heatmap(context.Context, string, int) ([]domain.HeatmapDay, error)
	Stats(context.Context, string, int) (domain.Stats, error)
}

type Handler struct {
	activity ActivityService
	now      func() time.Time
}

func New(activity ActivityService, now func() time.Time) *Handler {
	if now == nil {
		now = time.Now
	}
	return &Handler{activity: activity, now: now}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	from, err := parseOptionalTime(r.URL.Query().Get("from"), false)
	if err != nil {
		writeActivityError(w, err)
		return
	}
	to, err := parseOptionalTime(r.URL.Query().Get("to"), true)
	if err != nil {
		writeActivityError(w, err)
		return
	}

	events, err := h.activity.List(r.Context(), userID, from, to)
	if err != nil {
		writeActivityError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, map[string]any{"events": toEvents(events)})
}

func (h *Handler) Heatmap(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	year := h.now().UTC().Year()
	if raw := strings.TrimSpace(r.URL.Query().Get("year")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			writeActivityError(w, domain.ErrInvalidYear)
			return
		}
		year = parsed
	}
	days, err := h.activity.Heatmap(r.Context(), userID, year)
	if err != nil {
		writeActivityError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toHeatmap(days))
}

func (h *Handler) Stats(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	days := 0
	if raw := strings.TrimSpace(r.URL.Query().Get("days")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			writeActivityError(w, domain.ErrInvalidDays)
			return
		}
		days = parsed
	}
	stats, err := h.activity.Stats(r.Context(), userID, days)
	if err != nil {
		writeActivityError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toStats(stats))
}

func parseOptionalTime(raw string, endOfDate bool) (*time.Time, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	if value, err := time.Parse(time.RFC3339, raw); err == nil {
		value = value.UTC()
		return &value, nil
	}
	value, err := time.ParseInLocation("2006-01-02", raw, time.UTC)
	if err != nil {
		return nil, domain.ErrInvalidRange
	}
	if endOfDate {
		value = value.AddDate(0, 0, 1)
	}
	return &value, nil
}

func authenticatedUserID(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return "", false
	}
	return userID, true
}

func writeActivityError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalidRange),
		errors.Is(err, domain.ErrInvalidDays),
		errors.Is(err, domain.ErrInvalidYear):
		httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid activity query", nil)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}
