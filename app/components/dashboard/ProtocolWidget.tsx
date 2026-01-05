'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, Pill } from 'lucide-react';
import { format, addDays, differenceInDays, isSameDay } from 'date-fns';

interface Protocol {
  id: string;
  name: string;
  substance: string;
  dosage: string;
  frequency: string;
  startDate: string;
  status: string;
  logs: any[];
}

export default function ProtocolWidget({ protocol }: { protocol: Protocol }) {
  const [isLogging, setIsLogging] = useState(false);
  const [lastLog, setLastLog] = useState(protocol.logs?.[0] || null);
  
  // Calculate next dose date
  const getNextDoseDate = () => {
    const baseDate = lastLog ? new Date(lastLog.date) : new Date(protocol.startDate);
    if (protocol.frequency === 'E3D') {
      return addDays(baseDate, 3);
    }
    if (protocol.frequency === 'Daily') {
      return addDays(baseDate, 1);
    }
    return baseDate;
  };

  const nextDoseDate = getNextDoseDate();
  const isDoseDue = new Date() >= nextDoseDate || isSameDay(new Date(), nextDoseDate);
  const daysUntilNext = differenceInDays(nextDoseDate, new Date());

  const handleLogDose = async () => {
    setIsLogging(true);
    try {
      const response = await fetch('/api/protocols/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol.id,
          taken: true,
          date: new Date().toISOString(),
          // Default stop signals at neutral (1 = none/good, 5 = severe/bad)
          headache: 1,
          anxiety: 1,
          sleepQuality: 1,
          mood: 1,
        }),
      });
      
      if (response.ok) {
        const newLog = await response.json();
        setLastLog(newLog);
      }
    } catch (error) {
      console.error('Failed to log dose:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Pill className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{protocol.name}</h3>
            <p className="text-xs text-slate-400">{protocol.substance} • {protocol.dosage}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            protocol.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {protocol.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-6">
        {/* Timing Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-300">Next Dose:</span>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${isDoseDue ? 'text-emerald-400' : 'text-slate-100'}`}>
              {isDoseDue ? 'Due Today' : format(nextDoseDate, 'EEE, MMM d')}
            </p>
            {!isDoseDue && (
              <p className="text-[10px] text-slate-500">In {daysUntilNext} days</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLogDose}
          disabled={isLogging || (!isDoseDue && lastLog && isSameDay(new Date(lastLog.date), new Date()))}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
            isDoseDue 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
              : 'bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLogging ? (
            <Activity className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {(!isDoseDue && lastLog && isSameDay(new Date(lastLog.date), new Date())) ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Dose Logged</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Log Dosing</span>
                </>
              )}
            </>
          )}
        </button>

        {/* "Stop Signals" Reminder */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Stop Signals</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Headaches</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Anxiety</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Sleep</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Mood</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
