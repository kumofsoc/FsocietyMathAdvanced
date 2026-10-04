package domain

import (
	"errors"
	"strings"
	"time"
)

const MaxTopicIDBytes = 128

var (
	ErrInvalidTopicID      = errors.New("invalid topic id")
	ErrInvalidBlockIndex   = errors.New("invalid block index")
	ErrInvalidReadingWidth = errors.New("invalid reading width")
)

type ResumeEntry struct {
	BlockIndex int
	UpdatedAt  time.Time
}

type Snapshot struct {
	SavedTopicIDs []string
	TopicResume   map[string]ResumeEntry
	ReadingWidth  string
}

func (s Snapshot) Normalize() Snapshot {
	out := Snapshot{
		SavedTopicIDs: append([]string(nil), s.SavedTopicIDs...),
		TopicResume:   make(map[string]ResumeEntry, len(s.TopicResume)),
		ReadingWidth:  s.ReadingWidth,
	}
	if out.ReadingWidth == "" {
		out.ReadingWidth = "normal"
	}
	for topicID, entry := range s.TopicResume {
		out.TopicResume[topicID] = entry
	}
	return out
}

func NormalizeTopicID(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" || len([]byte(value)) > MaxTopicIDBytes {
		return "", ErrInvalidTopicID
	}
	return value, nil
}

func NormalizeReadingWidth(value string) (string, error) {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "narrow", "normal", "wide":
		return value, nil
	default:
		return "", ErrInvalidReadingWidth
	}
}

func ValidateBlockIndex(value int) error {
	if value < 0 {
		return ErrInvalidBlockIndex
	}
	return nil
}
