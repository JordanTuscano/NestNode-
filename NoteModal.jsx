import { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = ['blue', 'green', 'amber', 'rose', 'violet'];

export default function NoteModal({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tags, setTags] = useState((note.tags || []).join(', '));
  const [color, setColor] = useState(note.color || 'blue');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // "work, study" -> ["work", "study"]
    const tagList = [...new Set(tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
    await onSave({ title: title.trim(), content, tags: tagList, color });
    setSaving(false);
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h2>{note._id ? 'Edit note' : 'New note'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <label>Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required autoFocus placeholder="Give your note a title" />
        </label>
        <label>Content
          <textarea rows={7} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something..." />
        </label>
        <label>Tags <small>(separate with commas)</small>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="study, project, ideas" />
        </label>
        <div className="field-row">
          <span>Color</span>
          <div className="swatches">
            {COLORS.map((c) => (
              <button key={c} type="button" data-color={c} aria-label={c}
                className={'swatch' + (c === color ? ' on' : '')} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={saving || !title.trim()}>{saving ? 'Saving...' : 'Save note'}</button>
        </div>
      </form>
    </div>
  );
}
