-- =============================================================
--  SongManager – Schema PostgreSQL
--  Ejecutar una sola vez para crear todas las tablas y datos
--  de prueba iniciales.
-- =============================================================

-- ── Extensiones ───────────────────────────────────────────────
-- (uuid-ossp no es necesario porque el backend genera UUIDs en Go,
--  pero lo incluimos por si quieres insertar filas manualmente)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tabla: users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            TEXT        PRIMARY KEY,          -- UUID generado en Go
    username      TEXT        NOT NULL UNIQUE,
    name          TEXT        NOT NULL,
    role          TEXT        NOT NULL CHECK (role IN ('admin', 'user')),
    password_hash TEXT        NOT NULL,             -- En este proyecto: texto plano (ver auth.go)
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: songs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS songs (
    id        TEXT    PRIMARY KEY,                  -- UUID generado en Go
    title     TEXT    NOT NULL,
    artist    TEXT    NOT NULL,
    album     TEXT    NOT NULL DEFAULT '',
    year      INTEGER NOT NULL DEFAULT 0,
    duration  TEXT    NOT NULL DEFAULT '',          -- Ej: "3:45"
    genre     TEXT    NOT NULL DEFAULT '',
    favorite  BOOLEAN NOT NULL DEFAULT FALSE
);

-- ── Tabla: playlists ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlists (
    id          TEXT        PRIMARY KEY,            -- UUID generado en Go
    name        TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: playlist_songs (relación N:M ordenada) ─────────────
CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id TEXT    NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id     TEXT    NOT NULL REFERENCES songs(id)     ON DELETE CASCADE,
    position    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (playlist_id, song_id)
);

-- ── Índices útiles ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_songs_title    ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist   ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_pl_songs_pl    ON playlist_songs(playlist_id);

-- =============================================================
--  DATOS DE PRUEBA
--  Contraseñas en texto plano porque auth.go hace comparación
--  directa (ver comentario en handlers/auth.go).
--  admin: admin123  |  user: user123
-- =============================================================

INSERT INTO users (id, username, name, role, password_hash) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrador', 'admin', 'admin123'),
    ('00000000-0000-0000-0000-000000000002', 'user',  'Usuario Demo',  'user',  'user123')
ON CONFLICT (username) DO NOTHING;

INSERT INTO songs (id, title, artist, album, year, duration, genre, favorite) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Bohemian Rhapsody',    'Queen',       'A Night at the Opera',   1975, '5:55', 'Rock',      TRUE),
    ('10000000-0000-0000-0000-000000000002', 'Hotel California',     'Eagles',      'Hotel California',       1977, '6:30', 'Rock',      FALSE),
    ('10000000-0000-0000-0000-000000000003', 'Stairway to Heaven',   'Led Zeppelin','Led Zeppelin IV',        1971, '8:02', 'Rock',      TRUE),
    ('10000000-0000-0000-0000-000000000004', 'Smells Like Teen Spirit','Nirvana',   'Nevermind',              1991, '5:01', 'Grunge',    FALSE),
    ('10000000-0000-0000-0000-000000000005', 'Like a Rolling Stone', 'Bob Dylan',   'Highway 61 Revisited',   1965, '6:13', 'Folk Rock', FALSE),
    ('10000000-0000-0000-0000-000000000006', 'Purple Rain',          'Prince',      'Purple Rain',            1984, '8:41', 'R&B',       TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO playlists (id, name, description) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Clásicos del Rock', 'Los mejores clásicos de todos los tiempos'),
    ('20000000-0000-0000-0000-000000000002', 'Mis Favoritas',     'Canciones que no puedo dejar de escuchar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 0),
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1),
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 2),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 0),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 2)
ON CONFLICT (playlist_id, song_id) DO NOTHING;
