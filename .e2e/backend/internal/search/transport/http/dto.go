package searchhttp

import (
	"math"

	searchdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/domain"
)

type response struct {
	Query   string           `json:"query"`
	Results []resultResponse `json:"results"`
}

type resultResponse struct {
	Type           string  `json:"type"`
	ID             string  `json:"id"`
	Title          string  `json:"title"`
	Subtitle       string  `json:"subtitle,omitempty"`
	Score          float64 `json:"score"`
	TopicID        string  `json:"topicId,omitempty"`
	ContentBlockID string  `json:"contentBlockId,omitempty"`
	BlockIndex     *int    `json:"blockIndex,omitempty"`
	Kind           string  `json:"kind,omitempty"`
}

func toResponse(query string, results []searchdomain.Result) response {
	out := make([]resultResponse, 0, len(results))
	for _, result := range results {
		out = append(out, resultResponse{
			Type:           result.Type,
			ID:             result.ID,
			Title:          result.Title,
			Subtitle:       result.Subtitle,
			Score:          math.Round(result.Score*10000) / 10000,
			TopicID:        result.TopicID,
			ContentBlockID: result.ContentBlockID,
			BlockIndex:     result.BlockIndex,
			Kind:           result.Kind,
		})
	}
	return response{Query: query, Results: out}
}
