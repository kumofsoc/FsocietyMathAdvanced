package domain

import (
	"errors"
	"regexp"
	"strings"
	"time"
)

var ErrInvalidPreferences = errors.New("invalid preferences")

var hexColorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

var allowedThemes = map[string]struct{}{
	"Black":            {},
	"White":            {},
	"Catppuccin Mocha": {},
	"Catppuccin Latte": {},
	"Neovim":           {},
	"Tokyo Night":      {},
	"Gruvbox":          {},
	"Nord":             {},
	"Custom":           {},
}

var allowedCursorModes = map[string]struct{}{
	"native":    {},
	"halo":      {},
	"minimal":   {},
	"crosshair": {},
	"comet":     {},
}

var allowedMotionProfiles = map[string]struct{}{
	"full":     {},
	"balanced": {},
	"eco":      {},
	"off":      {},
}

var themeTokens = []string{
	"bg",
	"surface",
	"elevated",
	"text",
	"muted",
	"accent",
	"accent2",
	"border",
	"definition",
	"theorem",
	"proof",
	"formula",
}

type Preferences struct {
	UserID           string
	ThemeName        string
	CustomTheme      map[string]string
	CursorMode       string
	MotionProfile    string
	SidebarCollapsed bool
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type Input struct {
	ThemeName        string
	CustomTheme      map[string]string
	CursorMode       string
	MotionProfile    string
	SidebarCollapsed bool
}

func DefaultInput() Input {
	return Input{
		ThemeName: "Black",
		CustomTheme: map[string]string{
			"bg":         "#050507",
			"surface":    "#0d0d12",
			"elevated":   "#13131b",
			"text":       "#f5f5f7",
			"muted":      "#8d8d9a",
			"accent":     "#8b7cff",
			"accent2":    "#36e4c2",
			"border":     "#252531",
			"definition": "#53b6ff",
			"theorem":    "#a78bfa",
			"proof":      "#36e4c2",
			"formula":    "#ffcb6b",
		},
		CursorMode:       "halo",
		MotionProfile:    "balanced",
		SidebarCollapsed: false,
	}
}

func Normalize(input Input) (Input, error) {
	input.ThemeName = strings.TrimSpace(input.ThemeName)
	input.CursorMode = strings.ToLower(strings.TrimSpace(input.CursorMode))
	input.MotionProfile = strings.ToLower(strings.TrimSpace(input.MotionProfile))

	if _, ok := allowedThemes[input.ThemeName]; !ok {
		return Input{}, ErrInvalidPreferences
	}
	if _, ok := allowedCursorModes[input.CursorMode]; !ok {
		return Input{}, ErrInvalidPreferences
	}
	if _, ok := allowedMotionProfiles[input.MotionProfile]; !ok {
		return Input{}, ErrInvalidPreferences
	}
	if len(input.CustomTheme) != len(themeTokens) {
		return Input{}, ErrInvalidPreferences
	}

	normalizedTheme := make(map[string]string, len(themeTokens))
	for _, token := range themeTokens {
		value, ok := input.CustomTheme[token]
		if !ok {
			return Input{}, ErrInvalidPreferences
		}
		value = strings.ToLower(strings.TrimSpace(value))
		if !hexColorPattern.MatchString(value) {
			return Input{}, ErrInvalidPreferences
		}
		normalizedTheme[token] = value
	}

	for token := range input.CustomTheme {
		if _, ok := normalizedTheme[token]; !ok {
			return Input{}, ErrInvalidPreferences
		}
	}

	input.CustomTheme = normalizedTheme
	return input, nil
}

func Default(userID string) Preferences {
	input := DefaultInput()
	return Preferences{
		UserID:           userID,
		ThemeName:        input.ThemeName,
		CustomTheme:      cloneTheme(input.CustomTheme),
		CursorMode:       input.CursorMode,
		MotionProfile:    input.MotionProfile,
		SidebarCollapsed: input.SidebarCollapsed,
	}
}

func cloneTheme(theme map[string]string) map[string]string {
	out := make(map[string]string, len(theme))
	for key, value := range theme {
		out[key] = value
	}
	return out
}
