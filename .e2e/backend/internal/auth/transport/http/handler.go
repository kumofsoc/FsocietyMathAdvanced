package authhttp

import (
	"errors"
	"net"
	"net/http"
	"time"

	authrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/repository"
	authservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/service"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
	usersrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/repository"
	usershttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/transport/http"
)

type CookieConfig struct {
	Name   string
	TTL    time.Duration
	Secure bool
}

type Handler struct {
	auth   *authservice.Service
	cookie CookieConfig
}

type authResponse struct {
	AccessToken     string                 `json:"accessToken"`
	AccessExpiresAt string                 `json:"accessTokenExpiresAt"`
	User            usershttp.UserResponse `json:"user"`
}

func New(auth *authservice.Service, cookie CookieConfig) *Handler {
	return &Handler{auth: auth, cookie: cookie}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email       string `json:"email"`
		Password    string `json:"password"`
		Handle      string `json:"handle"`
		DisplayName string `json:"displayName"`
		Bio         string `json:"bio"`
	}
	if err := httputil.DecodeJSON(w, r, &body, 32<<10); err != nil {
		httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid request body", nil)
		return
	}

	result, refresh, err := h.auth.Register(r.Context(), authservice.RegisterInput{
		Email:       body.Email,
		Password:    body.Password,
		Handle:      body.Handle,
		DisplayName: body.DisplayName,
		Bio:         body.Bio,
		UserAgent:   r.UserAgent(),
		IPAddress:   remoteIP(r.RemoteAddr),
	})
	if err != nil {
		writeAuthError(w, err)
		return
	}

	h.setRefreshCookie(w, refresh)
	httputil.WriteJSON(w, http.StatusCreated, toAuthResponse(result))
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := httputil.DecodeJSON(w, r, &body, 16<<10); err != nil {
		httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid request body", nil)
		return
	}

	result, refresh, err := h.auth.Login(r.Context(), authservice.LoginInput{
		Email:     body.Email,
		Password:  body.Password,
		UserAgent: r.UserAgent(),
		IPAddress: remoteIP(r.RemoteAddr),
	})
	if err != nil {
		writeAuthError(w, err)
		return
	}

	h.setRefreshCookie(w, refresh)
	httputil.WriteJSON(w, http.StatusOK, toAuthResponse(result))
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(h.cookie.Name)
	if err != nil || cookie.Value == "" {
		h.clearRefreshCookie(w)
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Refresh token is missing", nil)
		return
	}

	result, refresh, err := h.auth.Refresh(r.Context(), cookie.Value)
	if err != nil {
		h.clearRefreshCookie(w)
		writeAuthError(w, err)
		return
	}

	h.setRefreshCookie(w, refresh)
	httputil.WriteJSON(w, http.StatusOK, toAuthResponse(result))
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(h.cookie.Name); err == nil && cookie.Value != "" {
		if err := h.auth.Logout(r.Context(), cookie.Value); err != nil {
			httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
			return
		}
	}
	h.clearRefreshCookie(w)
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) setRefreshCookie(w http.ResponseWriter, value string) {
	http.SetCookie(w, &http.Cookie{
		Name:     h.cookie.Name,
		Value:    value,
		Path:     "/api/v1/auth",
		MaxAge:   int(h.cookie.TTL.Seconds()),
		HttpOnly: true,
		Secure:   h.cookie.Secure,
		SameSite: http.SameSiteLaxMode,
	})
}

func (h *Handler) clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     h.cookie.Name,
		Value:    "",
		Path:     "/api/v1/auth",
		MaxAge:   -1,
		Expires:  time.Unix(1, 0).UTC(),
		HttpOnly: true,
		Secure:   h.cookie.Secure,
		SameSite: http.SameSiteLaxMode,
	})
}

func toAuthResponse(result authservice.Result) authResponse {
	return authResponse{
		AccessToken:     result.AccessToken,
		AccessExpiresAt: result.AccessExpiresAt.UTC().Format(time.RFC3339),
		User:            usershttp.ToResponse(result.User),
	}
}

func writeAuthError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, authservice.ErrInvalidInput):
		httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid account data", nil)
	case errors.Is(err, usersrepo.ErrEmailTaken):
		httputil.WriteError(w, http.StatusConflict, "email_taken", "Email is already registered", nil)
	case errors.Is(err, usersrepo.ErrHandleTaken):
		httputil.WriteError(w, http.StatusConflict, "handle_taken", "Handle is already in use", nil)
	case errors.Is(err, authservice.ErrInvalidCredentials):
		httputil.WriteError(w, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password", nil)
	case errors.Is(err, authservice.ErrDisabled):
		httputil.WriteError(w, http.StatusForbidden, "account_disabled", "Account is disabled", nil)
	case errors.Is(err, authservice.ErrUnauthorized),
		errors.Is(err, authrepo.ErrRefreshInvalid),
		errors.Is(err, authrepo.ErrRefreshReuse):
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication failed", nil)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func remoteIP(remoteAddr string) string {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err == nil {
		return host
	}
	return remoteAddr
}
