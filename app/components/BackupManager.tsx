'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';

interface BackupMeta {
  filename: string;
  createdAt: string;
  size: number;
}

export default function BackupManager() {
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/backup');
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Failed to load backups', error);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      setBackups(data.backups || []);
      setMessage(`Backup created (${data.filename})`);
    } catch (error) {
      console.error('Backup failed', error);
      setMessage('Backup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    if (!window.confirm(`Restore database from ${filename}? Current DB will be snapshotted first.`)) return;
    setRestoring(filename);
    setMessage(null);
    try {
      const res = await fetch('/api/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      setBackups(data.backups || []);
      setMessage(`Restored from ${filename}`);
    } catch (error) {
      console.error('Restore failed', error);
      setMessage('Restore failed');
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Backups</h2>
          <p className="text-slate-400 text-sm">Create manual backups and restore previous copies.</p>
        </div>
        <button
          onClick={handleBackup}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Backing up...' : 'Backup now'}
        </button>
      </div>

      {message && (
        <div className="text-sm text-emerald-300 bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2">
          {message}
        </div>
      )}

      <div className="space-y-3">
        {backups.length === 0 && (
          <p className="text-slate-500 text-sm">No backups yet.</p>
        )}
        {backups.map((backup) => (
          <div
            key={backup.filename}
            className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
          >
            <div>
              <p className="font-medium text-sm">{backup.filename}</p>
              <p className="text-xs text-slate-500">
                {new Date(backup.createdAt).toLocaleString()} • {(backup.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => handleRestore(backup.filename)}
              disabled={restoring === backup.filename}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              {restoring === backup.filename ? 'Restoring...' : 'Restore'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
