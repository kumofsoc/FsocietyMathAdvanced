package mediahttp

import (
	"context"
	"errors"
	"io"
	"mime"
	"net/http"
	"strconv"
	"strings"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/domain"
	mediarepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/repository"
	mediaservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/service"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

const mediaJSONBodyLimit = 128 << 10

type MediaService interface {
	Upload(context.Context, string, mediaservice.UploadInput) (domain.Track, error)
	List(context.Context, string) ([]domain.Track, error)
	Get(context.Context, string, string) (domain.Track, error)
	Rename(context.Context, string, string, string) (domain.Track, error)
	Delete(context.Context, string, string) error
	Reorder(context.Context, string, []string) ([]domain.Track, error)
	Open(context.Context, string, string) (domain.Track, io.ReadCloser, error)
}

type Handler struct {
	media     MediaService
	available bool
}

func New(media MediaService) *Handler {
	return &Handler{media: media, available: media != nil}
}

func Unavailable() *Handler {
	return &Handler{}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.authorizedUser(w, r)
	if !ok || !h.ensureAvailable(w) {
		return
	}
	tracks, err := h.media.List(r.Context(), userID)
	if err != nil {
		writeMediaError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, map[string]any{"tracks": toTrackResponses(tracks)})
}

func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.authorizedUser(w, r)
	if !ok || !h.ensureAvailable(w) {
		return
	}

	reader, err := r.MultipartReader()
	if err != nil {
		writeValidationError(w, "multipart/form-data with file field is required")
		return
	}

	for {
		part, nextErr := reader.NextPart()
		if errors.Is(nextErr, io.EOF) {
			break
		}
		if nextErr != nil {
			if isRequestTooLarge(nextErr) {
				writeMediaError(w, nextErr)
			} else {
				writeValidationError(w, "Invalid multipart body")
			}
			return
		}
		if part.FormName() != "file" || part.FileName() == "" {
			_ = part.Close()
			continue
		}

		track, uploadErr := h.media.Upload(r.Context(), userID, mediaservice.UploadInput{
			Name:         part.FileName(),
			DeclaredMIME: part.Header.Get("Content-Type"),
			Reader:       part,
		})
		_ = part.Close()
		if uploadErr != nil {
			writeMediaError(w, uploadErr)
			return
		}
		httputil.WriteJSON(w, http.StatusCreated, toTrackResponse(track))
		return
	}

	writeValidationError(w, "Multipart file field is required")
}

func (h *Handler) Rename(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.authorizedUser(w, r)
	if !ok || !h.ensureAvailable(w) {
		return
	}
	var body struct {
		Name string `json:"name"`
	}
	if err := httputil.DecodeJSON(w, r, &body, mediaJSONBodyLimit); err != nil {
		writeValidationError(w, "Invalid media data")
		return
	}
	track, err := h.media.Rename(r.Context(), userID, r.PathValue("id"), body.Name)
	if err != nil {
		writeMediaError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, toTrackResponse(track))
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.authorizedUser(w, r)
	if !ok || !h.ensureAvailable(w) {
		return
	}
	if err := h.media.Delete(r.Context(), userID, r.PathValue("id")); err != nil {
		writeMediaError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Reorder(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.authorizedUser(w, r)
	if !ok || !h.ensureAvailable(w) {
		return
	}
	var body struct {
		TrackIDs []string `json:"trackIds"`
	}
	if err := httputil.DecodeJSON(w, r, &body, mediaJSONBodyLimit); err != nil {
		writeValidationError(w, "Invalid playlist order")
		return
	}
	tracks, err := h.media.Reorder(r.Context(), userID, body.TrackIDs)
	if err != nil {
		writeMediaError(w, err)
		return
	}
	httputil.WriteJSON(w, http.StatusOK, map[string]any{"tracks": toTrackResponses(tracks)})
}

func (h *Handler) Content(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.authorizedUser(w, r)
	if !ok || !h.ensureAvailable(w) {
		return
	}
	trackID := r.PathValue("id")

	if r.Method == http.MethodHead {
		track, err := h.media.Get(r.Context(), userID, trackID)
		if err != nil {
			writeMediaError(w, err)
			return
		}
		writeContentHeaders(w, track)
		w.WriteHeader(http.StatusOK)
		return
	}

	track, content, err := h.media.Open(r.Context(), userID, trackID)
	if err != nil {
		writeMediaError(w, err)
		return
	}
	defer content.Close()

	writeContentHeaders(w, track)
	w.WriteHeader(http.StatusOK)
	_, _ = io.Copy(w, content)
}

func writeContentHeaders(w http.ResponseWriter, track domain.Track) {
	disposition := mime.FormatMediaType("inline", map[string]string{"filename": track.DisplayName})
	w.Header().Set("Content-Type", track.MIMEType)
	w.Header().Set("Content-Length", strconv.FormatInt(track.SizeBytes, 10))
	w.Header().Set("Content-Disposition", disposition)
	w.Header().Set("Cache-Control", "private, no-store")
}

func (h *Handler) authorizedUser(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, ok := authcontext.UserID(r.Context())
	if !ok {
		httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
		return "", false
	}
	return userID, true
}

func (h *Handler) ensureAvailable(w http.ResponseWriter) bool {
	if h.available && h.media != nil {
		return true
	}
	httputil.WriteError(w, http.StatusServiceUnavailable, "media_unavailable", "Media storage is unavailable", nil)
	return false
}

func isRequestTooLarge(err error) bool {
	var maxBytesErr *http.MaxBytesError
	return errors.As(err, &maxBytesErr)
}

func writeMediaError(w http.ResponseWriter, err error) {
	var maxBytesErr *http.MaxBytesError
	switch {
	case errors.As(err, &maxBytesErr):
		httputil.WriteError(w, http.StatusRequestEntityTooLarge, "audio_too_large", "Audio upload exceeds the HTTP request limit", nil)
	case errors.Is(err, mediaservice.ErrInvalidInput),
		errors.Is(err, domain.ErrInvalidAudio),
		errors.Is(err, domain.ErrInvalidDeclaredMIME),
		errors.Is(err, domain.ErrInvalidDisplayName),
		errors.Is(err, domain.ErrInvalidTrackID):
		writeValidationError(w, "Invalid media data")
	case errors.Is(err, mediaservice.ErrTooLarge):
		httputil.WriteError(w, http.StatusRequestEntityTooLarge, "audio_too_large", "Audio file exceeds the configured limit", nil)
	case errors.Is(err, mediarepo.ErrTrackLimit):
		httputil.WriteError(w, http.StatusConflict, "track_limit", "Audio track limit reached", nil)
	case errors.Is(err, mediarepo.ErrOrderConflict):
		httputil.WriteError(w, http.StatusConflict, "playlist_conflict", "Playlist changed; refresh tracks and retry", nil)
	case errors.Is(err, mediarepo.ErrNotFound):
		httputil.WriteError(w, http.StatusNotFound, "media_not_found", "Audio track not found", nil)
	default:
		httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
	}
}

func writeValidationError(w http.ResponseWriter, message string) {
	message = strings.TrimSpace(message)
	if message == "" {
		message = "Invalid media data"
	}
	httputil.WriteError(w, http.StatusBadRequest, "validation_error", message, nil)
}
