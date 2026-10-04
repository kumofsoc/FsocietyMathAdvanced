package domain

import (
	"errors"
	"regexp"
	"strings"
	"time"
)

const (
	MaxTopicIDBytes        = 128
	MaxContentBlockIDBytes = 192
	MaxKindBytes           = 32
	MaxTitleBytes          = 300
)

var (
	ErrInvalidBookmark   = errors.New("invalid bookmark")
	ErrInvalidBookmarkID = errors.New("invalid bookmark id")
)

var uuidV4Pattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`)

type Bookmark struct {
	ID             string
	UserID         string
	TopicID        *string
	ContentBlockID string
	Kind           string
	Title          string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type CreateInput struct {
	TopicID        string
	ContentBlockID string
	Kind           string
	Title          string
}

func NormalizeCreate(input CreateInput) (CreateInput, error) {
	input.TopicID = strings.TrimSpace(input.TopicID)
	input.ContentBlockID = strings.TrimSpace(input.ContentBlockID)
	input.Kind = strings.TrimSpace(input.Kind)
	input.Title = strings.TrimSpace(input.Title)

	if invalidText(input.TopicID, MaxTopicIDBytes) ||
		invalidText(input.ContentBlockID, MaxContentBlockIDBytes) ||
		invalidText(input.Kind, MaxKindBytes) ||
		invalidText(input.Title, MaxTitleBytes) {
		return CreateInput{}, ErrInvalidBookmark
	}
	return input, nil
}

func NormalizeBookmarkID(value string) (string, error) {
	value = strings.TrimSpace(value)
	if !uuidV4Pattern.MatchString(value) {
		return "", ErrInvalidBookmarkID
	}
	return strings.ToLower(value), nil
}

func invalidText(value string, maxBytes int) bool {
	return value == "" || len([]byte(value)) > maxBytes
}
