package noteshttp

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/domain"
	notesrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/repository"
	notesservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/service"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

const (
	noteBodyLimit       = 64 << 10
	defaultNotePageSize = 50
	maxNotePageSize     = 100
	maxNotePageOffset   = 10000
)

type NotesService interface {
	List(context.Context, string, int, int) ([]domain.Note, error)
	Get(context.Context, string, string, int) (domain.Note, error)
	Put(context.Context, string, string, int, string) (*domain.Note, error)
	Delete(context.Context, string, string, int) error
}

type Handler struct {
	notes NotesService
}

func New(notes NotesService) *Handler {
	return &Handler{notes: notes}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	limit, ok := boundedQueryInt(w, r, "limit", defaultNotePageSize, 1, maxNotePageSize)
	if !ok {
		return
	}
	offset, ok := boundedQueryInt(w, r, "offset", 0, 0, maxNotePageOffset)
	if !ok {
		return
	}

	items, err := h.notes.List(r.Context(), userID, limit+1, offset)
	if err != nil {
		writeNoteError(w, err)
		return
	}
	hasMore := len(items) > limit
	if hasMore {
		items = items[:limit]
	}
	out := make([]noteResponse, 0, len(items))
	for _, item := range items {
		out = append(out, toNoteResponse(item))
	}
	httputil.WriteJSON(w, http.StatusOK, map[string]any{
		"notes":   out,
		"limit":   limit,
		"offset":  offset,
		"hasMore": hasMore,
	})
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, topicID, blockIndex, ok := noteAddress(w, r)
	if !ok {
		return
	}
	item, err := h.notes.Get(r.Context(), userID, topicID, blockIndex)
	if err != nil {
		writeNoteError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toNoteResponse(item))
}

func (h *Handler) Put(w http.ResponseWriter, r *http.Request) {
	userID, topicID, blockIndex, ok := noteAddress(w, r)
	if !ok {
		return
	}
	var body struct {
		Text *string `json:"text"`
	}
	if err := httputil.DecodeJSON(w, r, &body, noteBodyLimit); err != nil || body.Text == nil {
		writeValidationError(w)
		return
	}

	item, err := h.notes.Put(r.Context(), userID, topicID, blockIndex, *body.Text)
	if err != nil {
		writeNoteError(w, err)
		return
	}
	if item == nil {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toNoteResponse(*item))
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, topicID, blockIndex, ok := noteAddress(w, r)
	if !ok {
		return
	}
	if err := h.notes.Delete(r.Context(), userID, topicID, blockIndex); err != nil {
		writeNoteError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type noteResponse struct {
	ID         string `json:"id"`
	TopicID    string `json:"topicId"`
	BlockIndex int    `json:"blockIndex"`
	Text       string `json:"text"`
	UpdatedAt  int64  `json:"updatedAt"`
}

func toNoteResponse(item domain.Note) noteResponse {
	return noteResponse{
		ID:         item.ID(),
		TopicID:    item.TopicID,
		BlockIndex: item.BlockIndex,
		Text:       item.Text,
		UpdatedAt:  item.UpdatedAt.UnixMilli(),
	}
}

func boundedQueryInt(
	w http.ResponseWriter,
	r *http.Request,
	name string,
	defaultValue int,
	minValue int,
	maxValue int,
) (int, bool) {
	raw := r.URL.Query().Get(name)
	if raw == "" {
		return defaultValue, true
	}
	value, err := strconv.Atoi(raw)
	if err != nil || value < minValue || value > maxValue {
		writeValidationError(w)
		return 0, false
	}
	return value, true
}

func noteAddress(w http.ResponseWriter, r *http.Request) (string, string, int, bool) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return "", "", 0, false
	}
	blockIndex, err := strconv.Atoi(r.PathValue("blockIndex"))
	if err != nil || blockIndex < 0 {
		writeValidationError(w)
		return "", "", 0, false
	}
	return userID, r.PathValue("topicId"), blockIndex, true
}

func authenticatedUserID(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return "", false
	}
	return userID, true
}

func writeNoteError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, notesrepo.ErrNotFound):
		httputil.WriteError(w, http.StatusNotFound, "note_not_found", "Note not found", nil)
	case errors.Is(err, notesservice.ErrUnknownTopic):
		httputil.WriteError(w, http.StatusNotFound, "topic_not_found", "Topic not found", nil)
	case errors.Is(err, notesservice.ErrUnknownBlock):
		httputil.WriteError(w, http.StatusNotFound, "block_not_found", "Content block not found", nil)
	case errors.Is(err, notesservice.ErrInvalidInput),
		errors.Is(err, domain.ErrInvalidTopicID),
		errors.Is(err, domain.ErrInvalidBlockIndex),
		errors.Is(err, domain.ErrInvalidNoteText):
		writeValidationError(w)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func writeValidationError(w http.ResponseWriter) {
	httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid note data", nil)
}
