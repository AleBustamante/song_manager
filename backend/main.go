package main

import (
	"log"
	"net/http"
	"os"
	"songmanager/internal/db"
	"songmanager/internal/handlers"
	"songmanager/internal/middleware"
)

func main() {
	database, err := db.Open()
	if err != nil {
		log.Fatal("db:", err)
	}
	defer database.Close()

	auth := handlers.NewAuthHandler(database)
	songs := handlers.NewSongHandler(database)
	playlists := handlers.NewPlaylistHandler(database)

	mux := http.NewServeMux()

	// ─── CORS wrapper ─────────────────────────────────────────────────────────
	cors := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin == "" {
				origin = "*"
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			h.ServeHTTP(w, r)
		})
	}

	// ─── Auth routes (public) ─────────────────────────────────────────────────
	mux.HandleFunc("POST /auth/login", auth.Login)
	mux.Handle("GET /auth/verify", middleware.RequireAuth(database,
		http.HandlerFunc(auth.Verify),
	))

	// ─── Song routes ─────────────────────────────────────────────────────────
	mux.Handle("GET /songs", middleware.RequireAuth(database,
		http.HandlerFunc(songs.List),
	))
	mux.Handle("POST /songs", middleware.RequireAuth(database, middleware.RequireAdmin(
		http.HandlerFunc(songs.Create),
	)))
	mux.Handle("PUT /songs/{id}", middleware.RequireAuth(database, middleware.RequireAdmin(
		http.HandlerFunc(songs.Update),
	)))
	mux.Handle("DELETE /songs/{id}", middleware.RequireAuth(database, middleware.RequireAdmin(
		http.HandlerFunc(songs.Delete),
	)))

	// ─── Playlist routes ──────────────────────────────────────────────────────
	mux.Handle("GET /playlists", middleware.RequireAuth(database,
		http.HandlerFunc(playlists.List),
	))
	mux.Handle("POST /playlists", middleware.RequireAuth(database, middleware.RequireAdmin(
		http.HandlerFunc(playlists.Create),
	)))
	mux.Handle("PUT /playlists/{id}", middleware.RequireAuth(database, middleware.RequireAdmin(
		http.HandlerFunc(playlists.Update),
	)))
	mux.Handle("DELETE /playlists/{id}", middleware.RequireAuth(database, middleware.RequireAdmin(
		http.HandlerFunc(playlists.Delete),
	)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, cors(mux)))
}
