import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Layout.scss';

export default function MainLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main" id="main-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>SongManager &copy; {new Date().getFullYear()} — Proyecto Tecnologías Web II</p>
      </footer>
    </div>
  );
}
