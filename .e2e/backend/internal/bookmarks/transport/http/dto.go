package bookmarkshttp

import (
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/domain"
)

type bookmarkResponse struct {
	ID             string  `json:"id"`
	TopicID        *string `json:"topicId"`
	ContentBlockID string  `json:"contentBlockId"`
	Kind           string  `json:"kind"`
	Title          string  `json:"title"`
	CreatedAt      string  `json:"createdAt"`
	UpdatedAt      string  `json:"updatedAt"`
}

func toBookmarkResponse(item domain.Bookmark) bookmarkResponse {
	return bookmarkResponse{
		ID:             item.ID,
		TopicID:        item.TopicID,
		ContentBlockID: item.ContentBlockID,
		Kind:           item.Kind,
		Title:          item.Title,
		CreatedAt:      item.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:      item.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func toBookmarkResponses(items []domain.Bookmark) []bookmarkResponse {
	out := make([]bookmarkResponse, 0, len(items))
	for _, item := range items {
		out = append(out, toBookmarkResponse(item))
	}
	return out
}
