'use client';

import { ArrowRight, Target } from 'lucide-react';

export default function BodyMap() {
  const goals = [
    { area: 'Shoulders', status: 'Focus', coord: { top: '20%', left: '35%' }, description: 'Increase lateral deltoid width' },
    { area: 'Core', status: 'Maintenance', coord: { top: '45%', left: '50%' }, description: 'Maintain definition and strength' },
    { area: 'Quads', status: 'Focus', coord: { top: '70%', left: '42%' }, description: 'Improve teardrop definition' },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 overflow-hidden relative">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Left: Goals List */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-3 h-3" />
            <span>Target Areas</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Body Composition Goals</h2>
          <p className="text-slate-400">Visualizing your target areas for the current training block.</p>
          
          <div className="space-y-4 pt-4">
            {goals.map((goal, idx) => (
              <div key={idx} className="group p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-100">{goal.area}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${goal.status === 'Focus' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {goal.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: The Body Map Visual */}
        <div className="w-full lg:w-2/3 flex justify-center relative min-h-[600px] bg-slate-950/30 rounded-3xl border border-slate-800/50">
          <div className="relative w-full max-w-md py-12">
             {/* SVG Silhouette */}
             <svg 
              viewBox="0 0 200 500" 
              className="w-full h-full opacity-20 filter blur-[1px]"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M100 20C90 20 82 28 82 38C82 48 90 56 100 56C110 56 118 48 118 38C118 28 110 20 100 20ZM100 56L82 66V130H118V66L100 56ZM82 130L65 250H85L95 180H105L115 250H135L118 130H82ZM50 66L65 160H82V80L50 66ZM150 66L135 160H118V80L150 66Z" 
                fill="currentColor" 
                className="text-blue-500"
              />
              {/* Simple stylized anatomical path */}
              <path d="M100,50 Q105,45 110,50 T120,60 L125,120 L115,125 L120,250 L100,240 L80,250 L85,125 L75,120 L80,60 T90,50 T100,50" stroke="currentColor" strokeWidth="2" className="text-blue-500/50" />
            </svg>

            {/* Glowing Overlays for areas (simplified CSS circles) */}
            <div className="absolute inset-0">
               {/* Shoulder Pointer */}
               <div className="absolute top-[22%] left-[30%] group">
                  <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Shoulder Focus</div>
               </div>

               {/* Core Pointer */}
               <div className="absolute top-[40%] left-[48%] group">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Core Control</div>
               </div>

               {/* Quads Pointer */}
               <div className="absolute top-[65%] left-[40%] group">
                  <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Quad Hypertrophy</div>
               </div>
            </div>

            {/* Background decorative grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)] opacity-20 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
