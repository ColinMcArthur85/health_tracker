'use client';

import { useState } from 'react';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalyzePhotosButtonProps {
  dailyLogId: string;
}

export default function AnalyzePhotosButton({ dailyLogId }: AnalyzePhotosButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/photos/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dailyLogId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to analyze photos');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while analyzing photos.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      className={`
        flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all
        ${isAnalyzing 
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
          : 'bg-linear-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02]'
        }
      `}
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>AI Analyzing...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          <span>Run AI Analysis</span>
        </>
      )}
    </button>
  );
}
