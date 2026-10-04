package app

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	activityrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/repository"
	activityservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/service"
	activityhttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/activity/transport/http"
	authrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/repository"
	authservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/service"
	authhttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/auth/transport/http"
	bookmarksrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/repository"
	bookmarksservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/service"
	bookmarkshttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bookmarks/transport/http"
	bootstrapservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bootstrap/service"
	bootstraphttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/bootstrap/transport/http"
	catalogservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/service"
	catalogstore "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/store"
	cataloghttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/catalog/transport/http"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/config"
	importantrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/repository"
	importantservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/service"
	importanthttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/importantblocks/transport/http"
	mediarepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/repository"
	mediaservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/service"
	mediastorage "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/storage"
	mediahttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/media/transport/http"
	notesrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/repository"
	notesservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/service"
	noteshttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/notes/transport/http"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/middleware"
	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/security"
	preferencesrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/repository"
	preferencesservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/service"
	preferenceshttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/preferences/transport/http"
	progressrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/repository"
	progressservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/service"
	progresshttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/progress/transport/http"
	searchindex "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/index"
	searchservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/service"
	searchhttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/search/transport/http"
	httptransport "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/transport/http"
	usersrepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/repository"
	usersservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/service"
	usershttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/users/transport/http"
	workspacerepo "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/repository"
	workspaceservice "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/service"
	workspacehttp "github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/workspace/transport/http"
)

const (
	defaultRequestBodyLimit = int64(1 << 20)
	mediaMultipartOverhead  = int64(1 << 20)
)

type Dependencies struct {
	Config config.Config
	Logger *slog.Logger
	DB     *pgxpool.Pool
}

func Handler(deps Dependencies) http.Handler {
	mux := http.NewServeMux()
	system := httptransport.NewSystemHandler(deps.DB, deps.Config.AppEnv)

	userRepository := usersrepo.NewPostgres(deps.DB)
	sessionRepository := authrepo.NewPostgres(deps.DB)
	progressRepository := progressrepo.NewPostgres(deps.DB)
	preferencesRepository := preferencesrepo.NewPostgres(deps.DB)
	workspaceRepository := workspacerepo.NewPostgres(deps.DB)
	activityRepository := activityrepo.NewPostgres(deps.DB)
	bookmarksRepository := bookmarksrepo.NewPostgres(deps.DB)
	notesRepository := notesrepo.NewPostgres(deps.DB)
	importantRepository := importantrepo.NewPostgres(deps.DB)
	catalogStore := catalogstore.MustNewEmbedded()

	accessTokens := security.NewAccessManager(deps.Config.JWTSecret, deps.Config.JWTAccessTTL)
	authService := authservice.New(userRepository, sessionRepository, accessTokens, deps.Config.JWTRefreshTTL, time.Now)
	userService := usersservice.New(userRepository)
	progressService := progressservice.New(progressRepository, time.Now, catalogStore.Catalog())
	preferencesService := preferencesservice.New(preferencesRepository, time.Now)
	workspaceService := workspaceservice.New(workspaceRepository, catalogStore.Catalog(), time.Now)
	activityService := activityservice.New(activityRepository, time.Now)
	bookmarksService := bookmarksservice.New(bookmarksRepository, time.Now)
	notesService := notesservice.New(notesRepository, catalogStore.Catalog(), time.Now)
	importantService := importantservice.New(importantRepository, catalogStore.Catalog(), time.Now)
	catalogService := catalogservice.New(catalogStore)
	searchService := searchservice.New(searchindex.Build(catalogStore.Catalog()))

	authHandler := authhttp.New(authService, authhttp.CookieConfig{
		Name:   deps.Config.RefreshCookieName,
		TTL:    deps.Config.JWTRefreshTTL,
		Secure: deps.Config.AppEnv == "production",
	})
	userHandler := usershttp.New(userService)
	progressHandler := progresshttp.New(progressService, catalogStore.Catalog())
	preferencesHandler := preferenceshttp.New(preferencesService)
	workspaceHandler := workspacehttp.New(workspaceService)
	activityHandler := activityhttp.New(activityService, time.Now)
	bookmarksHandler := bookmarkshttp.New(bookmarksService)
	notesHandler := noteshttp.New(notesService)
	importantHandler := importanthttp.New(importantService, catalogStore.Catalog())
	catalogHandler := cataloghttp.New(catalogService)
	searchHandler := searchhttp.New(searchService)

	mediaHandler := mediahttp.Unavailable()
	mediaAudioAvailable := false
	if deps.Config.MediaEnabled {
		objectStorage, err := mediastorage.NewFilesystem(deps.Config.MediaStoragePath)
		if err != nil {
			if deps.Logger != nil {
				deps.Logger.Warn("media storage unavailable", "error", err)
			}
		} else {
			mediaRepository := mediarepo.NewPostgres(deps.DB)
			mediaService := mediaservice.New(mediaRepository, objectStorage, deps.Config.MediaMaxAudioBytes)
			mediaHandler = mediahttp.New(mediaService)
			mediaAudioAvailable = true
		}
	}

	bootstrapService := bootstrapservice.New(
		userService,
		preferencesService,
		workspaceService,
		progressService,
		bootstrapservice.Capabilities{MediaAudio: mediaAudioAvailable},
		time.Now,
	)
	bootstrapHandler := bootstraphttp.New(bootstrapService)

	requireAuth := authhttp.Require(authService)
	authLimiter := middleware.NewIPRateLimiter(20, time.Minute)
	authOrigin := middleware.OriginGuard(deps.Config.CORSAllowedOrigins)

	mux.HandleFunc("GET /health", system.Health)
	mux.HandleFunc("GET /ready", system.Ready)
	mux.HandleFunc("GET /api/v1/meta", system.Meta)

	mux.Handle("POST /api/v1/auth/register", authLimiter.Middleware(http.HandlerFunc(authHandler.Register)))
	mux.Handle("POST /api/v1/auth/login", authLimiter.Middleware(http.HandlerFunc(authHandler.Login)))
	mux.Handle("POST /api/v1/auth/refresh", authOrigin(authLimiter.Middleware(http.HandlerFunc(authHandler.Refresh))))
	mux.Handle("POST /api/v1/auth/logout", authOrigin(http.HandlerFunc(authHandler.Logout)))

	mux.Handle("GET /api/v1/me", requireAuth(http.HandlerFunc(userHandler.Me)))
	mux.Handle("GET /api/v1/me/bootstrap", requireAuth(http.HandlerFunc(bootstrapHandler.Get)))
	mux.Handle("PATCH /api/v1/me/profile", requireAuth(http.HandlerFunc(userHandler.UpdateProfile)))

	mux.Handle("GET /api/v1/me/preferences", requireAuth(http.HandlerFunc(preferencesHandler.Get)))
	mux.Handle("PUT /api/v1/me/preferences", requireAuth(http.HandlerFunc(preferencesHandler.Replace)))

	mux.Handle("GET /api/v1/me/workspace", requireAuth(http.HandlerFunc(workspaceHandler.Get)))
	mux.Handle("PUT /api/v1/me/workspace/saved-topics/{topicId}", requireAuth(http.HandlerFunc(workspaceHandler.SaveTopic)))
	mux.Handle("DELETE /api/v1/me/workspace/saved-topics/{topicId}", requireAuth(http.HandlerFunc(workspaceHandler.UnsaveTopic)))
	mux.Handle("PUT /api/v1/me/workspace/topics/{topicId}/resume", requireAuth(http.HandlerFunc(workspaceHandler.SetResume)))
	mux.Handle("PUT /api/v1/me/workspace/reading-width", requireAuth(http.HandlerFunc(workspaceHandler.SetReadingWidth)))

	mux.Handle("GET /api/v1/progress", requireAuth(http.HandlerFunc(progressHandler.Get)))
	mux.Handle("PUT /api/v1/progress", requireAuth(http.HandlerFunc(progressHandler.Sync)))
	mux.Handle("PATCH /api/v1/progress/topics/{topicId}", requireAuth(http.HandlerFunc(progressHandler.PatchTopic)))
	mux.Handle("PUT /api/v1/progress/exercises/{taskId}", requireAuth(http.HandlerFunc(progressHandler.PutExercise)))
	mux.Handle("DELETE /api/v1/progress/exercises/{taskId}", requireAuth(http.HandlerFunc(progressHandler.DeleteExercise)))
	mux.Handle("PUT /api/v1/progress/theorems/{theoremId}", requireAuth(http.HandlerFunc(progressHandler.PutTheorem)))
	mux.Handle("DELETE /api/v1/progress/theorems/{theoremId}", requireAuth(http.HandlerFunc(progressHandler.DeleteTheorem)))
	mux.Handle("PUT /api/v1/progress/resume", requireAuth(http.HandlerFunc(progressHandler.PutResume)))

	mux.Handle("GET /api/v1/me/learning", requireAuth(http.HandlerFunc(progressHandler.Learning)))
	mux.Handle("POST /api/v1/me/learning/sync", requireAuth(http.HandlerFunc(progressHandler.Sync)))
	mux.Handle("GET /api/v1/me/progress", requireAuth(http.HandlerFunc(progressHandler.Get)))
	mux.Handle("GET /api/v1/me/progress/topics/{topicId}", requireAuth(http.HandlerFunc(progressHandler.Topic)))
	mux.Handle("PUT /api/v1/me/progress/topics/{topicId}", requireAuth(http.HandlerFunc(progressHandler.PutTopic)))
	mux.Handle("POST /api/v1/me/theory/{topicId}/complete", requireAuth(http.HandlerFunc(progressHandler.CompleteTheory)))
	mux.Handle("DELETE /api/v1/me/theory/{topicId}/complete", requireAuth(http.HandlerFunc(progressHandler.UncompleteTheory)))
	mux.Handle("POST /api/v1/me/exercises/{exerciseId}/solve", requireAuth(http.HandlerFunc(progressHandler.SolveExercise)))
	mux.Handle("DELETE /api/v1/me/exercises/{exerciseId}/solve", requireAuth(http.HandlerFunc(progressHandler.DeleteExercise)))
	mux.Handle("GET /api/v1/me/resume", requireAuth(http.HandlerFunc(progressHandler.GetResume)))
	mux.Handle("PUT /api/v1/me/resume", requireAuth(http.HandlerFunc(progressHandler.PutResume)))

	mux.Handle("PUT /api/v1/me/reading-blocks/{topicId}/{blockIndex}", requireAuth(http.HandlerFunc(progressHandler.MarkReadingBlock)))
	mux.Handle("POST /api/v1/me/reading-blocks/sync", requireAuth(http.HandlerFunc(progressHandler.SyncReadingBlocks)))

	mux.Handle("GET /api/v1/me/activity", requireAuth(http.HandlerFunc(activityHandler.List)))
	mux.Handle("GET /api/v1/me/activity/heatmap", requireAuth(http.HandlerFunc(activityHandler.Heatmap)))
	mux.Handle("GET /api/v1/me/activity/stats", requireAuth(http.HandlerFunc(activityHandler.Stats)))

	mux.Handle("GET /api/v1/me/bookmarks", requireAuth(http.HandlerFunc(bookmarksHandler.List)))
	mux.Handle("POST /api/v1/me/bookmarks", requireAuth(http.HandlerFunc(bookmarksHandler.Create)))
	mux.Handle("DELETE /api/v1/me/bookmarks/{id}", requireAuth(http.HandlerFunc(bookmarksHandler.Delete)))

	mux.Handle("GET /api/v1/me/notes", requireAuth(http.HandlerFunc(notesHandler.List)))
	mux.Handle("GET /api/v1/me/notes/{topicId}/{blockIndex}", requireAuth(http.HandlerFunc(notesHandler.Get)))
	mux.Handle("PUT /api/v1/me/notes/{topicId}/{blockIndex}", requireAuth(http.HandlerFunc(notesHandler.Put)))
	mux.Handle("DELETE /api/v1/me/notes/{topicId}/{blockIndex}", requireAuth(http.HandlerFunc(notesHandler.Delete)))

	mux.Handle("GET /api/v1/me/important-blocks", requireAuth(http.HandlerFunc(importantHandler.List)))
	mux.Handle("PUT /api/v1/me/important-blocks/{topicId}/{blockIndex}", requireAuth(http.HandlerFunc(importantHandler.Put)))
	mux.Handle("DELETE /api/v1/me/important-blocks/{topicId}/{blockIndex}", requireAuth(http.HandlerFunc(importantHandler.Delete)))

	mux.HandleFunc("GET /api/v1/course", catalogHandler.Summary)
	mux.HandleFunc("GET /api/v1/course/chapters", catalogHandler.Chapters)
	mux.HandleFunc("GET /api/v1/course/chapters/{chapterId}", catalogHandler.Chapter)
	mux.HandleFunc("GET /api/v1/course/topics/{topicId}", catalogHandler.Topic)
	mux.HandleFunc("GET /api/v1/course/topics/{topicId}/prerequisites", catalogHandler.Prerequisites)
	mux.HandleFunc("GET /api/v1/search", searchHandler.Search)

	mux.Handle("POST /api/v1/me/media/audio", requireAuth(http.HandlerFunc(mediaHandler.Upload)))
	mux.Handle("GET /api/v1/me/media/audio", requireAuth(http.HandlerFunc(mediaHandler.List)))
	mux.Handle("PUT /api/v1/me/media/audio/order", requireAuth(http.HandlerFunc(mediaHandler.Reorder)))
	mux.Handle("PATCH /api/v1/me/media/audio/{id}", requireAuth(http.HandlerFunc(mediaHandler.Rename)))
	mux.Handle("DELETE /api/v1/me/media/audio/{id}", requireAuth(http.HandlerFunc(mediaHandler.Delete)))
	mux.Handle("GET /api/v1/me/media/audio/{id}/content", requireAuth(http.HandlerFunc(mediaHandler.Content)))

	bodyLimitOverrides := make([]middleware.BodyLimitOverride, 0, 1)
	if deps.Config.MediaEnabled {
		bodyLimitOverrides = append(bodyLimitOverrides, middleware.BodyLimitOverride{
			Method: http.MethodPost,
			Path:   "/api/v1/me/media/audio",
			Bytes:  deps.Config.MediaMaxAudioBytes + mediaMultipartOverhead,
		})
	}

	return middleware.Chain(
		mux,
		middleware.Recover(deps.Logger),
		middleware.RequestID,
		middleware.AccessLog(deps.Logger),
		middleware.SecurityHeaders,
		middleware.CORS(deps.Config.CORSAllowedOrigins),
		middleware.BodyLimitWithOverrides(defaultRequestBodyLimit, bodyLimitOverrides...),
	)
}
