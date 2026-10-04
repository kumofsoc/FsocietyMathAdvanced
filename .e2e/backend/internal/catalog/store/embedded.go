package store

import (
	"encoding/json"
	"fmt"

	catalogdata "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/data"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/domain"
)

type Source interface {
	Catalog() domain.Catalog
}

type Embedded struct {
	catalog domain.Catalog
}

func LoadEmbedded() (domain.Catalog, error) {
	var catalog domain.Catalog
	if err := json.Unmarshal(catalogdata.CatalogJSON, &catalog); err != nil {
		return domain.Catalog{}, fmt.Errorf("decode embedded course catalog: %w", err)
	}
	if err := catalog.Validate(); err != nil {
		return domain.Catalog{}, fmt.Errorf("validate embedded course catalog: %w", err)
	}
	return catalog, nil
}

func NewEmbedded() (*Embedded, error) {
	catalog, err := LoadEmbedded()
	if err != nil {
		return nil, err
	}
	return &Embedded{catalog: catalog}, nil
}

func (s *Embedded) Catalog() domain.Catalog {
	return s.catalog
}

func MustNewEmbedded() *Embedded {
	store, err := NewEmbedded()
	if err != nil {
		panic(err)
	}
	return store
}
