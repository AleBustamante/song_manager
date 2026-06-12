package handlers

import (
	"database/sql"
	"net/http"
	"songmanager/internal/models"
	"strings"

	"github.com/google/uuid"
)

type PlaylistHandler struct{ db *sql.DB }

func NewPlaylistHandler(db *sql.DB) *PlaylistHandler { return &PlaylistHandler{db: db} }

// GET /playlists
func (h *PlaylistHandler) List(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(`SELECT id, name, description, created_at FROM playlists ORDER BY created_at DESC`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	defer rows.Close()

	playlists := []models.Playlist{}
	for rows.Next() {
		var p models.Playlist
		rows.Scan(&p.ID, &p.Name, &p.Description, &p.CreatedAt)
		p.SongIDs = h.getSongIDs(p.ID)
		playlists = append(playlists, p)
	}
	writeJSON(w, http.StatusOK, playlists)
}

// POST /playlists  (admin only)
func (h *PlaylistHandler) Create(w http.ResponseWriter, r *http.Request) {
	var p models.Playlist
	if err := readJSON(r, &p); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request")
		return
	}
	p.Name = strings.TrimSpace(p.Name)
	if p.Name == "" {
		errJSON(w, http.StatusBadRequest, "name is required")
		return
	}
	p.ID = uuid.NewString()

	tx, _ := h.db.Begin()
	_, err := tx.Exec(
		`INSERT INTO playlists (id, name, description) VALUES ($1,$2,$3)`,
		p.ID, p.Name, p.Description,
	)
	if err != nil {
		tx.Rollback()
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	h.insertSongIDs(tx, p.ID, p.SongIDs)
	tx.Commit()

	row := h.db.QueryRow(`SELECT created_at FROM playlists WHERE id=$1`, p.ID)
	row.Scan(&p.CreatedAt)
	writeJSON(w, http.StatusCreated, p)
}

// PUT /playlists/{id}  (admin only)
func (h *PlaylistHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var p models.Playlist
	if err := readJSON(r, &p); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request")
		return
	}

	tx, _ := h.db.Begin()
	res, err := tx.Exec(
		`UPDATE playlists SET name=$1, description=$2 WHERE id=$3`,
		strings.TrimSpace(p.Name), p.Description, id,
	)
	if err != nil {
		tx.Rollback()
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		tx.Rollback()
		errJSON(w, http.StatusNotFound, "playlist not found")
		return
	}
	tx.Exec(`DELETE FROM playlist_songs WHERE playlist_id=$1`, id)
	h.insertSongIDs(tx, id, p.SongIDs)
	tx.Commit()

	p.ID = id
	p.SongIDs = h.getSongIDs(id)
	writeJSON(w, http.StatusOK, p)
}

// DELETE /playlists/{id}  (admin only)
func (h *PlaylistHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	res, err := h.db.Exec(`DELETE FROM playlists WHERE id=$1`, id)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server error")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		errJSON(w, http.StatusNotFound, "playlist not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *PlaylistHandler) getSongIDs(playlistID string) []string {
	rows, err := h.db.Query(
		`SELECT song_id FROM playlist_songs WHERE playlist_id=$1 ORDER BY position`, playlistID,
	)
	if err != nil {
		return []string{}
	}
	defer rows.Close()
	ids := []string{}
	for rows.Next() {
		var id string
		rows.Scan(&id)
		ids = append(ids, id)
	}
	return ids
}

func (h *PlaylistHandler) insertSongIDs(tx *sql.Tx, playlistID string, ids []string) {
	for i, sid := range ids {
		tx.Exec(
			`INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES ($1,$2,$3)
			 ON CONFLICT DO NOTHING`,
			playlistID, sid, i,
		)
	}
}
