package domain

import (
	"errors"
	"strconv"
	"strings"
	"time"
)

const MaxTopicIDBytes = 128

var (
	ErrInvalidTopicID    = errors.New("invalid topic id")
	ErrInvalidBlockIndex = errors.New("invalid block index")
)

type ImportantBlock struct {
	TopicID    string
	BlockIndex int
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (b ImportantBlock) ID() string {
	return b.TopicID + "::" + strconv.Itoa(b.BlockIndex)
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
