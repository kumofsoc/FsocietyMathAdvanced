package domain

import "time"

type Session struct {
	ID         string
	UserID     string
	UserAgent  string
	IPAddress  string
	CreatedAt  time.Time
	LastSeenAt time.Time
	ExpiresAt  time.Time
	RevokedAt  *time.Time
}

type RefreshToken struct {
	ID         string
	SessionID  string
	TokenHash  [32]byte
	CreatedAt  time.Time
	ExpiresAt  time.Time
	UsedAt     *time.Time
	RevokedAt  *time.Time
	ReplacedBy *string
}
