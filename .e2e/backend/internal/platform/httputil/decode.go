package httputil

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

var ErrInvalidJSON = errors.New("invalid json body")

func DecodeJSON(w http.ResponseWriter, r *http.Request, dst any, maxBytes int64) error {
	if r.Body == nil {
		return ErrInvalidJSON
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		return ErrInvalidJSON
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return ErrInvalidJSON
	}
	return nil
}
