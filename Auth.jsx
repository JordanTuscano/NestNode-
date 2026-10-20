import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { errorMessage } from '../api';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register(form);
      navigate('/');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-side">
        <div className="logo light"><span className="logo-mark">N</span>NestNode</div>
        <div>
          <h1>Notes that stay organised.</h1>
          <ul>
            <li>Pin what matters and archive the rest</li>
            <li>Find any note with search and tags</li>
            <li>See your progress on the dashboard</li>
          </ul>
        </div>
        <small>Built with MongoDB, NestJS, React and Node.</small>
      </section>

      <section className="auth-form">
        <form onSubmit={submit}>
          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="muted">{isLogin ? 'Log in to see your notes.' : 'It takes less than a minute.'}</p>
          {!isLogin && (
            <label>Name<input value={form.name} onChange={set('name')} required minLength={2} placeholder="Your name" /></label>
          )}
          <label>Email<input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" /></label>
          <label>Password<input type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="At least 6 characters" /></label>
          <button className="btn full" disabled={busy}>{busy ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}</button>
          <p className="switch">
            {isLogin ? 'New to NestNode? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
