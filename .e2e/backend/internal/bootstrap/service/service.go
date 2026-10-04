package service

import (
	"context"
	"errors"
	"time"

	preferencesdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/domain"
	progressdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/domain"
	usersdomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/domain"
	workspacedomain "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/domain"
)

var ErrInvalidUser = errors.New("invalid bootstrap user")

type UserReader interface {
	Me(context.Context, string) (usersdomain.User, error)
}

type PreferencesReader interface {
	Get(context.Context, string) (preferencesdomain.Preferences, error)
}

type WorkspaceReader interface {
	Snapshot(context.Context, string) (workspacedomain.Snapshot, error)
}

type ProgressReader interface {
	Snapshot(context.Context, string) (progressdomain.Snapshot, error)
}

type Capabilities struct {
	MediaAudio bool
}

type Snapshot struct {
	Version      int
	GeneratedAt  time.Time
	User         usersdomain.User
	Preferences  preferencesdomain.Preferences
	Workspace    workspacedomain.Snapshot
	Learning     progressdomain.Snapshot
	Capabilities Capabilities
}

type Service struct {
	users        UserReader
	preferences  PreferencesReader
	workspace    WorkspaceReader
	progress     ProgressReader
	capabilities Capabilities
	now          func() time.Time
}

func New(
	users UserReader,
	preferences PreferencesReader,
	workspace WorkspaceReader,
	progress ProgressReader,
	capabilities Capabilities,
	now func() time.Time,
) *Service {
	if now == nil {
		now = time.Now
	}
	return &Service{
		users:        users,
		preferences:  preferences,
		workspace:    workspace,
		progress:     progress,
		capabilities: capabilities,
		now:          now,
	}
}

func (s *Service) Get(ctx context.Context, userID string) (Snapshot, error) {
	if userID == "" {
		return Snapshot{}, ErrInvalidUser
	}

	user, err := s.users.Me(ctx, userID)
	if err != nil {
		return Snapshot{}, err
	}
	preferences, err := s.preferences.Get(ctx, userID)
	if err != nil {
		return Snapshot{}, err
	}
	workspace, err := s.workspace.Snapshot(ctx, userID)
	if err != nil {
		return Snapshot{}, err
	}
	learning, err := s.progress.Snapshot(ctx, userID)
	if err != nil {
		return Snapshot{}, err
	}

	return Snapshot{
		Version:      1,
		GeneratedAt:  s.now().UTC(),
		User:         user,
		Preferences:  preferences,
		Workspace:    workspace.Normalize(),
		Learning:     learning.Normalize(),
		Capabilities: s.capabilities,
	}, nil
}
