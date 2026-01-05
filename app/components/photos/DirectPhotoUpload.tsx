'use client';

import { useState } from 'react';
import { Upload, X, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DirectPhotoUpload({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('FRONT');
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
      alert('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">
          <Calendar className="w-4 h-4 inline mr-1" />
          Date
        </label>
        <input 
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          required
        />
      </div>

      {/* File Upload */}
      {!preview ? (
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 opacity-0 cursor-pointer"
            required
          />
          <Upload className="mx-auto text-slate-500 mb-2" size={32} />
          <p className="text-slate-400">Click or drag to upload photo</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
          <button 
            type="button"
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors z-10"
          >
            <X size={16} />
          </button>
          <div className="relative h-64 w-full">
             <Image src={preview} alt="Preview" fill className="object-contain" />
          </div>
        </div>
      )}

      {/* View Type and Caption */}
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

      {/* Submit Button */}
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
