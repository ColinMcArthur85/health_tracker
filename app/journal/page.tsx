import ChatInterface from '@/components/ChatInterface';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function JournalPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col space-y-6">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-900 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-slate-400" />
          </Link>
          <h1 className="text-2xl font-bold">Daily Journal</h1>
        </header>

        <div className="flex-1">
          <ChatInterface />
        </div>
        
        <div className="text-center text-slate-500 text-sm">
          <p>Tip: Try saying "I ran 5k today" or "I ate a salad for lunch".</p>
        </div>
      </div>
    </main>
  );
}
