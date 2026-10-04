package bookmarkshttp

import (
	"context"
	"errors"
	"net/http"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

const bookmarkBodyLimit = 32 << 10

type BookmarkService interface {
	List(context.Context, string) ([]domain.Bookmark, error)
	Create(context.Context, string, domain.CreateInput) (domain.Bookmark, bool, error)
	Delete(context.Context, string, string) error
}

type Handler struct {
	bookmarks BookmarkService
}

func New(bookmarks BookmarkService) *Handler {
	return &Handler{bookmarks: bookmarks}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	items, err := h.bookmarks.List(r.Context(), userID)
	if err != nil {
		writeBookmarkError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, map[string]any{"bookmarks": toBookmarkResponses(items)})
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	var body struct {
		TopicID        string `json:"topicId"`
		ContentBlockID string `json:"contentBlockId"`
		Kind           string `json:"kind"`
		Title          string `json:"title"`
	}
	if err := httputil.DecodeJSON(w, r, &body, bookmarkBodyLimit); err != nil {
		writeValidationError(w)
		return
	}

	item, created, err := h.bookmarks.Create(r.Context(), userID, domain.CreateInput{
		TopicID:        body.TopicID,
		ContentBlockID: body.ContentBlockID,
		Kind:           body.Kind,
		Title:          body.Title,
	})
	if err != nil {
		writeBookmarkError(w, err)
		return
	}

	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	httputil.WriteJSON(w, status, toBookmarkResponse(item))
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	if err := h.bookmarks.Delete(r.Context(), userID, r.PathValue("id")); err != nil {
		writeBookmarkError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func authenticatedUserID(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return "", false
	}
	return userID, true
}

func writeBookmarkError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalidBookmark),
		errors.Is(err, domain.ErrInvalidBookmarkID):
		writeValidationError(w)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func writeValidationError(w http.ResponseWriter) {
	httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid bookmark data", nil)
}
