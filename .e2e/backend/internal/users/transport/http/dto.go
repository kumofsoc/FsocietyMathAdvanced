package usershttp

import (
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
)

type UserResponse struct {
	ID      string          `json:"id"`
	Email   string          `json:"email"`
	Profile ProfileResponse `json:"profile"`
}

type ProfileResponse struct {
	DisplayName string  `json:"displayName"`
	Handle      string  `json:"handle"`
	Bio         string  `json:"bio"`
	AvatarURL   *string `json:"avatarUrl"`
	JoinedAt    string  `json:"joinedAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

func ToResponse(user domain.User) UserResponse {
	return UserResponse{
		ID:    user.ID,
		Email: user.Email,
		Profile: ProfileResponse{
			DisplayName: user.Profile.DisplayName,
			Handle:      user.Profile.Handle,
			Bio:         user.Profile.Bio,
			AvatarURL:   user.Profile.AvatarURL,
			JoinedAt:    user.CreatedAt.UTC().Format(time.RFC3339),
			UpdatedAt:   user.Profile.UpdatedAt.UTC().Format(time.RFC3339),
		},
	}
}
