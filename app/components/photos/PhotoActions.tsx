'use client';

import { useState } from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PhotoActionsProps {
  photoId: string;
  currentView: string;
  currentCaption: string | null;
  onEdit?: () => void;
}

export default function PhotoActions({ photoId, currentView, currentCaption, onEdit }: PhotoActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState(currentView);
  const [caption, setCaption] = useState(currentCaption || '');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this photo? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/photos/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while deleting the photo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('/api/photos/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, view, caption }),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
        onEdit?.();
      } else {
        alert('Failed to update photo');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while updating the photo');
    }
  };

  if (isEditing) {
    return (
      <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col justify-center space-y-3 z-20">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">View</label>
          <select 
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
          >
            <option value="FRONT">Front</option>
            <option value="SIDE">Side</option>
            <option value="BACK">Back</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Caption</label>
          <input 
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
            placeholder="Optional..."
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button
        onClick={() => setIsEditing(true)}
        className="p-2 bg-blue-600/90 hover:bg-blue-500 rounded-lg transition-colors"
        title="Edit photo"
      >
        <Pencil className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 bg-red-600/90 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
        title="Delete photo"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
}
