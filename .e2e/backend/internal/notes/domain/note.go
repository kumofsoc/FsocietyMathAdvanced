package domain

import (
	"errors"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

const (
	MaxTopicIDBytes = 128
	MaxNoteRunes    = 10000
)

var (
	ErrInvalidTopicID    = errors.New("invalid topic id")
	ErrInvalidBlockIndex = errors.New("invalid block index")
	ErrInvalidNoteText   = errors.New("invalid note text")
)

type Note struct {
	TopicID    string
	BlockIndex int
	Text       string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (n Note) ID() string {
	return n.TopicID + "::" + strconv.Itoa(n.BlockIndex)
}

func NormalizeTopicID(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" || len([]byte(value)) > MaxTopicIDBytes {
		return "", ErrInvalidTopicID
	}
	return value, nil
}

func ValidateBlockIndex(value int) error {
	if value < 0 {
		return ErrInvalidBlockIndex
	}
	return nil
}

func NormalizeText(value string) (string, error) {
	value = strings.ReplaceAll(value, "\r\n", "\n")
	value = strings.ReplaceAll(value, "\r", "\n")
	if strings.TrimSpace(value) == "" {
		return "", nil
	}
	if strings.ContainsRune(value, '\x00') ||
		!utf8.ValidString(value) ||
		len([]rune(value)) > MaxNoteRunes {
		return "", ErrInvalidNoteText
	}
	return value, nil
}
