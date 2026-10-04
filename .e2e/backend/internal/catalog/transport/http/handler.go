package cataloghttp

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	catalogservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/service"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

const cacheControl = "public, max-age=300, stale-while-revalidate=86400"

type Service interface {
	Summary() catalogservice.Summary
	Chapters() []domain.Chapter
	Chapter(string) (catalogservice.ChapterDetail, error)
	Topic(string) (catalogservice.TopicDetail, error)
	Prerequisites(string) (catalogservice.Prerequisites, error)
}

type Handler struct {
	service Service
	summary catalogservice.Summary
}

func New(service Service) *Handler {
	return &Handler{
		service: service,
		summary: service.Summary(),
	}
}

func (h *Handler) Summary(w http.ResponseWriter, r *http.Request) {
	if h.notModified(w, r, "summary") {
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSummaryResponse(h.summary))
}

func (h *Handler) Chapters(w http.ResponseWriter, r *http.Request) {
	if h.notModified(w, r, "chapters") {
		return
	}

	chapters := h.service.Chapters()
	response := make([]chapterResponse, 0, len(chapters))
	for _, chapter := range chapters {
		response = append(response, toChapterResponse(chapter))
	}
	httputil.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) Chapter(w http.ResponseWriter, r *http.Request) {
	chapterID := r.PathValue("chapterId")
	value, err := h.service.Chapter(chapterID)
	if err != nil {
		writeCatalogError(w, err)
		return
	}
	if h.notModified(w, r, "chapter:"+chapterID) {
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toChapterDetailResponse(value))
}

func (h *Handler) Topic(w http.ResponseWriter, r *http.Request) {
	topicID := r.PathValue("topicId")
	value, err := h.service.Topic(topicID)
	if err != nil {
		writeCatalogError(w, err)
		return
	}
	if h.notModified(w, r, "topic:"+topicID) {
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toTopicResponse(value))
}

func (h *Handler) Prerequisites(w http.ResponseWriter, r *http.Request) {
	topicID := r.PathValue("topicId")
	value, err := h.service.Prerequisites(topicID)
	if err != nil {
		writeCatalogError(w, err)
		return
	}
	if h.notModified(w, r, "prerequisites:"+topicID) {
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toPrerequisitesResponse(value))
}

func (h *Handler) notModified(w http.ResponseWriter, r *http.Request, resourceKey string) bool {
	etag := buildETag(h.summary, resourceKey)
	w.Header().Set("Cache-Control", cacheControl)
	w.Header().Set("ETag", etag)

	if !matchesETag(r.Header.Get("If-None-Match"), etag) {
		return false
	}
	w.WriteHeader(http.StatusNotModified)
	return true
}

func matchesETag(header, etag string) bool {
	for _, candidate := range strings.Split(header, ",") {
		candidate = strings.TrimSpace(candidate)
		if candidate == "*" || candidate == etag {
			return true
		}
	}
	return false
}

func buildETag(summary catalogservice.Summary, resourceKey string) string {
	raw := summary.SourceRepository + ":" +
		summary.SourceCommit + ":" +
		strconv.Itoa(summary.SchemaVersion) + ":" +
		resourceKey
	sum := sha256.Sum256([]byte(raw))
	return `"` + hex.EncodeToString(sum[:16]) + `"`
}

func writeCatalogError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, catalogservice.ErrChapterNotFound):
		httputil.WriteError(w, http.StatusNotFound, "chapter_not_found", "Chapter not found", nil)
	case errors.Is(err, catalogservice.ErrTopicNotFound):
		httputil.WriteError(w, http.StatusNotFound, "topic_not_found", "Topic not found", nil)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}
