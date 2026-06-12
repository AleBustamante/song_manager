package handlers

import (
	"database/sql"
	"net/http"
	"songmanager/internal/models"
	"strings"

	"github.com/google/uuid"
)

type SongHandler struct{ db *sql.DB }

func NewSongHandler(db *sql.DB) *SongHandler { return &SongHandler{db: db} }

// GET /songs
func (h *SongHandler) List(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(`SELECT id, title, artist, album, year, duration, genre, favorite FROM songs ORDER BY title`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	defer rows.Close()

	songs := []models.Song{}
	for rows.Next() {
		var s models.Song
		rows.Scan(&s.ID, &s.Title, &s.Artist, &s.Album, &s.Year, &s.Duration, &s.Genre, &s.Favorite)
		songs = append(songs, s)
	}
	writeJSON(w, http.StatusOK, songs)
}

// POST /songs  (admin only)
func (h *SongHandler) Create(w http.ResponseWriter, r *http.Request) {
	var s models.Song
	if err := readJSON(r, &s); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request")
		return
	}
	if err := validateSong(&s); err != "" {
		errJSON(w, http.StatusBadRequest, err)
		return
	}
	s.ID = uuid.NewString()
	_, err := h.db.Exec(
		`INSERT INTO songs (id, title, artist, album, year, duration, genre, favorite)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		s.ID, s.Title, s.Artist, s.Album, s.Year, s.Duration, s.Genre, s.Favorite,
	)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	writeJSON(w, http.StatusCreated, s)
}

// PUT /songs/{id}  (admin only)
func (h *SongHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var s models.Song
	if err := readJSON(r, &s); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request")
		return
	}
	res, err := h.db.Exec(
		`UPDATE songs SET title=$1, artist=$2, album=$3, year=$4, duration=$5, genre=$6, favorite=$7 WHERE id=$8`,
		s.Title, s.Artist, s.Album, s.Year, s.Duration, s.Genre, s.Favorite, id,
	)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		errJSON(w, http.StatusNotFound, "song not found")
		return
	}
	s.ID = id
	writeJSON(w, http.StatusOK, s)
}

// DELETE /songs/{id}  (admin only)
func (h *SongHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	res, err := h.db.Exec(`DELETE FROM songs WHERE id=$1`, id)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		errJSON(w, http.StatusNotFound, "song not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func validateSong(s *models.Song) string {
	s.Title = strings.TrimSpace(s.Title)
	s.Artist = strings.TrimSpace(s.Artist)
	s.Album = strings.TrimSpace(s.Album)
	if s.Title == "" { return "title is required" }
	if s.Artist == "" { return "artist is required" }
	if s.Year < 1900 { return "invalid year" }
	return ""
}
