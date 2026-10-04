package authhttp

import (
	"errors"
	"net/http"
	"strings"

	authcontext "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/context"
	authservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/service"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

func Require(service *authservice.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := strings.TrimSpace(r.Header.Get("Authorization"))
			scheme, token, ok := strings.Cut(header, " ")
			if !ok || !strings.EqualFold(scheme, "Bearer") || strings.TrimSpace(token) == "" {
				httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authentication required", nil)
				return
			}

			claims, err := service.Authenticate(r.Context(), strings.TrimSpace(token))
			if errors.Is(err, authservice.ErrUnauthorized) {
				httputil.WriteError(w, http.StatusUnauthorized, "unauthorized", "Invalid or expired access token", nil)
				return
			}
			if err != nil {
				httputil.WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error", nil)
				return
			}

			ctx := authcontext.WithIdentity(r.Context(), claims.Subject, claims.SessionID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
