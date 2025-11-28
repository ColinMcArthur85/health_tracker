'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export default function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'json' | 'csv' | 'markdown'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.set('format', format);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/export?${params.toString()}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extension = format === 'markdown' ? 'md' : format;
      a.download = `health-journal-${new Date().toISOString().split('T')[0]}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
      >
        <Download size={18} />
        <span>Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4">
            <h3 className="font-semibold mb-3">Export Data</h3>

            <div className="space-y-2 mb-4">
              <label className="text-xs text-slate-500">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <label className="text-xs text-slate-500">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="text-emerald-600"
                />
                <span className="text-sm">JSON (Complete Data)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="text-emerald-600"
                />
                <span className="text-sm">CSV (Spreadsheet)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="markdown"
                  checked={format === 'markdown'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="text-emerald-600"
                />
                <span className="text-sm">Markdown (Readable)</span>
              </label>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Download'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
