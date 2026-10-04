package domain

type Result struct {
	Type           string
	ID             string
	Title          string
	Subtitle       string
	Score          float64
	TopicID        string
	ContentBlockID string
	BlockIndex     *int
	Kind           string
}
