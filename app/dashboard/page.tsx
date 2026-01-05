import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { 
  Dumbbell, 
  Brain, 
  Heart, 
  Smile, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Zap,
  Shield
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  // Optimize: Run all queries in parallel instead of sequential
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalWorkouts,
    recentWeight,
    totalPhotos,
    recentCheckIns,
    totalDreams,
    activeMedications,
    activeProtocols,
    recentReflections,
  ] = await Promise.all([
    db.workout.count(),
    db.checkIn.findFirst({
      where: { weight: { not: null } },
      orderBy: { dailyLog: { date: 'desc' } },
      select: { weight: true }, // Only select needed field
    }),
    db.photo.count(),
    db.checkIn.findMany({
      where: {
        sleepHours: { not: null },
        dailyLog: { date: { gte: sevenDaysAgo } }
      },
      select: { sleepHours: true }, // Only select needed field
    }),
    db.dream.count(),
    db.medication.count({
      where: {
        dailyLog: {
          date: { gte: thirtyDaysAgo }
        }
      }
    }),
    db.protocol.count({
      where: { status: 'ACTIVE' }
    }),
    db.reflection.findMany({
      where: {
        mood: { not: null },
        dailyLog: { date: { gte: sevenDaysAgo } }
      },
      orderBy: { dailyLog: { date: 'desc' } },
      take: 1,
      select: { mood: true }, // Only select needed field
    }),
  ]);

  const avgSleep = recentCheckIns.length > 0
    ? (recentCheckIns.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recentCheckIns.length).toFixed(1)
    : '--';
  
  const currentMood = recentReflections[0]?.mood || '--';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Welcome back, Colin
            </h1>
            <p className="text-slate-400 text-lg font-medium">Your holistic health at a glance.</p>
          </div>
          <Link 
            href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`}
            className="group flex items-center space-x-2 px-8 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-bold transition-all shadow-xl shadow-white/5"
          >
            <span>+ New Daily Entry</span>
          </Link>
        </div>

        {/* Major Health Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Body Health */}
          <CategoryOverviewCard
            title="Body Health"
            description="Workouts, measurements, and physical progress."
            icon={<Dumbbell className="w-6 h-6" />}
            gradient="from-blue-500 via-indigo-500 to-blue-600"
            href="/dashboard/workouts"
            metrics={[
              { label: 'Workouts', value: totalWorkouts },
              { label: 'Weight', value: recentWeight?.weight ? `${recentWeight.weight} lbs` : '--' },
              { label: 'Photos', value: totalPhotos },
            ]}
          />

          {/* 2. Mind Health */}
          <CategoryOverviewCard
            title="Mind Health"
            description="Sleep quality, dreams, and mental clarity."
            icon={<Brain className="w-6 h-6" />}
            gradient="from-purple-500 via-violet-500 to-purple-600"
            href="/dashboard/sleep"
            metrics={[
              { label: 'Avg Sleep', value: `${avgSleep}h` },
              { label: 'Dreams', value: totalDreams },
              { label: 'Stress', value: 'Low' },
            ]}
          />

          {/* 3. Internal Health */}
          <CategoryOverviewCard
            title="Internal Health"
            description="Nutrition, medications, and biomarkers."
            icon={<Shield className="w-6 h-6" />}
            gradient="from-emerald-500 via-teal-500 to-emerald-600"
            href="/dashboard/nutrition"
            metrics={[
              { label: 'Meds', value: activeMedications },
              { label: 'Protocols', value: activeProtocols },
              { label: 'Bloodwork', value: 'Oct 24' },
            ]}
          />

          {/* 4. Mood Tracker */}
          <CategoryOverviewCard
            title="Mood Tracker"
            description="Daily emotional state and energy levels."
            icon={<Smile className="w-6 h-6" />}
            gradient="from-amber-400 via-orange-500 to-amber-500"
            href="/dashboard/mood"
            metrics={[
              { label: 'Current Mood', value: currentMood },
              { label: 'Energy', value: 'High' },
              { label: 'Consistency', value: '95%' },
            ]}
          />
        </div>

        {/* Quick Insights Row - Simplified */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <MiniStatCard icon={<Calendar className="w-4 h-4 text-blue-400" />} label="Streak" value="12 Days" />
          <MiniStatCard icon={<Activity className="w-4 h-4 text-emerald-400" />} label="Last Log" value="2h ago" />
          <MiniStatCard icon={<Zap className="w-4 h-4 text-amber-400" />} label="Health Score" value="8.4" />
          <MiniStatCard icon={<Heart className="w-4 h-4 text-rose-400" />} label="Goals Met" value="4/5" />
        </div>
      </div>
    </DashboardLayout>
  );
}

interface CategoryOverviewCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  metrics: Array<{ label: string; value: string | number }>;
}

function CategoryOverviewCard({ title, description, icon, gradient, href, metrics }: CategoryOverviewCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300">
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-4">
            <div className={`inline-flex p-3 rounded-2xl bg-linear-to-br ${gradient} shadow-lg shadow-black/20`}>
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-400 group-hover:bg-clip-text transition-all">
                {title}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="p-2 rounded-full border border-slate-800 group-hover:bg-slate-800 group-hover:translate-x-1 transition-all">
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800/50">
          {metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{metric.label}</p>
              <p className="text-xl font-bold text-slate-100">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

function MiniStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center space-x-4 bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-200">{value}</p>
      </div>
    </div>
  );
}
