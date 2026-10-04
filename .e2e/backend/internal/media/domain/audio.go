package domain

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"mime"
	"path"
	"regexp"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	HardMaxAudioBytes   int64 = 120 * 1024 * 1024
	MaxDisplayNameRunes       = 255
	MaxTracksPerUser          = 500
)

var (
	ErrInvalidAudio        = errors.New("invalid audio content")
	ErrInvalidDeclaredMIME = errors.New("invalid declared audio mime")
	ErrInvalidDisplayName  = errors.New("invalid display name")
	ErrInvalidTrackID      = errors.New("invalid track id")
	uuidPattern            = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
)

type Track struct {
	ID          string
	UserID      string
	DisplayName string
	MIMEType    string
	SizeBytes   int64
	ObjectKey   string
	Position    int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func DetectAudioMIME(prefix []byte) (string, error) {
	switch {
	case len(prefix) >= 4 && prefix[0] == 0xff && (prefix[1]&0xf6) == 0xf0:
		return "audio/aac", nil
	case len(prefix) >= 3 && string(prefix[:3]) == "ID3":
		return "audio/mpeg", nil
	case len(prefix) >= 2 && prefix[0] == 0xff && (prefix[1]&0xe0) == 0xe0:
		return "audio/mpeg", nil
	case len(prefix) >= 12 && string(prefix[:4]) == "RIFF" && string(prefix[8:12]) == "WAVE":
		return "audio/wav", nil
	case len(prefix) >= 4 && string(prefix[:4]) == "OggS":
		return "audio/ogg", nil
	case len(prefix) >= 4 && string(prefix[:4]) == "fLaC":
		return "audio/flac", nil
	case len(prefix) >= 12 && string(prefix[4:8]) == "ftyp" && isAudioMP4Brand(string(prefix[8:12])):
		return "audio/mp4", nil
	default:
		return "", ErrInvalidAudio
	}
}

func isAudioMP4Brand(brand string) bool {
	switch brand {
	case "M4A ", "M4B ", "M4P ", "m4a ":
		return true
	default:
		return false
	}
}

func ValidateDeclaredMIME(declared, detected string) error {
	detected = canonicalMIME(detected)
	if detected == "" {
		return ErrInvalidAudio
	}

	declared = strings.TrimSpace(declared)
	if declared == "" {
		return nil
	}
	mediaType, _, err := mime.ParseMediaType(declared)
	if err != nil {
		return ErrInvalidDeclaredMIME
	}
	if canonicalMIME(mediaType) != detected {
		return ErrInvalidDeclaredMIME
	}
	return nil
}

func canonicalMIME(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "audio/mpeg", "audio/mp3":
		return "audio/mpeg"
	case "audio/wav", "audio/x-wav", "audio/wave":
		return "audio/wav"
	case "audio/ogg":
		return "audio/ogg"
	case "audio/flac", "audio/x-flac":
		return "audio/flac"
	case "audio/mp4", "audio/x-m4a", "audio/m4a":
		return "audio/mp4"
	case "audio/aac", "audio/x-aac":
		return "audio/aac"
	default:
		return ""
	}
}

func NormalizeDisplayName(value string) (string, error) {
	value = strings.ReplaceAll(value, "\\", "/")
	value = path.Base(value)
	value = strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return -1
		}
		return r
	}, value)
	value = strings.TrimSpace(value)
	if value == "" || value == "." || value == ".." || !utf8.ValidString(value) {
		return "", ErrInvalidDisplayName
	}
	if utf8.RuneCountInString(value) > MaxDisplayNameRunes {
		return "", ErrInvalidDisplayName
	}
	return value, nil
}

func NormalizeTrackID(value string) (string, error) {
	value = strings.ToLower(strings.TrimSpace(value))
	if !uuidPattern.MatchString(value) {
		return "", ErrInvalidTrackID
	}
	return value, nil
}

func ValidateTrackID(value string) error {
	_, err := NormalizeTrackID(value)
	return err
}

func NewObjectKey() (string, error) {
	var raw [32]byte
	if _, err := rand.Read(raw[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(raw[:]), nil
}
