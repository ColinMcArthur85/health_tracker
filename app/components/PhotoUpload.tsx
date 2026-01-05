'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function PhotoUpload({ date, onClose }: { date: string, onClose?: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [view, setView] = useState('FRONT'); // FRONT, SIDE, BACK
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);

    try {
      // 1. Upload file
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const { url } = await uploadRes.json();

      // 2. Save record
      await fetch('/api/log/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, url, view, caption }),
      });

      router.refresh();
      onClose?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!preview ? (
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto text-slate-500 mb-2" size={32} />
          <p className="text-slate-400">Click or drag to upload photo</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
          <button 
            type="button"
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="relative h-64 w-full">
             <Image src={preview} alt="Preview" fill className="object-contain" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">View Type</label>
          <select 
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          >
            <option value="FRONT">Front View</option>
            <option value="SIDE">Side View</option>
            <option value="BACK">Back View</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Caption</label>
          <input 
            type="text" 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            placeholder="Optional..."
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={!file || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Uploading...' : 'Save Photo'}
      </button>
    </form>
  );
}
