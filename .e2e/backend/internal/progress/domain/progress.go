package domain

import (
	"errors"
	"math"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	MaxTopicIDBytes   = 128
	MaxTaskIDBytes    = 128
	MaxTheoremIDBytes = 192
)

const MaxTheorySyncItems = 1000
const MaxSolvedSyncItems = 5000
const MaxTheoremSyncItems = 2000
const MaxReadingSyncItems = 1000
const MaxReadingBlockSyncItems = 5000

var (
	ErrInvalidID    = errors.New("invalid identifier")
	ErrInvalidRatio = errors.New("invalid reading ratio")
	ErrInvalidPatch = errors.New("invalid topic patch")
)

var ErrSyncLimit = errors.New("progress sync limit exceeded")

type Snapshot struct {
	Revision        int64
	TheoryRead      []string
	SolvedTaskIDs   []string
	SavedTheoremIDs []string
	Reading         map[string]float64
	ReadingBlockIDs []string
	LastTopicID     *string
	UpdatedAt       time.Time
}

type ReadingBlockRef struct {
	TopicID    string
	BlockIndex int
}

type TopicState struct {
	TopicID           string
	OpenedAt          *time.Time
	ReadingRatio      float64
	TheoryCompletedAt *time.Time
	LastInteractionAt time.Time
	UpdatedAt         time.Time
}

type SyncInput struct {
	TheoryRead      []string
	SolvedTaskIDs   []string
	SavedTheoremIDs []string
	Reading         map[string]float64
	LastTopicID     *string
	ClientUpdatedAt *time.Time
}

type TopicPatch struct {
	Opened         *bool
	ReadingRatio   *float64
	TheoryComplete *bool
}

func NormalizeID(value string, maxBytes int) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" || maxBytes <= 0 || len([]byte(value)) > maxBytes {
		return "", ErrInvalidID
	}
	for i := 0; i < len(value); i++ {
		ch := value[i]
		if (ch >= 'a' && ch <= 'z') ||
			(ch >= 'A' && ch <= 'Z') ||
			(ch >= '0' && ch <= '9') ||
			ch == '_' || ch == '-' || ch == '.' || ch == ':' {
			continue
		}
		return "", ErrInvalidID
	}
	return value, nil
}

func ValidateRatio(value float64) error {
	if math.IsNaN(value) || math.IsInf(value, 0) || value < 0 || value > 1 {
		return ErrInvalidRatio
	}
	return nil
}

func NormalizeSync(input SyncInput) (SyncInput, error) {
	if len(input.TheoryRead) > MaxTheorySyncItems ||
		len(input.SolvedTaskIDs) > MaxSolvedSyncItems ||
		len(input.SavedTheoremIDs) > MaxTheoremSyncItems ||
		len(input.Reading) > MaxReadingSyncItems {
		return SyncInput{}, ErrSyncLimit
	}

	theory, err := normalizeIDs(input.TheoryRead, MaxTopicIDBytes)
	if err != nil {
		return SyncInput{}, err
	}
	solved, err := normalizeIDs(input.SolvedTaskIDs, MaxTaskIDBytes)
	if err != nil {
		return SyncInput{}, err
	}
	theorems, err := normalizeIDs(input.SavedTheoremIDs, MaxTheoremIDBytes)
	if err != nil {
		return SyncInput{}, err
	}

	reading := make(map[string]float64, len(input.Reading))
	for topicID, ratio := range input.Reading {
		normalizedID, err := NormalizeID(topicID, MaxTopicIDBytes)
		if err != nil {
			return SyncInput{}, err
		}
		if err := ValidateRatio(ratio); err != nil {
			return SyncInput{}, err
		}
		if existing, ok := reading[normalizedID]; !ok || ratio > existing {
			reading[normalizedID] = ratio
		}
	}

	var lastTopicID *string
	if input.LastTopicID != nil {
		if trimmed := strings.TrimSpace(*input.LastTopicID); trimmed != "" {
			normalized, err := NormalizeID(trimmed, MaxTopicIDBytes)
			if err != nil {
				return SyncInput{}, err
			}
			lastTopicID = &normalized
		}
	}

	return SyncInput{
		TheoryRead:      theory,
		SolvedTaskIDs:   solved,
		SavedTheoremIDs: theorems,
		Reading:         reading,
		LastTopicID:     lastTopicID,
		ClientUpdatedAt: input.ClientUpdatedAt,
	}, nil
}

func (p TopicPatch) Validate() error {
	if p.Opened == nil && p.ReadingRatio == nil && p.TheoryComplete == nil {
		return ErrInvalidPatch
	}
	if p.Opened != nil && !*p.Opened {
		return ErrInvalidPatch
	}
	if p.ReadingRatio != nil {
		if err := ValidateRatio(*p.ReadingRatio); err != nil {
			return err
		}
	}
	if p.TheoryComplete != nil && !*p.TheoryComplete {
		return ErrInvalidPatch
	}
	return nil
}

func (s Snapshot) Normalize() Snapshot {
	s.TheoryRead = sortedUnique(s.TheoryRead)
	s.SolvedTaskIDs = sortedUnique(s.SolvedTaskIDs)
	s.SavedTheoremIDs = sortedUnique(s.SavedTheoremIDs)
	s.ReadingBlockIDs = sortedUnique(s.ReadingBlockIDs)
	if s.Reading == nil {
		s.Reading = map[string]float64{}
	} else {
		copyReading := make(map[string]float64, len(s.Reading))
		for key, value := range s.Reading {
			copyReading[key] = value
		}
		s.Reading = copyReading
	}
	return s
}

func normalizeIDs(values []string, maxBytes int) ([]string, error) {
	if len(values) == 0 {
		return []string{}, nil
	}
	set := make(map[string]struct{}, len(values))
	for _, value := range values {
		normalized, err := NormalizeID(value, maxBytes)
		if err != nil {
			return nil, err
		}
		set[normalized] = struct{}{}
	}
	out := make([]string, 0, len(set))
	for value := range set {
		out = append(out, value)
	}
	sort.Strings(out)
	return out, nil
}

func sortedUnique(values []string) []string {
	if len(values) == 0 {
		return []string{}
	}
	set := make(map[string]struct{}, len(values))
	for _, value := range values {
		set[value] = struct{}{}
	}
	out := make([]string, 0, len(set))
	for value := range set {
		out = append(out, value)
	}
	sort.Strings(out)
	return out
}

func NormalizeReadingBlockRefs(values []ReadingBlockRef) ([]ReadingBlockRef, error) {
	if len(values) > MaxReadingBlockSyncItems {
		return nil, ErrSyncLimit
	}
	if len(values) == 0 {
		return []ReadingBlockRef{}, nil
	}

	seen := make(map[string]ReadingBlockRef, len(values))
	for _, value := range values {
		topicID, err := NormalizeID(value.TopicID, MaxTopicIDBytes)
		if err != nil {
			return nil, err
		}
		if value.BlockIndex < 0 {
			return nil, ErrInvalidID
		}
		key := topicID + "::" + strconv.Itoa(value.BlockIndex)
		seen[key] = ReadingBlockRef{TopicID: topicID, BlockIndex: value.BlockIndex}
	}

	keys := make([]string, 0, len(seen))
	for key := range seen {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	out := make([]ReadingBlockRef, 0, len(keys))
	for _, key := range keys {
		out = append(out, seen[key])
	}
	return out, nil
}

func ReadingBlockID(topicID string, blockIndex int) string {
	return topicID + "::" + strconv.Itoa(blockIndex)
}
