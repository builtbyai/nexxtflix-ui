import React, { useState } from 'react';
import './NotesTab.css';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  color: string;
}

interface Props {
  onOpenAI: () => void;
}

export default function NotesTab({ onOpenAI }: Props) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Project Ideas',
      content: 'Build a new dashboard feature',
      createdAt: new Date(),
      color: 'bg-yellow-500'
    },
    {
      id: '2',
      title: 'Meeting Notes',
      content: 'Discuss Q2 goals and timeline',
      createdAt: new Date(Date.now() - 86400000),
      color: 'bg-pink-500'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (newTitle.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newTitle,
        content: '',
        createdAt: new Date(),
        color: `bg-${['yellow', 'pink', 'blue', 'green', 'purple'][Math.floor(Math.random() * 5)]}-500`
      };
      setNotes([newNote, ...notes]);
      setNewTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className="notes-tab">
      <div className="notes-header">
        <h2 className="notes-title">Notes</h2>
        <button className="notes-ai-btn" onClick={onOpenAI} title="AI Assistant">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </button>
      </div>

      {isCreating ? (
        <div className="notes-create-form">
          <input
            type="text"
            placeholder="Note title..."
            className="notes-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <div className="notes-form-actions">
            <button
              className="notes-form-btn notes-form-btn--primary"
              onClick={handleCreate}
              disabled={!newTitle.trim()}
            >
              Create
            </button>
            <button
              className="notes-form-btn notes-form-btn--secondary"
              onClick={() => {
                setIsCreating(false);
                setNewTitle('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="notes-create-btn" onClick={() => setIsCreating(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Note
        </button>
      )}

      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className={`note-card ${note.color}`}>
            <h3 className="note-card-title">{note.title}</h3>
            <p className="note-card-content">{note.content || 'No content yet'}</p>
            <p className="note-card-date">
              {note.createdAt.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
