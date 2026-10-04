package domain

import "math"

type Mastery struct {
	Total            int
	Reading          int
	TheoryCheckpoint int
	Practice         int
	ReadingRatio     float64
	PracticeRatio    float64
	SolvedCount      int
	TaskCount        int
	Stage            string
}

func CalculateMastery(state TopicState, solvedTaskIDs []string, taskIDs []string) Mastery {
	readingRatio := state.ReadingRatio
	if state.TheoryCompletedAt != nil && readingRatio < 1 {
		readingRatio = 1
	}
	if readingRatio < 0 {
		readingRatio = 0
	}
	if readingRatio > 1 {
		readingRatio = 1
	}

	taskSet := make(map[string]struct{}, len(taskIDs))
	for _, id := range taskIDs {
		taskSet[id] = struct{}{}
	}
	solvedSet := make(map[string]struct{}, len(solvedTaskIDs))
	for _, id := range solvedTaskIDs {
		solvedSet[id] = struct{}{}
	}
	solvedCount := 0
	for id := range taskSet {
		if _, ok := solvedSet[id]; ok {
			solvedCount++
		}
	}

	hasPractice := len(taskSet) > 0
	readingMax := 70
	checkpointMax := 30
	if hasPractice {
		readingMax = 35
		checkpointMax = 15
	}

	reading := int(math.Round(readingRatio * float64(readingMax)))
	checkpoint := 0
	if state.TheoryCompletedAt != nil {
		checkpoint = checkpointMax
	}

	practiceRatio := 0.0
	practice := 0
	if hasPractice {
		practiceRatio = float64(solvedCount) / float64(len(taskSet))
		practice = int(math.Round(practiceRatio * 50))
	}

	total := reading + checkpoint + practice
	if total > 100 {
		total = 100
	}

	stage := "not-started"
	switch {
	case total >= 100:
		stage = "mastered"
	case state.TheoryCompletedAt != nil:
		stage = "practice"
	case readingRatio >= 0.75:
		stage = "checkpoint-ready"
	case state.OpenedAt != nil || readingRatio > 0:
		stage = "reading"
	}

	return Mastery{
		Total:            total,
		Reading:          reading,
		TheoryCheckpoint: checkpoint,
		Practice:         practice,
		ReadingRatio:     readingRatio,
		PracticeRatio:    practiceRatio,
		SolvedCount:      solvedCount,
		TaskCount:        len(taskSet),
		Stage:            stage,
	}
}
