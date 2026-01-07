import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { 
  Dumbbell, 
  Brain, 
  Heart, 
  Smile, 
  Activity,
  Calendar,
  Zap,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { OverviewCard, MiniStatCard } from '@/components/StatCards';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
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
      select: { weight: true },
    }),
    db.photo.count(),
    db.checkIn.findMany({
      where: {
        sleepHours: { not: null },
        dailyLog: { date: { gte: sevenDaysAgo } }
      },
      select: { sleepHours: true },
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
      select: { mood: true },
    }),
  ]);

  const avgSleep = recentCheckIns.length > 0
    ? (recentCheckIns.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recentCheckIns.length).toFixed(1)
    : '--';
  
  const currentMood = recentReflections[0]?.mood || '--';

  return (
    <DashboardLayout>
      <div className="relative orb-glow">
        <div className="relative z-10 max-w-7xl mx-auto space-y-16 pb-16">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
            <div className="space-y-2">
              <p className="text-sm font-bold text-success uppercase tracking-widest">Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
                Welcome back, Colin
              </h1>
              <p className="text-text-secondary text-lg font-medium">Your holistic health at a glance.</p>
            </div>
            <Link 
              href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`}
              className="btn-white group flex items-center gap-3 px-8 py-5 rounded-2xl text-base shadow-2xl shadow-white/10"
            >
              <span className="text-xl font-black">+</span>
              <span className="font-bold">New Daily Entry</span>
            </Link>
          </div>

          {/* Major Health Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <OverviewCard
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

            <OverviewCard
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

            <OverviewCard
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

            <OverviewCard
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

          {/* Quick Insights Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
            <MiniStatCard icon={<Calendar className="w-4 h-4 text-blue-300" />} label="Streak" value="12 Days" />
            <MiniStatCard icon={<Activity className="w-4 h-4 text-success" />} label="Last Log" value="2h ago" />
            <MiniStatCard icon={<Zap className="w-4 h-4 text-warning" />} label="Health Score" value="8.4" />
            <MiniStatCard icon={<Heart className="w-4 h-4 text-red-300" />} label="Goals Met" value="4/5" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

