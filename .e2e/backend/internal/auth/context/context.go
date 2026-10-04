package authcontext

import "context"

type key string

const (
	userIDKey    key = "auth-user-id"
	sessionIDKey key = "auth-session-id"
)

func WithIdentity(ctx context.Context, userID, sessionID string) context.Context {
	ctx = context.WithValue(ctx, userIDKey, userID)
	return context.WithValue(ctx, sessionIDKey, sessionID)
}

func UserID(ctx context.Context) (string, bool) {
	value, ok := ctx.Value(userIDKey).(string)
	return value, ok && value != ""
}

func SessionID(ctx context.Context) (string, bool) {
	value, ok := ctx.Value(sessionIDKey).(string)
	return value, ok && value != ""
}
