package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

// ─── Minimal JWT (HS256) ──────────────────────────────────────────────────────

func jwtSecret() []byte { return []byte(os.Getenv("JWT_SECRET")) }

type jwtClaims struct {
	Sub  string `json:"sub"`
	Role string `json:"role"`
	Exp  int64  `json:"exp"`
}

func b64(b []byte) string { return base64.RawURLEncoding.EncodeToString(b) }

func IssueToken(userID, role string) (string, error) {
	header := b64([]byte(`{"alg":"HS256","typ":"JWT"}`))
	claims := jwtClaims{Sub: userID, Role: role, Exp: time.Now().Add(24 * time.Hour).Unix()}
	payload, _ := json.Marshal(claims)
	body := header + "." + b64(payload)
	mac := hmac.New(sha256.New, jwtSecret())
	mac.Write([]byte(body))
	return body + "." + b64(mac.Sum(nil)), nil
}

func parseToken(token string) (*jwtClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token")
	}
	body := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, jwtSecret())
	mac.Write([]byte(body))
	expected := b64(mac.Sum(nil))
	if !hmac.Equal([]byte(parts[2]), []byte(expected)) {
		return nil, fmt.Errorf("invalid signature")
	}
	raw, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}
	var c jwtClaims
	if err := json.Unmarshal(raw, &c); err != nil {
		return nil, err
	}
	if time.Now().Unix() > c.Exp {
		return nil, fmt.Errorf("token expired")
	}
	return &c, nil
}

// ─── Context keys ─────────────────────────────────────────────────────────────

type ctxKey string

const (
	CtxUserID ctxKey = "userID"
	CtxRole   ctxKey = "role"
)

// ─── Auth middleware ──────────────────────────────────────────────────────────

// RequireAuth validates the Bearer token and injects userID + role into the request context.
func RequireAuth(db *sql.DB, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}
		claims, err := parseToken(strings.TrimPrefix(auth, "Bearer "))
		if err != nil {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}
		// Inject via context (no extra dep needed)
		r2 := r.WithContext(r.Context())
		r2.Header.Set("X-User-ID", claims.Sub)
		r2.Header.Set("X-User-Role", claims.Role)
		next.ServeHTTP(w, r2)
	})
}

// RequireAdmin rejects non-admin requests (must run after RequireAuth).
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-User-Role") != "admin" {
			http.Error(w, `{"error":"forbidden"}`, http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
