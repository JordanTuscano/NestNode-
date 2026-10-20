import { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

export default function Notes({ archived = false }) {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new note, note = editing

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/notes', { params: { search, tag, archived } });
      setNotes(data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, tag, archived]);

  // Wait 250ms after the last keystroke before calling the API (debounce)
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const save = async (values) => {
    try {
      if (editing._id) await api.patch(`/notes/${editing._id}`, values);
      else await api.post('/notes', values);
      toast.success(editing._id ? 'Note updated' : 'Note created');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const patch = async (note, body, message) => {
    try { await api.patch(`/notes/${note._id}`, body); toast.success(message); load(); }
    catch (err) { toast.error(errorMessage(err)); }
  };

  const remove = async (note) => {
    if (!window.confirm(`Delete "${note.title}"? This cannot be undone.`)) return;
    try { await api.delete(`/notes/${note._id}`); toast.success('Note deleted'); load(); }
    catch (err) { toast.error(errorMessage(err)); }
  };

  const allTags = [...new Set([...(tag ? [tag] : []), ...notes.flatMap((n) => n.tags)])];

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{archived ? 'Archive' : 'Notes'}</h1>
          <p className="muted">{archived ? 'Notes you have put away.' : 'Everything you are working on, in one place.'}</p>
        </div>
        {!archived && <button className="btn" onClick={() => setEditing({})}><Plus size={18} /> New note</button>}
      </header>

      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input placeholder="Search title or content" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {allTags.length > 0 && (
          <div className="chips">
            <button className={'chip' + (!tag ? ' on' : '')} onClick={() => setTag('')}>All</button>
            {allTags.map((t) => (
              <button key={t} className={'chip' + (tag === t ? ' on' : '')} onClick={() => setTag(t)}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid">{[1, 2, 3].map((i) => <div key={i} className="card skeleton" />)}</div>
      ) : notes.length === 0 ? (
        <div className="empty">
          <h3>{search || tag ? 'No notes match your filters' : archived ? 'Your archive is empty' : 'No notes yet'}</h3>
          <p className="muted">
            {search || tag ? 'Try a different search or clear the tag filter.' : archived ? 'Archived notes will show up here.' : 'Create your first note to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {notes.map((n) => (
            <NoteCard key={n._id} note={n} onOpen={setEditing}
              onPin={(x) => patch(x, { isPinned: !x.isPinned }, x.isPinned ? 'Note unpinned' : 'Note pinned')}
              onArchive={(x) => patch(x, { isArchived: !x.isArchived }, x.isArchived ? 'Note restored' : 'Note archived')}
              onDelete={remove} />
          ))}
        </div>
      )}

      {editing && <NoteModal note={editing} onClose={() => setEditing(null)} onSave={save} />}
    </>
  );
}
