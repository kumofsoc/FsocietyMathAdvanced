package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

var ErrInvalidAccessToken = errors.New("invalid access token")

type AccessClaims struct {
	Subject   string `json:"sub"`
	SessionID string `json:"sid"`
	Type      string `json:"typ"`
	IssuedAt  int64  `json:"iat"`
	ExpiresAt int64  `json:"exp"`
}

type AccessManager struct {
	secret []byte
	ttl    time.Duration
}

func NewAccessManager(secret string, ttl time.Duration) *AccessManager {
	return &AccessManager{secret: []byte(secret), ttl: ttl}
}

func (m *AccessManager) Issue(userID, sessionID string, now time.Time) (string, time.Time, error) {
	if userID == "" || sessionID == "" {
		return "", time.Time{}, errors.New("user and session ids are required")
	}
	expiresAt := now.UTC().Add(m.ttl)
	header := map[string]string{"alg": "HS256", "typ": "JWT"}
	claims := AccessClaims{
		Subject:   userID,
		SessionID: sessionID,
		Type:      "access",
		IssuedAt:  now.UTC().Unix(),
		ExpiresAt: expiresAt.Unix(),
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("marshal jwt header: %w", err)
	}
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("marshal jwt claims: %w", err)
	}

	unsigned := base64.RawURLEncoding.EncodeToString(headerJSON) + "." + base64.RawURLEncoding.EncodeToString(claimsJSON)
	signature := m.sign(unsigned)
	return unsigned + "." + base64.RawURLEncoding.EncodeToString(signature), expiresAt, nil
}

func (m *AccessManager) Parse(raw string, now time.Time) (AccessClaims, error) {
	parts := strings.Split(raw, ".")
	if len(parts) != 3 {
		return AccessClaims{}, ErrInvalidAccessToken
	}

	unsigned := parts[0] + "." + parts[1]
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || !hmac.Equal(signature, m.sign(unsigned)) {
		return AccessClaims{}, ErrInvalidAccessToken
	}

	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return AccessClaims{}, ErrInvalidAccessToken
	}
	var header map[string]string
	if err := json.Unmarshal(headerBytes, &header); err != nil || header["alg"] != "HS256" || header["typ"] != "JWT" {
		return AccessClaims{}, ErrInvalidAccessToken
	}

	claimBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return AccessClaims{}, ErrInvalidAccessToken
	}
	var claims AccessClaims
	if err := json.Unmarshal(claimBytes, &claims); err != nil {
		return AccessClaims{}, ErrInvalidAccessToken
	}

	nowUnix := now.UTC().Unix()
	if claims.Type != "access" || claims.Subject == "" || claims.SessionID == "" || claims.ExpiresAt <= nowUnix {
		return AccessClaims{}, ErrInvalidAccessToken
	}
	if claims.IssuedAt > nowUnix+60 {
		return AccessClaims{}, ErrInvalidAccessToken
	}
	return claims, nil
}

func (m *AccessManager) sign(value string) []byte {
	mac := hmac.New(sha256.New, m.secret)
	_, _ = mac.Write([]byte(value))
	return mac.Sum(nil)
}
