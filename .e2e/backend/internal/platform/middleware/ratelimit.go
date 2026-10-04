package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/kumofsoc/FsocietyMathAdvancedBackend/internal/platform/httputil"
)

type rateBucket struct {
	start time.Time
	count int
}

type IPRateLimiter struct {
	mu      sync.Mutex
	limit   int
	window  time.Duration
	buckets map[string]rateBucket
	now     func() time.Time
}

func NewIPRateLimiter(limit int, window time.Duration) *IPRateLimiter {
	return &IPRateLimiter{
		limit:   limit,
		window:  window,
		buckets: make(map[string]rateBucket),
		now:     time.Now,
	}
}

func (l *IPRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !l.allow(remoteIP(r.RemoteAddr)) {
			httputil.WriteError(w, http.StatusTooManyRequests, "rate_limited", "Too many requests", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (l *IPRateLimiter) allow(key string) bool {
	now := l.now().UTC()
	l.mu.Lock()
	defer l.mu.Unlock()

	bucket, ok := l.buckets[key]
	if !ok || now.Sub(bucket.start) >= l.window {
		l.buckets[key] = rateBucket{start: now, count: 1}
		return true
	}
	if bucket.count >= l.limit {
		return false
	}
	bucket.count++
	l.buckets[key] = bucket

	if len(l.buckets) > 10000 {
		for candidate, value := range l.buckets {
			if now.Sub(value.start) >= l.window {
				delete(l.buckets, candidate)
			}
		}
	}
	return true
}

func remoteIP(remoteAddr string) string {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err == nil {
		return host
	}
	return remoteAddr
}
