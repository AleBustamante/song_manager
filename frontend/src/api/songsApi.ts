import type { Song, Playlist } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || null;

let mockSongs: Song[] = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', year: 1975, duration: '5:55', genre: 'Rock', favorite: true },
  { id: '2', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', year: 1977, duration: '6:30', genre: 'Rock', favorite: false },
  { id: '3', title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', year: 1971, duration: '8:02', genre: 'Rock', favorite: true },
  { id: '4', title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', year: 1991, duration: '5:01', genre: 'Grunge', favorite: false },
  { id: '5', title: 'Like a Rolling Stone', artist: 'Bob Dylan', album: 'Highway 61 Revisited', year: 1965, duration: '6:13', genre: 'Folk Rock', favorite: false },
  { id: '6', title: 'Purple Rain', artist: 'Prince', album: 'Purple Rain', year: 1984, duration: '8:41', genre: 'R&B', favorite: true },
];

let mockPlaylists: Playlist[] = [
  { id: '1', name: 'Clásicos del Rock', description: 'Los mejores clásicos de todos los tiempos', songIds: ['1', '2', '3'], createdAt: '2024-01-15' },
  { id: '2', name: 'Mis Favoritas', description: 'Canciones que no puedo dejar de escuchar', songIds: ['1', '3', '6'], createdAt: '2024-02-20' },
];

function delay(ms = 300) { return new Promise(r => setTimeout(r, ms)); }

function headers(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Songs ────────────────────────────────────────────────────────────────────
export async function getSongs(token?: string): Promise<Song[]> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/songs`, { headers: headers(token) });
    if (!res.ok) throw new Error('Error al obtener canciones');
    return res.json();
  }
  await delay();
  return [...mockSongs];
}

export async function createSong(data: Omit<Song, 'id'>, token?: string): Promise<Song> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/songs`, { method: 'POST', headers: headers(token), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al crear canción');
    return res.json();
  }
  await delay();
  const song: Song = { ...data, id: Date.now().toString() };
  mockSongs.push(song);
  return song;
}

export async function updateSong(id: string, data: Partial<Song>, token?: string): Promise<Song> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/songs/${id}`, { method: 'PUT', headers: headers(token), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al actualizar canción');
    return res.json();
  }
  await delay();
  const idx = mockSongs.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Canción no encontrada');
  mockSongs[idx] = { ...mockSongs[idx], ...data };
  return mockSongs[idx];
}

export async function deleteSong(id: string, token?: string): Promise<void> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/songs/${id}`, { method: 'DELETE', headers: headers(token) });
    if (!res.ok) throw new Error('Error al eliminar canción');
    return;
  }
  await delay();
  mockSongs = mockSongs.filter(s => s.id !== id);
}

// ─── Playlists ────────────────────────────────────────────────────────────────
export async function getPlaylists(token?: string): Promise<Playlist[]> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/playlists`, { headers: headers(token) });
    if (!res.ok) throw new Error('Error al obtener playlists');
    return res.json();
  }
  await delay();
  return [...mockPlaylists];
}

export async function createPlaylist(data: Omit<Playlist, 'id' | 'createdAt'>, token?: string): Promise<Playlist> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/playlists`, { method: 'POST', headers: headers(token), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al crear playlist');
    return res.json();
  }
  await delay();
  const playlist: Playlist = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
  mockPlaylists.push(playlist);
  return playlist;
}

export async function updatePlaylist(id: string, data: Partial<Playlist>, token?: string): Promise<Playlist> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/playlists/${id}`, { method: 'PUT', headers: headers(token), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al actualizar playlist');
    return res.json();
  }
  await delay();
  const idx = mockPlaylists.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Playlist no encontrada');
  mockPlaylists[idx] = { ...mockPlaylists[idx], ...data };
  return mockPlaylists[idx];
}

export async function deletePlaylist(id: string, token?: string): Promise<void> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/playlists/${id}`, { method: 'DELETE', headers: headers(token) });
    if (!res.ok) throw new Error('Error al eliminar playlist');
    return;
  }
  await delay();
  mockPlaylists = mockPlaylists.filter(p => p.id !== id);
}
