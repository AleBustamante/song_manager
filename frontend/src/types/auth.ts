export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  duration: string; // e.g. "3:45"
  genre: string;
  favorite: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songIds: string[];
  createdAt: string;
}
