package searchhttp

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
	searchdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/domain"
	searchservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/service"
)

type Service interface {
	Search(string, int) ([]searchdomain.Result, error)
}

type Handler struct {
	service Service
}

func New(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	limit := searchservice.DefaultLimit

	if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
		parsed, err := strconv.Atoi(rawLimit)
		if err != nil {
			httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid search limit", nil)
			return
		}
		limit = parsed
	}

	results, err := h.service.Search(query, limit)
	if err != nil {
		switch {
		case errors.Is(err, searchservice.ErrInvalidQuery):
			httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Search query must contain between 1 and 128 characters", nil)
		case errors.Is(err, searchservice.ErrInvalidLimit):
			httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Search limit must be between 1 and 50", nil)
		default:
			httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
		}
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=60")
	httputil.WriteJSON(w, http.StatusOK, toResponse(query, results))
}
