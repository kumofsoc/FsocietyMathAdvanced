package progresshttp

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	catalogdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/domain"
	progressservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/service"
)

const (
	syncBodyLimit             = 256 << 10
	readingBlockSyncBodyLimit = 1 << 20
	mutationBodyLimit         = 32 << 10
)

type ProgressService interface {
	Snapshot(context.Context, string) (domain.Snapshot, error)
	Topic(context.Context, string, string) (domain.TopicState, domain.Snapshot, error)
	Sync(context.Context, string, domain.SyncInput) (domain.Snapshot, error)
	PatchTopic(context.Context, string, string, domain.TopicPatch) (domain.Snapshot, error)
	SetTheoryCompletion(context.Context, string, string, bool) (domain.Snapshot, error)
	SetExercise(context.Context, string, string, string, bool) (domain.Snapshot, error)
	SetTheorem(context.Context, string, string, string, bool) (domain.Snapshot, error)
	SetResume(context.Context, string, string) (domain.Snapshot, error)
	MarkReadingBlock(context.Context, string, string, int) (domain.Snapshot, error)
	MergeReadingBlocks(context.Context, string, []domain.ReadingBlockRef) (domain.Snapshot, error)
}

type TopicCatalog interface {
	Topic(string) (catalogdomain.Topic, bool)
}

type Handler struct {
	progress ProgressService
	catalog  TopicCatalog
}

func New(progress ProgressService, catalogs ...TopicCatalog) *Handler {
	var catalog TopicCatalog
	if len(catalogs) > 0 {
		catalog = catalogs[0]
	}
	return &Handler{progress: progress, catalog: catalog}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	snapshot, err := h.progress.Snapshot(r.Context(), userID)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) Learning(w http.ResponseWriter, r *http.Request) {
	h.Get(w, r)
}

func (h *Handler) Topic(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	state, snapshot, err := h.progress.Topic(r.Context(), userID, r.PathValue("topicId"))
	if err != nil {
		writeProgressError(w, err)
		return
	}

	var mastery *domain.Mastery
	if h.catalog != nil {
		if topic, exists := h.catalog.Topic(state.TopicID); exists {
			value := domain.CalculateMastery(state, snapshot.SolvedTaskIDs, topic.ExerciseIDs)
			mastery = &value
		}
	}
	httputil.WriteJSON(w, http.StatusOK, toTopicResponse(state, mastery))
}

func (h *Handler) Sync(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	var body struct {
		TheoryRead      []string           `json:"theoryRead"`
		SolvedTaskIDs   []string           `json:"solvedTaskIds"`
		SavedTheoremIDs []string           `json:"savedTheoremIds"`
		Reading         map[string]float64 `json:"reading"`
		ReadingProgress map[string]float64 `json:"readingProgress"`
		LastTopicID     *string            `json:"lastTopicId"`
		ClientUpdatedAt *string            `json:"clientUpdatedAt"`
	}
	if err := httputil.DecodeJSON(w, r, &body, syncBodyLimit); err != nil {
		writeValidationError(w)
		return
	}

	reading := make(map[string]float64, len(body.Reading)+len(body.ReadingProgress))
	for id, ratio := range body.Reading {
		reading[id] = ratio
	}
	for id, ratio := range body.ReadingProgress {
		if previous, exists := reading[id]; !exists || ratio > previous {
			reading[id] = ratio
		}
	}

	var clientUpdatedAt *time.Time
	if body.ClientUpdatedAt != nil {
		parsed, err := time.Parse(time.RFC3339, *body.ClientUpdatedAt)
		if err != nil {
			writeValidationError(w)
			return
		}
		parsed = parsed.UTC()
		clientUpdatedAt = &parsed
	}

	snapshot, err := h.progress.Sync(r.Context(), userID, domain.SyncInput{
		TheoryRead:      body.TheoryRead,
		SolvedTaskIDs:   body.SolvedTaskIDs,
		SavedTheoremIDs: body.SavedTheoremIDs,
		Reading:         reading,
		LastTopicID:     body.LastTopicID,
		ClientUpdatedAt: clientUpdatedAt,
	})
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) MarkReadingBlock(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	blockIndex, err := strconv.Atoi(r.PathValue("blockIndex"))
	if err != nil || blockIndex < 0 {
		writeValidationError(w)
		return
	}

	snapshot, err := h.progress.MarkReadingBlock(
		r.Context(),
		userID,
		r.PathValue("topicId"),
		blockIndex,
	)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) SyncReadingBlocks(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	var body struct {
		Blocks []struct {
			TopicID    string `json:"topicId"`
			BlockIndex *int   `json:"blockIndex"`
		} `json:"blocks"`
	}
	if err := httputil.DecodeJSON(w, r, &body, readingBlockSyncBodyLimit); err != nil {
		writeValidationError(w)
		return
	}

	blocks := make([]domain.ReadingBlockRef, 0, len(body.Blocks))
	for _, block := range body.Blocks {
		if block.BlockIndex == nil {
			writeValidationError(w)
			return
		}
		blocks = append(blocks, domain.ReadingBlockRef{
			TopicID:    block.TopicID,
			BlockIndex: *block.BlockIndex,
		})
	}

	snapshot, err := h.progress.MergeReadingBlocks(r.Context(), userID, blocks)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) PatchTopic(w http.ResponseWriter, r *http.Request) {
	h.updateTopic(w, r)
}

func (h *Handler) PutTopic(w http.ResponseWriter, r *http.Request) {
	h.updateTopic(w, r)
}

func (h *Handler) updateTopic(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	var body struct {
		Opened         *bool    `json:"opened"`
		ReadingRatio   *float64 `json:"readingRatio"`
		TheoryComplete *bool    `json:"theoryComplete"`
	}
	if err := httputil.DecodeJSON(w, r, &body, mutationBodyLimit); err != nil {
		writeValidationError(w)
		return
	}

	snapshot, err := h.progress.PatchTopic(
		r.Context(),
		userID,
		r.PathValue("topicId"),
		domain.TopicPatch{
			Opened:         body.Opened,
			ReadingRatio:   body.ReadingRatio,
			TheoryComplete: body.TheoryComplete,
		},
	)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) CompleteTheory(w http.ResponseWriter, r *http.Request) {
	h.setTheory(w, r, true)
}

func (h *Handler) UncompleteTheory(w http.ResponseWriter, r *http.Request) {
	h.setTheory(w, r, false)
}

func (h *Handler) setTheory(w http.ResponseWriter, r *http.Request, completed bool) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	snapshot, err := h.progress.SetTheoryCompletion(r.Context(), userID, r.PathValue("topicId"), completed)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) PutExercise(w http.ResponseWriter, r *http.Request) {
	h.setExercise(w, r, true)
}

func (h *Handler) SolveExercise(w http.ResponseWriter, r *http.Request) {
	h.setExercise(w, r, true)
}

func (h *Handler) DeleteExercise(w http.ResponseWriter, r *http.Request) {
	h.setExercise(w, r, false)
}

func (h *Handler) setExercise(w http.ResponseWriter, r *http.Request, solved bool) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	topicID, ok := optionalTopicID(w, r)
	if !ok {
		return
	}
	pathID := r.PathValue("taskId")
	if pathID == "" {
		pathID = r.PathValue("exerciseId")
	}
	snapshot, err := h.progress.SetExercise(r.Context(), userID, pathID, topicID, solved)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) PutTheorem(w http.ResponseWriter, r *http.Request) {
	h.setTheorem(w, r, true)
}

func (h *Handler) DeleteTheorem(w http.ResponseWriter, r *http.Request) {
	h.setTheorem(w, r, false)
}

func (h *Handler) setTheorem(w http.ResponseWriter, r *http.Request, saved bool) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	topicID, ok := optionalTopicID(w, r)
	if !ok {
		return
	}
	snapshot, err := h.progress.SetTheorem(r.Context(), userID, r.PathValue("theoremId"), topicID, saved)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toSnapshotResponse(snapshot))
}

func (h *Handler) GetResume(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}
	snapshot, err := h.progress.Snapshot(r.Context(), userID)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toResumeResponse(snapshot))
}

func (h *Handler) PutResume(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(w, r)
	if !ok {
		return
	}

	var body struct {
		LastTopicID string `json:"lastTopicId"`
	}
	if err := httputil.DecodeJSON(w, r, &body, mutationBodyLimit); err != nil {
		writeValidationError(w)
		return
	}

	snapshot, err := h.progress.SetResume(r.Context(), userID, body.LastTopicID)
	if err != nil {
		writeProgressError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toResumeResponse(snapshot))
}

func authenticatedUserID(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return "", false
	}
	return userID, true
}

func optionalTopicID(w http.ResponseWriter, r *http.Request) (string, bool) {
	if r.Body == nil || r.ContentLength == 0 {
		return "", true
	}
	var body struct {
		TopicID string `json:"topicId"`
	}
	if err := httputil.DecodeJSON(w, r, &body, mutationBodyLimit); err != nil {
		writeValidationError(w)
		return "", false
	}
	return body.TopicID, true
}

func writeProgressError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, progressservice.ErrUnknownTopic):
		httputil.WriteError(w, http.StatusNotFound, "topic_not_found", "Topic not found", nil)
	case errors.Is(err, progressservice.ErrUnknownReadingBlock):
		httputil.WriteError(w, http.StatusNotFound, "reading_block_not_found", "Reading block not found", nil)
	case errors.Is(err, domain.ErrInvalidID),
		errors.Is(err, domain.ErrInvalidRatio),
		errors.Is(err, domain.ErrInvalidPatch),
		errors.Is(err, domain.ErrSyncLimit):
		writeValidationError(w)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func writeValidationError(w http.ResponseWriter) {
	httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid progress data", nil)
}
