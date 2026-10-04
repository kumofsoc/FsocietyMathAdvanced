package storage

import (
	"context"
	"encoding/hex"
	"errors"
	"io"
	"os"
	"path/filepath"
)

var ErrInvalidObjectKey = errors.New("invalid object key")

type Filesystem struct {
	root string
}

func NewFilesystem(root string) (*Filesystem, error) {
	absolute, err := filepath.Abs(root)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(absolute, 0o700); err != nil {
		return nil, err
	}
	if err := os.Chmod(absolute, 0o700); err != nil {
		return nil, err
	}
	return &Filesystem{root: absolute}, nil
}

func (s *Filesystem) Put(ctx context.Context, key string, src io.Reader) error {
	path, err := s.objectPath(key)
	if err != nil {
		return err
	}

	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		return err
	}
	ok := false
	defer func() {
		_ = file.Close()
		if !ok {
			_ = os.Remove(path)
		}
	}()

	buffer := make([]byte, 64*1024)
	for {
		if err := ctx.Err(); err != nil {
			return err
		}
		n, readErr := src.Read(buffer)
		if n > 0 {
			if _, err := file.Write(buffer[:n]); err != nil {
				return err
			}
		}
		if errors.Is(readErr, io.EOF) {
			break
		}
		if readErr != nil {
			return readErr
		}
	}
	if err := file.Sync(); err != nil {
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	ok = true
	return nil
}

func (s *Filesystem) Open(_ context.Context, key string) (io.ReadCloser, error) {
	path, err := s.objectPath(key)
	if err != nil {
		return nil, err
	}
	return os.Open(path)
}

func (s *Filesystem) Delete(_ context.Context, key string) error {
	path, err := s.objectPath(key)
	if err != nil {
		return err
	}
	err = os.Remove(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	return err
}

func (s *Filesystem) objectPath(key string) (string, error) {
	if len(key) != 64 {
		return "", ErrInvalidObjectKey
	}
	decoded, err := hex.DecodeString(key)
	if err != nil || len(decoded) != 32 {
		return "", ErrInvalidObjectKey
	}
	if filepath.Base(key) != key {
		return "", ErrInvalidObjectKey
	}

	path := filepath.Join(s.root, key)
	if filepath.Dir(path) != s.root {
		return "", ErrInvalidObjectKey
	}
	return path, nil
}
