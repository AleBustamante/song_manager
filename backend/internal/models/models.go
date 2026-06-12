package models

import "time"

type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
)

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Name      string    `json:"name"`
	Role      Role      `json:"role"`
	Password  string    `json:"-"` // never serialized
	CreatedAt time.Time `json:"created_at"`
}

type Song struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Artist   string `json:"artist"`
	Album    string `json:"album"`
	Year     int    `json:"year"`
	Duration string `json:"duration"`
	Genre    string `json:"genre"`
	Favorite bool   `json:"favorite"`
}

type Playlist struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	SongIDs     []string  `json:"songIds"`
	CreatedAt   string    `json:"createdAt"`
}

// Auth payloads
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}
