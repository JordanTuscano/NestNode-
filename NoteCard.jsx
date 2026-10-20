import { Archive, ArchiveRestore, Pin, PinOff, Trash2 } from 'lucide-react';

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default function NoteCard({ note, onOpen, onPin, onArchive, onDelete }) {
  // stopPropagation keeps a click on a button from also opening the editor
  const act = (fn) => (e) => { e.stopPropagation(); fn(note); };

  return (
    <article className="card" data-color={note.color} onClick={() => onOpen(note)}>
      <div className="card-top">
        <h3>{note.title}</h3>
        {note.isPinned && <Pin size={15} className="pin-on" />}
      </div>
      <p className="card-body">{note.content || 'No content'}</p>
      {note.tags.length > 0 && (
        <div className="tags">{note.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      )}
      <footer className="card-foot">
        <small>{fmt(note.updatedAt)}</small>
        <div className="card-actions">
          <button className="icon-btn" onClick={act(onPin)} title={note.isPinned ? 'Unpin' : 'Pin'}>
            {note.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button className="icon-btn" onClick={act(onArchive)} title={note.isArchived ? 'Restore' : 'Archive'}>
            {note.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </button>
          <button className="icon-btn danger" onClick={act(onDelete)} title="Delete"><Trash2 size={16} /></button>
        </div>
      </footer>
    </article>
  );
}
