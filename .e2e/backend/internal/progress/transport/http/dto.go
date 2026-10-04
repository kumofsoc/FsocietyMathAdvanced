package progresshttp

import (
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/domain"
)

type SnapshotResponse struct {
	Revision        int64              `json:"revision"`
	TheoryRead      []string           `json:"theoryRead"`
	SolvedTaskIDs   []string           `json:"solvedTaskIds"`
	SavedTheoremIDs []string           `json:"savedTheoremIds"`
	Reading         map[string]float64 `json:"reading"`
	ReadingProgress map[string]float64 `json:"readingProgress"`
	ReadingBlockIDs []string           `json:"readingBlockIds"`
	LastTopicID     *string            `json:"lastTopicId"`
	UpdatedAt       string             `json:"updatedAt"`
}

type TopicResponse struct {
	TopicID           string           `json:"topicId"`
	Opened            bool             `json:"opened"`
	ReadingRatio      float64          `json:"readingRatio"`
	TheoryComplete    bool             `json:"theoryComplete"`
	LastInteractionAt string           `json:"lastInteractionAt"`
	UpdatedAt         string           `json:"updatedAt"`
	Mastery           *MasteryResponse `json:"mastery,omitempty"`
}

type MasteryResponse struct {
	Total            int     `json:"total"`
	Reading          int     `json:"reading"`
	TheoryCheckpoint int     `json:"theoryCheckpoint"`
	Practice         int     `json:"practice"`
	ReadingRatio     float64 `json:"readingRatio"`
	PracticeRatio    float64 `json:"practiceRatio"`
	SolvedCount      int     `json:"solvedCount"`
	TaskCount        int     `json:"taskCount"`
	Stage            string  `json:"stage"`
}

type ResumeResponse struct {
	LastTopicID *string `json:"lastTopicId"`
	Revision    int64   `json:"revision"`
	UpdatedAt   string  `json:"updatedAt"`
}

func toSnapshotResponse(snapshot domain.Snapshot) SnapshotResponse {
	snapshot = snapshot.Normalize()
	updatedAt := ""
	if !snapshot.UpdatedAt.IsZero() {
		updatedAt = snapshot.UpdatedAt.UTC().Format(time.RFC3339)
	}
	return SnapshotResponse{
		Revision:        snapshot.Revision,
		TheoryRead:      snapshot.TheoryRead,
		SolvedTaskIDs:   snapshot.SolvedTaskIDs,
		SavedTheoremIDs: snapshot.SavedTheoremIDs,
		Reading:         snapshot.Reading,
		ReadingProgress: snapshot.Reading,
		ReadingBlockIDs: snapshot.ReadingBlockIDs,
		LastTopicID:     snapshot.LastTopicID,
		UpdatedAt:       updatedAt,
	}
}

func toTopicResponse(state domain.TopicState, mastery *domain.Mastery) TopicResponse {
	lastInteraction := ""
	if !state.LastInteractionAt.IsZero() {
		lastInteraction = state.LastInteractionAt.UTC().Format(time.RFC3339)
	}
	updatedAt := ""
	if !state.UpdatedAt.IsZero() {
		updatedAt = state.UpdatedAt.UTC().Format(time.RFC3339)
	}
	response := TopicResponse{
		TopicID:           state.TopicID,
		Opened:            state.OpenedAt != nil,
		ReadingRatio:      state.ReadingRatio,
		TheoryComplete:    state.TheoryCompletedAt != nil,
		LastInteractionAt: lastInteraction,
		UpdatedAt:         updatedAt,
	}
	if mastery != nil {
		response.Mastery = &MasteryResponse{
			Total:            mastery.Total,
			Reading:          mastery.Reading,
			TheoryCheckpoint: mastery.TheoryCheckpoint,
			Practice:         mastery.Practice,
			ReadingRatio:     mastery.ReadingRatio,
			PracticeRatio:    mastery.PracticeRatio,
			SolvedCount:      mastery.SolvedCount,
			TaskCount:        mastery.TaskCount,
			Stage:            mastery.Stage,
		}
	}
	return response
}

func toResumeResponse(snapshot domain.Snapshot) ResumeResponse {
	updatedAt := ""
	if !snapshot.UpdatedAt.IsZero() {
		updatedAt = snapshot.UpdatedAt.UTC().Format(time.RFC3339)
	}
	return ResumeResponse{LastTopicID: snapshot.LastTopicID, Revision: snapshot.Revision, UpdatedAt: updatedAt}
}
