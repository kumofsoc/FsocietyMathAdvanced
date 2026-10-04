package service

import (
	"bufio"
	"context"
	"errors"
	"io"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/domain"
	mediarepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/repository"
	mediastorage "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/storage"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/security"
)

var (
	ErrInvalidInput = errors.New("invalid media input")
	ErrTooLarge     = errors.New("audio upload too large")
)

type Repository interface {
	Create(context.Context, domain.Track) (domain.Track, error)
	List(context.Context, string) ([]domain.Track, error)
	Get(context.Context, string, string) (domain.Track, error)
	Rename(context.Context, string, string, string) (domain.Track, error)
	Delete(context.Context, string, string) (domain.Track, error)
	Reorder(context.Context, string, []string) ([]domain.Track, error)
}

type UploadInput struct {
	Name         string
	DeclaredMIME string
	SizeHint     int64
	Reader       io.Reader
}

type Service struct {
	repository Repository
	storage    mediastorage.ObjectStorage
	maxBytes   int64
}

func New(repository Repository, storage mediastorage.ObjectStorage, maxBytes int64) *Service {
	if maxBytes <= 0 || maxBytes > domain.HardMaxAudioBytes {
		maxBytes = domain.HardMaxAudioBytes
	}
	return &Service{repository: repository, storage: storage, maxBytes: maxBytes}
}

func (s *Service) Upload(ctx context.Context, userID string, input UploadInput) (domain.Track, error) {
	if userID == "" || input.Reader == nil || input.SizeHint < 0 {
		return domain.Track{}, ErrInvalidInput
	}
	if input.SizeHint > s.maxBytes {
		return domain.Track{}, ErrTooLarge
	}

	name, err := domain.NormalizeDisplayName(input.Name)
	if err != nil {
		return domain.Track{}, ErrInvalidInput
	}

	limited := io.LimitReader(input.Reader, s.maxBytes+1)
	reader := bufio.NewReaderSize(limited, 512)
	prefix, peekErr := reader.Peek(512)
	if peekErr != nil && !errors.Is(peekErr, io.EOF) && !errors.Is(peekErr, bufio.ErrBufferFull) {
		return domain.Track{}, peekErr
	}
	if len(prefix) == 0 {
		return domain.Track{}, domain.ErrInvalidAudio
	}

	detectedMIME, err := domain.DetectAudioMIME(prefix)
	if err != nil {
		return domain.Track{}, err
	}
	if err := domain.ValidateDeclaredMIME(input.DeclaredMIME, detectedMIME); err != nil {
		return domain.Track{}, err
	}

	objectKey, err := domain.NewObjectKey()
	if err != nil {
		return domain.Track{}, err
	}
	trackID, err := security.NewID()
	if err != nil {
		return domain.Track{}, err
	}

	counter := &countingReader{reader: reader}
	if err := s.storage.Put(ctx, objectKey, counter); err != nil {
		_ = s.storage.Delete(context.Background(), objectKey)
		return domain.Track{}, err
	}
	if counter.count == 0 {
		_ = s.storage.Delete(context.Background(), objectKey)
		return domain.Track{}, domain.ErrInvalidAudio
	}
	if counter.count > s.maxBytes {
		_ = s.storage.Delete(context.Background(), objectKey)
		return domain.Track{}, ErrTooLarge
	}

	track, err := s.repository.Create(ctx, domain.Track{
		ID:          trackID,
		UserID:      userID,
		DisplayName: name,
		MIMEType:    detectedMIME,
		SizeBytes:   counter.count,
		ObjectKey:   objectKey,
	})
	if err != nil {
		_ = s.storage.Delete(context.Background(), objectKey)
		return domain.Track{}, err
	}
	return track, nil
}

func (s *Service) List(ctx context.Context, userID string) ([]domain.Track, error) {
	if userID == "" {
		return nil, ErrInvalidInput
	}
	return s.repository.List(ctx, userID)
}

func (s *Service) Rename(ctx context.Context, userID, trackID, name string) (domain.Track, error) {
	if userID == "" {
		return domain.Track{}, ErrInvalidInput
	}
	trackID, err := domain.NormalizeTrackID(trackID)
	if err != nil {
		return domain.Track{}, ErrInvalidInput
	}
	normalized, err := domain.NormalizeDisplayName(name)
	if err != nil {
		return domain.Track{}, ErrInvalidInput
	}
	return s.repository.Rename(ctx, userID, trackID, normalized)
}

func (s *Service) Delete(ctx context.Context, userID, trackID string) error {
	if userID == "" {
		return ErrInvalidInput
	}
	trackID, err := domain.NormalizeTrackID(trackID)
	if err != nil {
		return ErrInvalidInput
	}
	track, err := s.repository.Delete(ctx, userID, trackID)
	if err != nil {
		return err
	}
	return s.storage.Delete(ctx, track.ObjectKey)
}

func (s *Service) Reorder(ctx context.Context, userID string, trackIDs []string) ([]domain.Track, error) {
	if userID == "" || len(trackIDs) > domain.MaxTracksPerUser {
		return nil, ErrInvalidInput
	}
	normalizedIDs := make([]string, len(trackIDs))
	seen := make(map[string]struct{}, len(trackIDs))
	for i, id := range trackIDs {
		normalized, err := domain.NormalizeTrackID(id)
		if err != nil {
			return nil, ErrInvalidInput
		}
		if _, duplicate := seen[normalized]; duplicate {
			return nil, mediarepo.ErrOrderConflict
		}
		seen[normalized] = struct{}{}
		normalizedIDs[i] = normalized
	}
	return s.repository.Reorder(ctx, userID, normalizedIDs)
}

func (s *Service) Get(ctx context.Context, userID, trackID string) (domain.Track, error) {
	if userID == "" {
		return domain.Track{}, ErrInvalidInput
	}
	trackID, err := domain.NormalizeTrackID(trackID)
	if err != nil {
		return domain.Track{}, ErrInvalidInput
	}
	return s.repository.Get(ctx, userID, trackID)
}

func (s *Service) Open(ctx context.Context, userID, trackID string) (domain.Track, io.ReadCloser, error) {
	if userID == "" {
		return domain.Track{}, nil, ErrInvalidInput
	}
	trackID, err := domain.NormalizeTrackID(trackID)
	if err != nil {
		return domain.Track{}, nil, ErrInvalidInput
	}
	track, err := s.repository.Get(ctx, userID, trackID)
	if err != nil {
		return domain.Track{}, nil, err
	}
	content, err := s.storage.Open(ctx, track.ObjectKey)
	if err != nil {
		return domain.Track{}, nil, err
	}
	return track, content, nil
}

type countingReader struct {
	reader io.Reader
	count  int64
}

func (r *countingReader) Read(buffer []byte) (int, error) {
	n, err := r.reader.Read(buffer)
	r.count += int64(n)
	return n, err
}
