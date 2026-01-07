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

export const dynamic = 'force-dynamic';

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
      {/* Dashboard with orb glow decoration */}
      <div className="relative orb-glow">
        <div className="relative z-10 max-w-7xl mx-auto space-y-16 pb-16">
          {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div className="space-y-2">
            <p className="text-sm font-medium text-emerald-400/80 uppercase tracking-widest">Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
              Welcome back, Colin
            </h1>
            <p className="text-(--color-text-secondary) text-lg">Your holistic health at a glance.</p>
          </div>
          <Link 
            href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`}
            className="btn-white group flex items-center gap-3 px-8 py-4 rounded-2xl text-base"
          >
            <span className="text-lg">+</span>
            <span>New Daily Entry</span>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          <MiniStatCard icon={<Calendar className="w-4 h-4 text-blue-400" />} label="Streak" value="12 Days" />
          <MiniStatCard icon={<Activity className="w-4 h-4 text-emerald-400" />} label="Last Log" value="2h ago" />
          <MiniStatCard icon={<Zap className="w-4 h-4 text-amber-400" />} label="Health Score" value="8.4" />
          <MiniStatCard icon={<Heart className="w-4 h-4 text-rose-400" />} label="Goals Met" value="4/5" />
        </div>
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
    <Link href={href} className="group block animate-slide-up">
      <div className="relative h-full glass rounded-3xl p-8 
                      border border-border-subtle 
                      hover:border-(--color-border) 
                      hover:bg-surface-elevated
                      transition-all duration-300 ease-out
                      hover:shadow-(--shadow-lg)
                      hover:-translate-y-1">
        
        {/* Gradient glow effect on hover */}
        <div className={`absolute inset-0 rounded-3xl bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
        
        <div className="relative flex items-start justify-between mb-8">
          <div className="space-y-4">
            {/* Icon with gradient and glow */}
            <div className={`inline-flex p-3.5 rounded-2xl bg-linear-to-br ${gradient} 
                            shadow-lg shadow-black/30
                            group-hover:shadow-xl group-hover:shadow-black/40
                            transition-all duration-300`}>
              {icon}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-(--color-text-primary) 
                           group-hover:text-gradient transition-all duration-300">
                {title}
              </h2>
              <p className="text-(--color-text-tertiary) text-sm leading-relaxed max-w-[280px]">
                {description}
              </p>
            </div>
          </div>
          
          {/* Arrow indicator */}
          <div className="p-2.5 rounded-full bg-(--color-background-raised) 
                         border border-border-subtle
                         group-hover:bg-(--color-surface-interactive)
                         group-hover:border-(--color-border)
                         group-hover:translate-x-1 
                         transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-(--color-text-tertiary) group-hover:text-(--color-text-primary)" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="relative grid grid-cols-3 gap-6 pt-6 border-t border-border-subtle/50">
          {metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-(--color-text-tertiary)">
                {metric.label}
              </p>
              <p className="text-xl font-bold text-(--color-text-primary)">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

function MiniStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-4 p-4 
                   bg-surface/50 
                   border-border-subtle/50
                   hover:border-(--color-border)
                   transition-all duration-200">
      <div className="p-2.5 rounded-xl bg-(--color-background) border border-border-subtle">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-(--color-text-tertiary)">
          {label}
        </p>
        <p className="text-lg font-bold text-(--color-text-primary)">
          {value}
        </p>
      </div>
    </div>
  );
}
