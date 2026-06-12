package handlers

import (
	"database/sql"
	"net/http"
	"songmanager/internal/middleware"
	"songmanager/internal/models"
	"strings"
)

type AuthHandler struct{ db *sql.DB }

func NewAuthHandler(db *sql.DB) *AuthHandler { return &AuthHandler{db: db} }

// POST /auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := readJSON(r, &req); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request")
		return
	}
	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" || req.Password == "" {
		errJSON(w, http.StatusBadRequest, "username and password required")
		return
	}

	var user models.User
	var hash string
	row := h.db.QueryRow(
		`SELECT id, username, name, role, password_hash FROM users WHERE username = $1`,
		req.Username,
	)
	err := row.Scan(&user.ID, &user.Username, &user.Name, &user.Role, &hash)
	if err == sql.ErrNoRows {
		errJSON(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}

	// Plain-text comparison (SHA-256 in a real project; kept simple per brief)
	if hash != req.Password {
		errJSON(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := middleware.IssueToken(user.ID, string(user.Role))
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "could not issue token")
		return
	}

	writeJSON(w, http.StatusOK, models.AuthResponse{User: user, Token: token})
}

// GET /auth/verify  (Bearer token required)
func (h *AuthHandler) Verify(w http.ResponseWriter, r *http.Request) {
	id := r.Header.Get("X-User-ID")
	var user models.User
	row := h.db.QueryRow(
		`SELECT id, username, name, role FROM users WHERE id = $1`, id,
	)
	if err := row.Scan(&user.ID, &user.Username, &user.Name, &user.Role); err != nil {
		errJSON(w, http.StatusUnauthorized, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, user)
}
