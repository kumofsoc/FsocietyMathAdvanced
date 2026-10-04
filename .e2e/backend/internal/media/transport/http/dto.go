package mediahttp

import (
	"fmt"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/domain"
)

type trackResponse struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Type       string `json:"type"`
	SizeBytes  int64  `json:"sizeBytes"`
	Position   int    `json:"position"`
	ContentURL string `json:"contentUrl"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

func toTrackResponse(track domain.Track) trackResponse {
	return trackResponse{
		ID:         track.ID,
		Name:       track.DisplayName,
		Type:       track.MIMEType,
		SizeBytes:  track.SizeBytes,
		Position:   track.Position,
		ContentURL: fmt.Sprintf("/api/v1/me/media/audio/%s/content", track.ID),
		CreatedAt:  track.CreatedAt.UTC().Format("2006-01-02T15:04:05.999999999Z07:00"),
		UpdatedAt:  track.UpdatedAt.UTC().Format("2006-01-02T15:04:05.999999999Z07:00"),
	}
}

func toTrackResponses(tracks []domain.Track) []trackResponse {
	out := make([]trackResponse, 0, len(tracks))
	for _, track := range tracks {
		out = append(out, toTrackResponse(track))
	}
	return out
}
