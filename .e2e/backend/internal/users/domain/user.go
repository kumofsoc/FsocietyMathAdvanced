package domain

import (
	"errors"
	"net/mail"
	"regexp"
	"strings"
	"time"
)

var (
	ErrInvalidEmail       = errors.New("invalid email")
	ErrInvalidHandle      = errors.New("invalid handle")
	ErrInvalidDisplayName = errors.New("invalid display name")
	ErrInvalidBio         = errors.New("invalid bio")
)

var handlePattern = regexp.MustCompile(`^[a-z0-9][a-z0-9_-]{2,29}$`)

type User struct {
	ID           string
	Email        string
	PasswordHash string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Profile      Profile
}

type Profile struct {
	UserID      string
	Handle      string
	DisplayName string
	Bio         string
	AvatarURL   *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func NormalizeEmail(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func ValidateEmail(value string) error {
	if len(value) > 254 {
		return ErrInvalidEmail
	}
	address, err := mail.ParseAddress(value)
	if err != nil || address.Address != value || !strings.Contains(value, "@") {
		return ErrInvalidEmail
	}
	return nil
}

func NormalizeHandle(value string) string {
	return strings.ToLower(strings.TrimPrefix(strings.TrimSpace(value), "@"))
}

func ValidateHandle(value string) error {
	if !handlePattern.MatchString(value) {
		return ErrInvalidHandle
	}
	return nil
}

func ValidateDisplayName(value string) error {
	n := len([]rune(strings.TrimSpace(value)))
	if n < 1 || n > 80 {
		return ErrInvalidDisplayName
	}
	return nil
}

func ValidateBio(value string) error {
	if len([]rune(value)) > 500 {
		return ErrInvalidBio
	}
	return nil
}
