package workspacehttp

import (
	"context"
	"errors"
	"net/http"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/domain"
	workspaceservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/service"
)

const workspaceBodyLimit = 32 << 10

type WorkspaceService interface {
	Snapshot(context.Context, string) (domain.Snapshot, error)
	SetTopicSaved(context.Context, string, string, bool) (domain.Snapshot, error)
	SetResume(context.Context, string, string, int) (domain.Snapshot, error)
	SetReadingWidth(context.Context, string, string) (domain.Snapshot, error)
}

type Handler struct {
	workspace WorkspaceService
}

func New(workspace WorkspaceService) *Handler {
	return &Handler{workspace: workspace}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	snapshot, err := h.workspace.Snapshot(r.Context(), userID)
	if err != nil {
		writeWorkspaceError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) SaveTopic(w http.ResponseWriter, r *http.Request) {
	h.setTopicSaved(w, r, true)
}

func (h *Handler) UnsaveTopic(w http.ResponseWriter, r *http.Request) {
	h.setTopicSaved(w, r, false)
}

func (h *Handler) setTopicSaved(w http.ResponseWriter, r *http.Request, saved bool) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	snapshot, err := h.workspace.SetTopicSaved(r.Context(), userID, r.PathValue("topicId"), saved)
	if err != nil {
		writeWorkspaceError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) SetResume(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	var body struct {
		BlockIndex *int `json:"blockIndex"`
	}
	if err := httputil.DecodeJSON(w, r, &body, workspaceBodyLimit); err != nil || body.BlockIndex == nil {
		writeValidationError(w)
		return
	}
	snapshot, err := h.workspace.SetResume(r.Context(), userID, r.PathValue("topicId"), *body.BlockIndex)
	if err != nil {
		writeWorkspaceError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) SetReadingWidth(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	var body struct {
		ReadingWidth *string `json:"readingWidth"`
	}
	if err := httputil.DecodeJSON(w, r, &body, workspaceBodyLimit); err != nil || body.ReadingWidth == nil {
		writeValidationError(w)
		return
	}
	snapshot, err := h.workspace.SetReadingWidth(r.Context(), userID, *body.ReadingWidth)
	if err != nil {
		writeWorkspaceError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

type resumeResponse struct {
	BlockIndex int   `json:"blockIndex"`
	UpdatedAt  int64 `json:"updatedAt"`
}

type snapshotResponse struct {
	SavedTopicIDs []string                  `json:"savedTopicIds"`
	TopicResume   map[string]resumeResponse `json:"topicResume"`
	ReadingWidth  string                    `json:"readingWidth"`
}

func toSnapshotResponse(snapshot domain.Snapshot) snapshotResponse {
	snapshot = snapshot.Normalize()
	resume := make(map[string]resumeResponse, len(snapshot.TopicResume))
	for topicID, entry := range snapshot.TopicResume {
		resume[topicID] = resumeResponse{
			BlockIndex: entry.BlockIndex,
			UpdatedAt:  entry.UpdatedAt.UnixMilli(),
		}
	}
	return snapshotResponse{
		SavedTopicIDs: snapshot.SavedTopicIDs,
		TopicResume:   resume,
		ReadingWidth:  snapshot.ReadingWidth,
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

func writeWorkspaceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, workspaceservice.ErrUnknownTopic):
		httputil.WriteError(w, http.StatusNotFound, "topic_not_found", "Topic not found", nil)
	case errors.Is(err, workspaceservice.ErrInvalidInput),
		errors.Is(err, domain.ErrInvalidTopicID),
		errors.Is(err, domain.ErrInvalidBlockIndex),
		errors.Is(err, domain.ErrInvalidReadingWidth):
		writeValidationError(w)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func writeValidationError(w http.ResponseWriter) {
	httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid workspace data", nil)
}
