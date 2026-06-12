package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	// Pure stdlib — postgres driver via blank import in main
	_ "github.com/lib/pq"
)

// Open returns a connected *sql.DB using DATABASE_URL env var.
func Open() (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL not set")
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("cannot reach database: %w", err)
	}
	log.Println("database connected")
	return db, nil
}
