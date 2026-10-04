package usershttp

import (
	"errors"
	"net/http"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
	usersdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
	usersrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/repository"
	usersservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/service"
)

type Handler struct {
	users *usersservice.Service
}

func New(users *usersservice.Service) *Handler {
	return &Handler{users: users}
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return
	}
	user, err := h.users.Me(r.Context(), userID)
	if err != nil {
		writeUserError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, ToResponse(user))
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return
	}

	var body struct {
		DisplayName *string `json:"displayName"`
		Handle      *string `json:"handle"`
		Bio         *string `json:"bio"`
	}
	if err := httputil.DecodeJSON(w, r, &body, 32<<10); err != nil {
		httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid request body", nil)
		return
	}

	current, err := h.users.Me(r.Context(), userID)
	if err != nil {
		writeUserError(w, err)
		return
	}

	input := usersservice.UpdateProfileInput{
		DisplayName: current.Profile.DisplayName,
		Handle:      current.Profile.Handle,
		Bio:         current.Profile.Bio,
	}
	if body.DisplayName != nil {
		input.DisplayName = *body.DisplayName
	}
	if body.Handle != nil {
		input.Handle = *body.Handle
	}
	if body.Bio != nil {
		input.Bio = *body.Bio
	}

	user, err := h.users.UpdateProfile(r.Context(), userID, input)
	if err != nil {
		writeUserError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, ToResponse(user))
}

func writeUserError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, usersrepo.ErrNotFound):
		httputil.WriteError(w, http.StatusNotFound, "user_not_found", "User not found", nil)
	case errors.Is(err, usersrepo.ErrHandleTaken):
		httputil.WriteError(w, http.StatusConflict, "handle_taken", "Handle is already in use", nil)
	case errors.Is(err, usersdomain.ErrInvalidHandle),
		errors.Is(err, usersdomain.ErrInvalidDisplayName),
		errors.Is(err, usersdomain.ErrInvalidBio):
		httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid profile data", nil)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}
