package importantblockshttp

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	catalogdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/domain"
	importantservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/service"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

type ImportantBlocksService interface {
	List(context.Context, string) ([]domain.ImportantBlock, error)
	Put(context.Context, string, string, int) (domain.ImportantBlock, error)
	Delete(context.Context, string, string, int) error
}

type TopicCatalog interface {
	Topic(string) (catalogdomain.Topic, bool)
}

type Handler struct {
	important ImportantBlocksService
	catalog   TopicCatalog
}

func New(important ImportantBlocksService, catalog TopicCatalog) *Handler {
	return &Handler{important: important, catalog: catalog}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	items, err := h.important.List(r.Context(), userID)
	if err != nil {
		writeImportantError(w, err)
		return
	}

	out := make([]blockResponse, 0, len(items))
	for _, item := range items {
		response, ok := h.toResponse(item)
		if !ok {
			continue
		}
		out = append(out, response)
	}
	httputil.WriteJSON(w, http.StatusOK, map[string]any{"blocks": out})
}

func (h *Handler) Put(w http.ResponseWriter, r *http.Request) {
	userID, topicID, blockIndex, ok := blockAddress(w, r)
	if !ok {
		return
	}
	item, err := h.important.Put(r.Context(), userID, topicID, blockIndex)
	if err != nil {
		writeImportantError(w, err)
		return
	}
	out, ok := h.toResponse(item)
	if !ok {
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, out)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, topicID, blockIndex, ok := blockAddress(w, r)
	if !ok {
		return
	}
	if err := h.important.Delete(r.Context(), userID, topicID, blockIndex); err != nil {
		writeImportantError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type blockResponse struct {
	ID         string `json:"id"`
	TopicID    string `json:"topicId"`
	BlockIndex int    `json:"blockIndex"`
	TopicTitle string `json:"topicTitle"`
	BlockTitle string `json:"blockTitle"`
	Kind       string `json:"kind"`
	UpdatedAt  int64  `json:"updatedAt"`
}

func (h *Handler) toResponse(item domain.ImportantBlock) (blockResponse, bool) {
	topic, ok := h.catalog.Topic(item.TopicID)
	if !ok {
		return blockResponse{}, false
	}
	for _, block := range topic.ContentBlocks {
		if block.Index == item.BlockIndex && block.ID == item.ID() {
			return blockResponse{
				ID:         item.ID(),
				TopicID:    item.TopicID,
				BlockIndex: item.BlockIndex,
				TopicTitle: topic.Title,
				BlockTitle: block.Title,
				Kind:       block.Kind,
				UpdatedAt:  item.UpdatedAt.UnixMilli(),
			}, true
		}
	}
	return blockResponse{}, false
}

func blockAddress(w http.ResponseWriter, r *http.Request) (string, string, int, bool) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
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

func writeImportantError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, importantservice.ErrUnknownTopic):
		httputil.WriteError(w, http.StatusNotFound, "topic_not_found", "Topic not found", nil)
	case errors.Is(err, importantservice.ErrUnknownBlock):
		httputil.WriteError(w, http.StatusNotFound, "block_not_found", "Content block not found", nil)
	case errors.Is(err, importantservice.ErrInvalidInput),
		errors.Is(err, domain.ErrInvalidTopicID),
		errors.Is(err, domain.ErrInvalidBlockIndex):
		writeValidationError(w)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func writeValidationError(w http.ResponseWriter) {
	httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid important block data", nil)
}
