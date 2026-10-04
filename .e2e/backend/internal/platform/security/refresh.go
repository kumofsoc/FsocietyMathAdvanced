package security

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
)

func NewRefreshToken() (string, [32]byte, error) {
	var raw [32]byte
	if _, err := rand.Read(raw[:]); err != nil {
		return "", [32]byte{}, fmt.Errorf("generate refresh token: %w", err)
	}
	token := base64.RawURLEncoding.EncodeToString(raw[:])
	return token, HashRefreshToken(token), nil
}

func HashRefreshToken(raw string) [32]byte {
	return sha256.Sum256([]byte(raw))
}
