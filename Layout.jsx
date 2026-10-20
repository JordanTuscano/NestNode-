import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Archive, LayoutDashboard, LogOut, Moon, StickyNote, Sun } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('nestnode_theme', next);
    setTheme(next);
  };

  const link = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo"><span className="logo-mark">N</span>NestNode</div>
        <nav className="nav">
          <NavLink to="/" end className={link}><StickyNote size={18} /> Notes</NavLink>
          <NavLink to="/archive" className={link}><Archive size={18} /> Archive</NavLink>
          <NavLink to="/dashboard" className={link}><LayoutDashboard size={18} /> Dashboard</NavLink>
        </nav>
        <div className="sidebar-foot">
          <button className="nav-link" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <div className="user-chip">
            <span className="avatar">{user.name[0].toUpperCase()}</span>
            <div className="user-meta"><strong>{user.name}</strong><small>{user.email}</small></div>
            <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
