package bootstraphttp

import (
	"context"
	"errors"
	"net/http"
	"time"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	bootstrapservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bootstrap/service"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
	preferencesdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/domain"
	progressdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/domain"
	usersdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
	workspacedomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/domain"
)

type BootstrapService interface {
	Get(context.Context, string) (bootstrapservice.Snapshot, error)
}

type Handler struct {
	bootstrap BootstrapService
}

func New(bootstrap BootstrapService) *Handler {
	return &Handler{bootstrap: bootstrap}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return
	}

	snapshot, err := h.bootstrap.Get(r.Context(), userID)
	if err != nil {
		if errors.Is(err, bootstrapservice.ErrInvalidUser) {
			httputil.WriteError(w, http.StatusBadRequest, "validation_error", "Invalid bootstrap user", nil)
			return
		}
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
		return
	}

	httputil.WriteJSON(w, http.StatusOK, toResponse(snapshot))
}

type response struct {
	Version      int                  `json:"version"`
	GeneratedAt  string               `json:"generatedAt"`
	User         userResponse         `json:"user"`
	Preferences  preferencesResponse  `json:"preferences"`
	Workspace    workspaceResponse    `json:"workspace"`
	Learning     learningResponse     `json:"learning"`
	Capabilities capabilitiesResponse `json:"capabilities"`
}

type userResponse struct {
	ID      string          `json:"id"`
	Email   string          `json:"email"`
	Profile profileResponse `json:"profile"`
}

type profileResponse struct {
	DisplayName string  `json:"displayName"`
	Handle      string  `json:"handle"`
	Bio         string  `json:"bio"`
	AvatarURL   *string `json:"avatarUrl"`
	JoinedAt    string  `json:"joinedAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

type preferencesResponse struct {
	ThemeName        string            `json:"themeName"`
	CustomTheme      map[string]string `json:"customTheme"`
	CursorMode       string            `json:"cursorMode"`
	MotionProfile    string            `json:"motionProfile"`
	SidebarCollapsed bool              `json:"sidebarCollapsed"`
}

type resumeResponse struct {
	BlockIndex int   `json:"blockIndex"`
	UpdatedAt  int64 `json:"updatedAt"`
}

type workspaceResponse struct {
	SavedTopicIDs []string                  `json:"savedTopicIds"`
	TopicResume   map[string]resumeResponse `json:"topicResume"`
	ReadingWidth  string                    `json:"readingWidth"`
}

type learningResponse struct {
	Revision        int64              `json:"revision"`
	TheoryRead      []string           `json:"theoryRead"`
	SolvedTaskIDs   []string           `json:"solvedTaskIds"`
	SavedTheoremIDs []string           `json:"savedTheoremIds"`
	Reading         map[string]float64 `json:"reading"`
	ReadingProgress map[string]float64 `json:"readingProgress"`
	ReadingBlockIDs []string           `json:"readingBlockIds"`
	LastTopicID     *string            `json:"lastTopicId"`
	UpdatedAt       string             `json:"updatedAt"`
}

type capabilitiesResponse struct {
	MediaAudio bool `json:"mediaAudio"`
}

func toResponse(snapshot bootstrapservice.Snapshot) response {
	return response{
		Version:      snapshot.Version,
		GeneratedAt:  snapshot.GeneratedAt.UTC().Format(time.RFC3339),
		User:         mapUser(snapshot.User),
		Preferences:  mapPreferences(snapshot.Preferences),
		Workspace:    mapWorkspace(snapshot.Workspace),
		Learning:     mapLearning(snapshot.Learning),
		Capabilities: capabilitiesResponse{MediaAudio: snapshot.Capabilities.MediaAudio},
	}
}

func mapUser(user usersdomain.User) userResponse {
	return userResponse{
		ID:    user.ID,
		Email: user.Email,
		Profile: profileResponse{
			DisplayName: user.Profile.DisplayName,
			Handle:      user.Profile.Handle,
			Bio:         user.Profile.Bio,
			AvatarURL:   user.Profile.AvatarURL,
			JoinedAt:    formatTime(user.CreatedAt),
			UpdatedAt:   formatTime(user.Profile.UpdatedAt),
		},
	}
}

func mapPreferences(item preferencesdomain.Preferences) preferencesResponse {
	return preferencesResponse{
		ThemeName:        item.ThemeName,
		CustomTheme:      item.CustomTheme,
		CursorMode:       item.CursorMode,
		MotionProfile:    item.MotionProfile,
		SidebarCollapsed: item.SidebarCollapsed,
	}
}

func mapWorkspace(snapshot workspacedomain.Snapshot) workspaceResponse {
	snapshot = snapshot.Normalize()
	resume := make(map[string]resumeResponse, len(snapshot.TopicResume))
	for topicID, entry := range snapshot.TopicResume {
		resume[topicID] = resumeResponse{
			BlockIndex: entry.BlockIndex,
			UpdatedAt:  entry.UpdatedAt.UnixMilli(),
		}
	}
	return workspaceResponse{
		SavedTopicIDs: snapshot.SavedTopicIDs,
		TopicResume:   resume,
		ReadingWidth:  snapshot.ReadingWidth,
	}
}

func mapLearning(snapshot progressdomain.Snapshot) learningResponse {
	snapshot = snapshot.Normalize()
	return learningResponse{
		Revision:        snapshot.Revision,
		TheoryRead:      snapshot.TheoryRead,
		SolvedTaskIDs:   snapshot.SolvedTaskIDs,
		SavedTheoremIDs: snapshot.SavedTheoremIDs,
		Reading:         snapshot.Reading,
		ReadingProgress: snapshot.Reading,
		ReadingBlockIDs: snapshot.ReadingBlockIDs,
		LastTopicID:     snapshot.LastTopicID,
		UpdatedAt:       formatTime(snapshot.UpdatedAt),
	}
}

func formatTime(value time.Time) string {
	if value.IsZero() {
		return ""
	}
	return value.UTC().Format(time.RFC3339)
}
