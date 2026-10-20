import { useEffect, useState } from 'react';
import { Archive, FileText, Pin, StickyNote } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api';

const PIE_COLORS = ['#136F63', '#3B82C4', '#D99A1E', '#C9566B', '#7A5BC7', '#6B8794'];
const day = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get('/notes/stats').then(({ data }) => setS(data)).catch((e) => { setFailed(true); toast.error(errorMessage(e)); });
  }, []);

  if (failed) return <div className="empty"><h3>Could not load the dashboard</h3><p className="muted">Check that the API is running, then refresh the page.</p></div>;
  if (!s) return <div className="center-screen"><div className="spinner" /></div>;

  const cards = [
    { label: 'Total notes', value: s.total, icon: FileText },
    { label: 'Active', value: s.total - s.archived, icon: StickyNote },
    { label: 'Pinned', value: s.pinned, icon: Pin },
    { label: 'Archived', value: s.archived, icon: Archive },
  ];

  return (
    <>
      <header className="page-head">
        <div><h1>Dashboard</h1><p className="muted">How your notes are growing.</p></div>
      </header>

      <section className="stats">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat">
            <span className="stat-icon"><Icon size={18} /></span>
            <div><strong>{value}</strong><small>{label}</small></div>
          </div>
        ))}
      </section>

      <section className="panels">
        <div className="panel wide">
          <h3>Notes created in the last 7 days</h3>
          <div className="chart">
            <ResponsiveContainer>
              <BarChart data={s.last7Days.map((d) => ({ ...d, day: day(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="var(--muted)" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="var(--muted)" width={28} />
                <Tooltip cursor={{ fill: 'var(--hover)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10 }} />
                <Bar dataKey="count" name="Notes" fill="var(--brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3>Top tags</h3>
          {s.byTag.length === 0 ? <p className="muted">Add tags to your notes to see them here.</p> : (
            <>
              <div className="chart small">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={s.byTag} dataKey="count" nameKey="tag" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="none">
                      {s.byTag.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="legend">
                {s.byTag.map((t, i) => (
                  <li key={t.tag}><i style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{t.tag}<b>{t.count}</b></li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="panel wide">
          <h3>Recently edited</h3>
          {s.recent.length === 0 ? <p className="muted">Nothing here yet.</p> : (
            <ul className="recent">
              {s.recent.map((n) => (
                <li key={n._id} data-color={n.color}>
                  <i className="dot" /><span>{n.title}</span>
                  <small>{new Date(n.updatedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
