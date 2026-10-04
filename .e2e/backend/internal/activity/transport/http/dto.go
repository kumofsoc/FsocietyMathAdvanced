package activityhttp

import (
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/domain"
)

type EventResponse struct {
	ID         int64            `json:"id"`
	Type       domain.EventType `json:"type"`
	EntityID   *string          `json:"entityId"`
	TopicID    *string          `json:"topicId"`
	OccurredAt string           `json:"occurredAt"`
}

type HeatmapDayResponse struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
	Level int    `json:"level"`
}

type HeatmapResponse struct {
	Days []HeatmapDayResponse `json:"days"`
}

type StatsResponse struct {
	TotalEvents   int `json:"totalEvents"`
	ActiveDays    int `json:"activeDays"`
	CurrentStreak int `json:"currentStreak"`
	LongestStreak int `json:"longestStreak"`
}

func toEvents(events []domain.Event) []EventResponse {
	out := make([]EventResponse, 0, len(events))
	for _, event := range events {
		out = append(out, EventResponse{
			ID:         event.ID,
			Type:       event.Type,
			EntityID:   event.EntityID,
			TopicID:    event.TopicID,
			OccurredAt: event.OccurredAt.UTC().Format(time.RFC3339),
		})
	}
	return out
}

func toHeatmap(days []domain.HeatmapDay) HeatmapResponse {
	out := make([]HeatmapDayResponse, 0, len(days))
	for _, day := range days {
		out = append(out, HeatmapDayResponse{
			Date:  day.Date.UTC().Format("2006-01-02"),
			Count: day.Count,
			Level: day.Level,
		})
	}
	return HeatmapResponse{Days: out}
}

func toStats(stats domain.Stats) StatsResponse {
	return StatsResponse{
		TotalEvents:   stats.TotalEvents,
		ActiveDays:    stats.ActiveDays,
		CurrentStreak: stats.CurrentStreak,
		LongestStreak: stats.LongestStreak,
	}
}
