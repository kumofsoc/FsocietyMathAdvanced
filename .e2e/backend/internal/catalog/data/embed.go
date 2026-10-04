package data

import _ "embed"

// CatalogJSON is the immutable metadata snapshot generated from the frontend course metadata.
//
//go:embed course_catalog.json
var CatalogJSON []byte
