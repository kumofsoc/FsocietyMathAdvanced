package index

import (
	"strings"
	"unicode"

	catalogdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
)

type Document struct {
	Type           string
	ID             string
	Title          string
	Subtitle       string
	Summary        string
	Aliases        []string
	TopicID        string
	ContentBlockID string
	BlockIndex     *int
	Kind           string

	normalizedTitle    string
	normalizedSubtitle string
	normalizedSummary  string
	normalizedAliases  []string
}

type Index struct {
	Documents []Document
}

var kindAliases = map[string][]string{
	"definition": {"definition", "определение"},
	"concepts":   {"concepts", "понятия"},
	"property":   {"property", "свойство", "свойства"},
	"theorem":    {"theorem", "теорема"},
	"proof":      {"proof", "доказательство"},
	"corollary":  {"corollary", "следствие"},
	"formula":    {"formula", "формула", "формулы"},
	"example":    {"example", "пример"},
	"solution":   {"solution", "решение"},
	"note":       {"note", "заметка"},
	"algorithm":  {"algorithm", "алгоритм"},
	"geometry":   {"geometry", "геометрия"},
	"summary":    {"summary", "итог"},
}

func Build(catalog catalogdomain.Catalog) Index {
	chapterByID := make(map[string]catalogdomain.Chapter, len(catalog.Chapters))
	documents := make([]Document, 0, len(catalog.Chapters)+len(catalog.Topics)*8)

	for _, chapter := range catalog.Chapters {
		chapterByID[chapter.ID] = chapter
		documents = append(documents, prepare(Document{
			Type:     "chapter",
			ID:       chapter.ID,
			Title:    chapter.Title,
			Subtitle: "Глава " + chapter.Number,
			Aliases: []string{
				chapter.ID,
				strings.ReplaceAll(chapter.ID, "-", " "),
				chapter.Number,
			},
		}))
	}

	for _, topic := range catalog.Topics {
		chapter := chapterByID[topic.ChapterID]
		documents = append(documents, prepare(Document{
			Type:     "topic",
			ID:       topic.ID,
			Title:    topic.Title,
			Subtitle: chapter.Title,
			Summary:  topic.Summary,
			TopicID:  topic.ID,
			Aliases: []string{
				topic.ID,
				strings.ReplaceAll(topic.ID, "-", " "),
				topic.Number,
			},
		}))

		for _, block := range topic.ContentBlocks {
			blockIndex := block.Index
			resultType := "block"
			if block.Kind == "theorem" || block.Kind == "formula" {
				resultType = block.Kind
			}
			aliases := append([]string(nil), kindAliases[block.Kind]...)
			aliases = append(aliases, block.Kind)
			documents = append(documents, prepare(Document{
				Type:           resultType,
				ID:             block.ID,
				Title:          block.Title,
				Subtitle:       topic.Title + " · " + chapter.Title,
				Aliases:        aliases,
				TopicID:        topic.ID,
				ContentBlockID: block.ID,
				BlockIndex:     &blockIndex,
				Kind:           block.Kind,
			}))
		}
	}

	return Index{Documents: documents}
}

func prepare(document Document) Document {
	document.normalizedTitle = Normalize(document.Title)
	document.normalizedSubtitle = Normalize(document.Subtitle)
	document.normalizedSummary = Normalize(document.Summary)
	document.normalizedAliases = make([]string, 0, len(document.Aliases))
	for _, alias := range document.Aliases {
		if normalized := Normalize(alias); normalized != "" {
			document.normalizedAliases = append(document.normalizedAliases, normalized)
		}
	}
	return document
}

func Normalize(value string) string {
	var out []rune
	spacePending := false
	for _, r := range []rune(strings.ToLower(strings.TrimSpace(value))) {
		if r == 'ё' {
			r = 'е'
		}
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			if spacePending && len(out) > 0 {
				out = append(out, ' ')
			}
			out = append(out, r)
			spacePending = false
			continue
		}
		if len(out) > 0 {
			spacePending = true
		}
	}
	return string(out)
}

func TrigramSimilarity(a, b string) float64 {
	ar := []rune(a)
	br := []rune(b)
	if len(ar) == 0 || len(br) == 0 {
		return 0
	}
	if a == b {
		return 1
	}
	n := 3
	if len(ar) < n || len(br) < n {
		n = 2
	}
	if len(ar) < n || len(br) < n {
		if strings.Contains(a, b) || strings.Contains(b, a) {
			return 0.5
		}
		return 0
	}

	aa := ngrams(ar, n)
	bb := ngrams(br, n)
	intersection := 0
	for gram := range aa {
		if _, ok := bb[gram]; ok {
			intersection++
		}
	}
	union := len(aa) + len(bb) - intersection
	if union == 0 {
		return 0
	}
	return float64(intersection) / float64(union)
}

func ngrams(value []rune, n int) map[string]struct{} {
	out := make(map[string]struct{}, len(value))
	for i := 0; i+n <= len(value); i++ {
		out[string(value[i:i+n])] = struct{}{}
	}
	return out
}

func Score(document Document, query string) float64 {
	query = Normalize(query)
	if query == "" {
		return 0
	}

	score := 0.0
	switch {
	case document.normalizedTitle == query:
		score = 1
	case strings.HasPrefix(document.normalizedTitle, query):
		score = 0.95
	case containsExact(document.normalizedAliases, query):
		score = 0.94
	case hasPrefix(document.normalizedAliases, query):
		score = 0.91
	case strings.Contains(document.normalizedTitle, query):
		score = 0.88
	case strings.Contains(document.normalizedSubtitle, query):
		score = 0.74
	case strings.Contains(document.normalizedSummary, query):
		score = 0.72
	default:
		coverage := tokenPrefixCoverage(document, strings.Fields(query))
		if coverage > 0 {
			score = 0.55 + 0.25*coverage
		}
		fuzzy := bestFuzzy(document, query)
		if fuzzy >= 0.45 {
			candidate := 0.48 + 0.50*fuzzy
			if candidate > score {
				score = candidate
			}
		}
	}

	if score == 0 {
		return 0
	}
	switch document.Type {
	case "topic":
		score += 0.015
	case "theorem", "formula":
		score += 0.005
	}
	if score > 1 {
		return 1
	}
	return score
}

func containsExact(values []string, query string) bool {
	for _, value := range values {
		if value == query {
			return true
		}
	}
	return false
}

func hasPrefix(values []string, query string) bool {
	for _, value := range values {
		if strings.HasPrefix(value, query) {
			return true
		}
	}
	return false
}

func tokenPrefixCoverage(document Document, queryTokens []string) float64 {
	if len(queryTokens) == 0 {
		return 0
	}
	fields := []string{document.normalizedTitle, document.normalizedSubtitle, document.normalizedSummary}
	fields = append(fields, document.normalizedAliases...)
	tokens := strings.Fields(strings.Join(fields, " "))

	matched := 0
	for _, queryToken := range queryTokens {
		found := false
		for _, token := range tokens {
			if strings.HasPrefix(token, queryToken) {
				found = true
				break
			}
		}
		if found {
			matched++
		}
	}
	return float64(matched) / float64(len(queryTokens))
}

func bestFuzzy(document Document, query string) float64 {
	best := fuzzySimilarity(document.normalizedTitle, query)
	for _, alias := range document.normalizedAliases {
		if score := fuzzySimilarity(alias, query); score > best {
			best = score
		}
	}
	for _, token := range strings.Fields(document.normalizedTitle) {
		if score := fuzzySimilarity(token, query); score > best {
			best = score
		}
	}
	return best
}

func fuzzySimilarity(candidate, query string) float64 {
	candidateRunes := []rune(candidate)
	queryRunes := []rune(query)
	if len(candidateRunes) == 0 || len(queryRunes) == 0 {
		return 0
	}

	diff := len(candidateRunes) - len(queryRunes)
	if diff < 0 {
		diff = -diff
	}
	maxDiff := len(queryRunes) / 2
	if maxDiff < 2 {
		maxDiff = 2
	}
	if diff > maxDiff {
		return 0
	}

	trigram := TrigramSimilarity(candidate, query)
	edit := damerauSimilarity(candidateRunes, queryRunes)
	if edit > trigram {
		return edit
	}
	return trigram
}

func damerauSimilarity(a, b []rune) float64 {
	maxLen := len(a)
	if len(b) > maxLen {
		maxLen = len(b)
	}
	if maxLen == 0 {
		return 1
	}

	distance := damerauDistance(a, b)
	return 1 - float64(distance)/float64(maxLen)
}

func damerauDistance(a, b []rune) int {
	rows := len(a) + 1
	cols := len(b) + 1
	matrix := make([][]int, rows)
	for i := range matrix {
		matrix[i] = make([]int, cols)
	}
	for i := 0; i < rows; i++ {
		matrix[i][0] = i
	}
	for j := 0; j < cols; j++ {
		matrix[0][j] = j
	}

	for i := 1; i < rows; i++ {
		for j := 1; j < cols; j++ {
			cost := 0
			if a[i-1] != b[j-1] {
				cost = 1
			}

			best := minInt(
				matrix[i-1][j]+1,
				matrix[i][j-1]+1,
				matrix[i-1][j-1]+cost,
			)

			if i > 1 && j > 1 && a[i-1] == b[j-2] && a[i-2] == b[j-1] {
				if transposition := matrix[i-2][j-2] + 1; transposition < best {
					best = transposition
				}
			}
			matrix[i][j] = best
		}
	}
	return matrix[len(a)][len(b)]
}

func minInt(values ...int) int {
	best := values[0]
	for _, value := range values[1:] {
		if value < best {
			best = value
		}
	}
	return best
}
