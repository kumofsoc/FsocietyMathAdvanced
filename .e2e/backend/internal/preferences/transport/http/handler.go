package preferenceshttp

import (
	"context"
	"errors"
	"net/http"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/domain"
	preferencesservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/service"
)

const preferencesBodyLimit = 32 << 10

type PreferencesService interface {
	Get(context.Context, string) (domain.Preferences, error)
	Replace(context.Context, string, domain.Input) (domain.Preferences, error)
}

type Handler struct {
	preferences PreferencesService
}

func New(preferences PreferencesService) *Handler {
	return &Handler{preferences: preferences}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	item, err := h.preferences.Get(r.Context(), userID)
	if err != nil {
		writePreferencesError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toResponse(item))
}

func (h *Handler) Replace(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	var body struct {
		ThemeName        string            `json:"themeName"`
		CustomTheme      map[string]string `json:"customTheme"`
		CursorMode       string            `json:"cursorMode"`
		MotionProfile    string            `json:"motionProfile"`
		SidebarCollapsed *bool             `json:"sidebarCollapsed"`
	}
	if err := httputil.DecodeJSON(w, r, &body, preferencesBodyLimit); err != nil || body.SidebarCollapsed == nil {
		writeValidationError(w)
		return
	}

	item, err := h.preferences.Replace(r.Context(), userID, domain.Input{
		ThemeName:        body.ThemeName,
		CustomTheme:      body.CustomTheme,
		CursorMode:       body.CursorMode,
		MotionProfile:    body.MotionProfile,
		SidebarCollapsed: *body.SidebarCollapsed,
	})
	if err != nil {
		writePreferencesError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toResponse(item))
}

type response struct {
	ThemeName        string            `json:"themeName"`
	CustomTheme      map[string]string `json:"customTheme"`
	CursorMode       string            `json:"cursorMode"`
	MotionProfile    string            `json:"motionProfile"`
	SidebarCollapsed bool              `json:"sidebarCollapsed"`
}

func toResponse(item domain.Preferences) response {
	return response{
		ThemeName:        item.ThemeName,
		CustomTheme:      item.CustomTheme,
		CursorMode:       item.CursorMode,
		MotionProfile:    item.MotionProfile,
		SidebarCollapsed: item.SidebarCollapsed,
	}
}

func authenticatedUserID(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return "", false
	}
	return userID, true
}

func writePreferencesError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, preferencesservice.ErrInvalidInput),
		errors.Is(err, domain.ErrInvalidPreferences):
		writeValidationError(w)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func writeValidationError(w http.ResponseWriter) {
	httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid preferences data", nil)
}
