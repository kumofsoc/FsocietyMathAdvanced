package cataloghttp

import (
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
	catalogservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/service"
)

type sourceResponse struct {
	Repository string `json:"repository"`
	Commit     string `json:"commit"`
}

type summaryResponse struct {
	SchemaVersion     int            `json:"schemaVersion"`
	Source            sourceResponse `json:"source"`
	ChapterCount      int            `json:"chapterCount"`
	TopicCount        int            `json:"topicCount"`
	ExerciseCount     int            `json:"exerciseCount"`
	ContentBlockCount int            `json:"contentBlockCount"`
}

type chapterResponse struct {
	ID       string   `json:"id"`
	Number   string   `json:"number"`
	Title    string   `json:"title"`
	TopicIDs []string `json:"topicIds"`
}

type topicSummaryResponse struct {
	ID        string `json:"id"`
	Number    string `json:"number"`
	Title     string `json:"title"`
	ChapterID string `json:"chapterId"`
	Summary   string `json:"summary"`
	IsStub    bool   `json:"isStub"`
}

type chapterDetailResponse struct {
	ID       string                 `json:"id"`
	Number   string                 `json:"number"`
	Title    string                 `json:"title"`
	TopicIDs []string               `json:"topicIds"`
	Topics   []topicSummaryResponse `json:"topics"`
}

type contentBlockResponse struct {
	ID    string `json:"id"`
	Index int    `json:"index"`
	Title string `json:"title"`
	Kind  string `json:"kind"`
}

type topicResponse struct {
	ID                        string                 `json:"id"`
	Number                    string                 `json:"number"`
	Title                     string                 `json:"title"`
	ChapterID                 string                 `json:"chapterId"`
	Summary                   string                 `json:"summary"`
	PrerequisiteIDs           []string               `json:"prerequisiteIds"`
	UnresolvedPrerequisiteIDs []string               `json:"unresolvedPrerequisiteIds"`
	IsStub                    bool                   `json:"isStub"`
	ExerciseIDs               []string               `json:"exerciseIds"`
	ContentBlocks             []contentBlockResponse `json:"contentBlocks"`
}

type prerequisitesResponse struct {
	Prerequisites             []topicSummaryResponse `json:"prerequisites"`
	UnresolvedPrerequisiteIDs []string               `json:"unresolvedPrerequisiteIds"`
}

func toSummaryResponse(value catalogservice.Summary) summaryResponse {
	return summaryResponse{
		SchemaVersion: value.SchemaVersion,
		Source: sourceResponse{
			Repository: value.SourceRepository,
			Commit:     value.SourceCommit,
		},
		ChapterCount:      value.ChapterCount,
		TopicCount:        value.TopicCount,
		ExerciseCount:     value.ExerciseCount,
		ContentBlockCount: value.ContentBlockCount,
	}
}

func toChapterResponse(value domain.Chapter) chapterResponse {
	return chapterResponse{
		ID:       value.ID,
		Number:   value.Number,
		Title:    value.Title,
		TopicIDs: nonNilStrings(value.TopicIDs),
	}
}

func toTopicSummaryResponse(value catalogservice.TopicSummary) topicSummaryResponse {
	return topicSummaryResponse{
		ID:        value.ID,
		Number:    value.Number,
		Title:     value.Title,
		ChapterID: value.ChapterID,
		Summary:   value.Summary,
		IsStub:    value.IsStub,
	}
}

func toChapterDetailResponse(value catalogservice.ChapterDetail) chapterDetailResponse {
	topics := make([]topicSummaryResponse, 0, len(value.Topics))
	for _, topic := range value.Topics {
		topics = append(topics, toTopicSummaryResponse(topic))
	}
	return chapterDetailResponse{
		ID:       value.ID,
		Number:   value.Number,
		Title:    value.Title,
		TopicIDs: nonNilStrings(value.TopicIDs),
		Topics:   topics,
	}
}

func toTopicResponse(value catalogservice.TopicDetail) topicResponse {
	blocks := make([]contentBlockResponse, 0, len(value.ContentBlocks))
	for _, block := range value.ContentBlocks {
		blocks = append(blocks, contentBlockResponse{
			ID: block.ID, Index: block.Index, Title: block.Title, Kind: block.Kind,
		})
	}
	return topicResponse{
		ID:                        value.ID,
		Number:                    value.Number,
		Title:                     value.Title,
		ChapterID:                 value.ChapterID,
		Summary:                   value.Summary,
		PrerequisiteIDs:           nonNilStrings(value.PrerequisiteIDs),
		UnresolvedPrerequisiteIDs: nonNilStrings(value.UnresolvedPrerequisiteIDs),
		IsStub:                    value.IsStub,
		ExerciseIDs:               nonNilStrings(value.ExerciseIDs),
		ContentBlocks:             blocks,
	}
}

func toPrerequisitesResponse(value catalogservice.Prerequisites) prerequisitesResponse {
	resolved := make([]topicSummaryResponse, 0, len(value.Resolved))
	for _, topic := range value.Resolved {
		resolved = append(resolved, toTopicSummaryResponse(topic))
	}
	return prerequisitesResponse{
		Prerequisites:             resolved,
		UnresolvedPrerequisiteIDs: nonNilStrings(value.UnresolvedIDs),
	}
}

func nonNilStrings(values []string) []string {
	if values == nil {
		return []string{}
	}
	out := make([]string, len(values))
	copy(out, values)
	return out
}
