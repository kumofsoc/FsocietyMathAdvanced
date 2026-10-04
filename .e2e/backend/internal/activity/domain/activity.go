package domain

import (
	"errors"
	"sort"
	"time"
)

type EventType string

const (
	EventTopicOpened     EventType = "topic_opened"
	EventTheoryCompleted EventType = "theory_completed"
	EventExerciseSolved  EventType = "exercise_solved"
	EventBookmarkAdded   EventType = "bookmark_added"
	EventSessionStarted  EventType = "session_started"
)

var (
	ErrInvalidRange = errors.New("invalid activity range")
	ErrInvalidDays  = errors.New("invalid activity days")
	ErrInvalidYear  = errors.New("invalid activity year")
)

type Event struct {
	ID         int64
	Type       EventType
	EntityID   *string
	TopicID    *string
	OccurredAt time.Time
}

type DayCount struct {
	Date  time.Time
	Count int
}

type HeatmapDay struct {
	Date  time.Time
	Count int
	Level int
}

type Stats struct {
	TotalEvents   int
	ActiveDays    int
	CurrentStreak int
	LongestStreak int
}

func HeatmapLevel(count int) int {
	switch {
	case count <= 0:
		return 0
	case count <= 2:
		return 1
	case count <= 5:
		return 2
	case count <= 9:
		return 3
	default:
		return 4
	}
}

func BuildHeatmap(year int, counts []DayCount) ([]HeatmapDay, error) {
	if year < 1970 || year > 2100 {
		return nil, ErrInvalidYear
	}
	start := time.Date(year, time.January, 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(1, 0, 0)

	byDate := make(map[string]int, len(counts))
	for _, item := range counts {
		day := dayUTC(item.Date)
		if day.Before(start) || !day.Before(end) {
			continue
		}
		byDate[day.Format("2006-01-02")] += item.Count
	}

	out := make([]HeatmapDay, 0, 366)
	for day := start; day.Before(end); day = day.AddDate(0, 0, 1) {
		count := byDate[day.Format("2006-01-02")]
		out = append(out, HeatmapDay{
			Date:  day,
			Count: count,
			Level: HeatmapLevel(count),
		})
	}
	return out, nil
}

func CalculateStats(start time.Time, days int, counts []DayCount) (Stats, error) {
	if days < 1 || days > 366 {
		return Stats{}, ErrInvalidDays
	}
	start = dayUTC(start)
	end := start.AddDate(0, 0, days)

	byDate := make(map[string]int, len(counts))
	for _, item := range counts {
		day := dayUTC(item.Date)
		if day.Before(start) || !day.Before(end) || item.Count <= 0 {
			continue
		}
		byDate[day.Format("2006-01-02")] += item.Count
	}

	var stats Stats
	var run int
	for i := 0; i < days; i++ {
		day := start.AddDate(0, 0, i)
		count := byDate[day.Format("2006-01-02")]
		if count > 0 {
			stats.TotalEvents += count
			stats.ActiveDays++
			run++
			if run > stats.LongestStreak {
				stats.LongestStreak = run
			}
		} else {
			run = 0
		}
	}

	lastDay := start.AddDate(0, 0, days-1)
	for day := lastDay; !day.Before(start); day = day.AddDate(0, 0, -1) {
		if byDate[day.Format("2006-01-02")] <= 0 {
			break
		}
		stats.CurrentStreak++
	}
	return stats, nil
}

func NormalizeDayCounts(counts []DayCount) []DayCount {
	merged := make(map[string]int, len(counts))
	for _, item := range counts {
		if item.Count <= 0 {
			continue
		}
		day := dayUTC(item.Date)
		merged[day.Format("2006-01-02")] += item.Count
	}
	keys := make([]string, 0, len(merged))
	for key := range merged {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	out := make([]DayCount, 0, len(keys))
	for _, key := range keys {
		day, _ := time.ParseInLocation("2006-01-02", key, time.UTC)
		out = append(out, DayCount{Date: day, Count: merged[key]})
	}
	return out
}

func dayUTC(value time.Time) time.Time {
	value = value.UTC()
	return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, time.UTC)
}
