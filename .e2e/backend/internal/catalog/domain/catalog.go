package domain

import (
	"errors"
	"fmt"
	"strconv"
)

var ErrInvalidCatalog = errors.New("invalid course catalog")

type Source struct {
	Repository string `json:"repository"`
	Commit     string `json:"commit"`
}

type Catalog struct {
	SchemaVersion int       `json:"schemaVersion"`
	Source        Source    `json:"source"`
	Chapters      []Chapter `json:"chapters"`
	Topics        []Topic   `json:"topics"`
}

type Chapter struct {
	ID       string   `json:"id"`
	Number   string   `json:"number"`
	Title    string   `json:"title"`
	TopicIDs []string `json:"topicIds"`
}

type Topic struct {
	ID              string            `json:"id"`
	Number          string            `json:"number"`
	Title           string            `json:"title"`
	ChapterID       string            `json:"chapterId"`
	Summary         string            `json:"summary"`
	PrerequisiteIDs []string          `json:"prerequisites"`
	IsStub          bool              `json:"isStub"`
	ExerciseIDs     []string          `json:"exerciseIds"`
	ContentBlocks   []ContentBlockRef `json:"contentBlocks"`
}

type ContentBlockRef struct {
	ID    string `json:"id"`
	Index int    `json:"index"`
	Title string `json:"title"`
	Kind  string `json:"kind"`
}

func (c Catalog) Validate() error {
	if c.SchemaVersion != 1 {
		return invalid("unsupported schema version %d", c.SchemaVersion)
	}
	if c.Source.Repository == "" || c.Source.Commit == "" {
		return invalid("source repository and commit are required")
	}

	chapterByID := make(map[string]Chapter, len(c.Chapters))
	topicOwners := make(map[string]string, len(c.Topics))
	for _, chapter := range c.Chapters {
		if chapter.ID == "" || chapter.Number == "" || chapter.Title == "" {
			return invalid("chapter has empty identity fields")
		}
		if _, exists := chapterByID[chapter.ID]; exists {
			return invalid("duplicate chapter id %q", chapter.ID)
		}
		chapterByID[chapter.ID] = chapter

		localTopics := make(map[string]struct{}, len(chapter.TopicIDs))
		for _, topicID := range chapter.TopicIDs {
			if topicID == "" {
				return invalid("chapter %q contains empty topic id", chapter.ID)
			}
			if _, exists := localTopics[topicID]; exists {
				return invalid("chapter %q contains duplicate topic id %q", chapter.ID, topicID)
			}
			localTopics[topicID] = struct{}{}
			if previous, exists := topicOwners[topicID]; exists {
				return invalid("topic %q listed by both %q and %q", topicID, previous, chapter.ID)
			}
			topicOwners[topicID] = chapter.ID
		}
	}

	topicByID := make(map[string]Topic, len(c.Topics))
	exerciseOwner := make(map[string]string)
	blockOwner := make(map[string]string)

	for _, topic := range c.Topics {
		if topic.ID == "" || topic.Number == "" || topic.Title == "" || topic.ChapterID == "" {
			return invalid("topic has empty identity fields")
		}
		if _, exists := topicByID[topic.ID]; exists {
			return invalid("duplicate topic id %q", topic.ID)
		}
		topicByID[topic.ID] = topic

		owner, listed := topicOwners[topic.ID]
		if !listed {
			return invalid("topic %q is not listed by any chapter", topic.ID)
		}
		if owner != topic.ChapterID {
			return invalid("topic %q chapter mismatch: listed by %q, declares %q", topic.ID, owner, topic.ChapterID)
		}
		if _, exists := chapterByID[topic.ChapterID]; !exists {
			return invalid("topic %q references missing chapter %q", topic.ID, topic.ChapterID)
		}

		prereqs := make(map[string]struct{}, len(topic.PrerequisiteIDs))
		for _, prerequisiteID := range topic.PrerequisiteIDs {
			if prerequisiteID == "" {
				return invalid("topic %q contains empty prerequisite id", topic.ID)
			}
			if _, exists := prereqs[prerequisiteID]; exists {
				return invalid("topic %q contains duplicate prerequisite %q", topic.ID, prerequisiteID)
			}
			prereqs[prerequisiteID] = struct{}{}
		}

		for _, exerciseID := range topic.ExerciseIDs {
			if exerciseID == "" {
				return invalid("topic %q contains empty exercise id", topic.ID)
			}
			if previous, exists := exerciseOwner[exerciseID]; exists {
				return invalid("exercise %q belongs to both %q and %q", exerciseID, previous, topic.ID)
			}
			exerciseOwner[exerciseID] = topic.ID
		}

		indices := make(map[int]struct{}, len(topic.ContentBlocks))
		for _, block := range topic.ContentBlocks {
			if block.ID == "" || block.Index < 0 || block.Title == "" || block.Kind == "" {
				return invalid("topic %q contains invalid content block", topic.ID)
			}
			expectedID := topic.ID + "::" + strconv.Itoa(block.Index)
			if block.ID != expectedID {
				return invalid("content block %q must be %q", block.ID, expectedID)
			}
			if _, exists := indices[block.Index]; exists {
				return invalid("topic %q has duplicate content block index %d", topic.ID, block.Index)
			}
			indices[block.Index] = struct{}{}
			if previous, exists := blockOwner[block.ID]; exists {
				return invalid("content block %q belongs to both %q and %q", block.ID, previous, topic.ID)
			}
			blockOwner[block.ID] = topic.ID
		}
	}

	for topicID := range topicOwners {
		if _, exists := topicByID[topicID]; !exists {
			return invalid("chapter references missing topic %q", topicID)
		}
	}

	return nil
}

func (c Catalog) Topic(id string) (Topic, bool) {
	for _, topic := range c.Topics {
		if topic.ID == id {
			return topic, true
		}
	}
	return Topic{}, false
}

func (c Catalog) Chapter(id string) (Chapter, bool) {
	for _, chapter := range c.Chapters {
		if chapter.ID == id {
			return chapter, true
		}
	}
	return Chapter{}, false
}

func (c Catalog) UnresolvedPrerequisiteIDs(topicID string) []string {
	topic, ok := c.Topic(topicID)
	if !ok {
		return nil
	}
	known := make(map[string]struct{}, len(c.Topics))
	for _, candidate := range c.Topics {
		known[candidate.ID] = struct{}{}
	}
	out := make([]string, 0)
	for _, prerequisiteID := range topic.PrerequisiteIDs {
		if _, exists := known[prerequisiteID]; !exists {
			out = append(out, prerequisiteID)
		}
	}
	return out
}

func (c Catalog) ExerciseCount() int {
	count := 0
	for _, topic := range c.Topics {
		count += len(topic.ExerciseIDs)
	}
	return count
}

func (c Catalog) ContentBlockCount() int {
	count := 0
	for _, topic := range c.Topics {
		count += len(topic.ContentBlocks)
	}
	return count
}

func invalid(format string, args ...any) error {
	return fmt.Errorf("%w: %s", ErrInvalidCatalog, fmt.Sprintf(format, args...))
}
