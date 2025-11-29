import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import db from '@/lib/db';
import { Dumbbell, Apple, Moon, Scale, Droplets, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatUTCDateLong } from '@/lib/dateUtils';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActions from '@/components/QuickActions';

export default async function DashboardPage() {
  // Fetch summary statistics
  const totalWorkouts = await db.workout.count();
  const totalLogs = await db.dailyLog.count();
  
  // Get recent weight
  const recentCheckIn = await db.checkIn.findFirst({
    where: { weight: { not: null } },
    orderBy: { dailyLog: { date: 'desc' } },
  });
  
  // Get average sleep (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCheckIns = await db.checkIn.findMany({
    where: {
      sleepHours: { not: null },
      dailyLog: { date: { gte: sevenDaysAgo } }
    },
    include: { dailyLog: true }
  });
  
  const avgSleep = recentCheckIns.length > 0
    ? (recentCheckIns.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recentCheckIns.length).toFixed(1)
    : '--';
  
  // Get recent activity
  const recentLogs = await db.dailyLog.findMany({
    orderBy: { date: 'desc' },
    take: 5,
    include: {
      workouts: true,
      nutrition: true,
      checkIn: true,
      reflections: true,
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader />

        {/* Quick Actions */}
        <QuickActions />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total Workouts"
            value={totalWorkouts}
            trend="up"
            trendValue="+12%"
            icon={<Dumbbell className="w-5 h-5 text-white" />}
            color="blue"
          />
          <MetricCard
            title="Avg Sleep"
            value={`${avgSleep}h`}
            trend="neutral"
            icon={<Moon className="w-5 h-5 text-white" />}
            color="purple"
          />
          <MetricCard
            title="Current Weight"
            value={recentCheckIn?.weight ? `${recentCheckIn.weight} lbs` : '--'}
            icon={<Scale className="w-5 h-5 text-white" />}
            color="emerald"
          />
          <MetricCard
            title="Total Logs"
            value={totalLogs}
            icon={<Heart className="w-5 h-5 text-white" />}
            color="pink"
          />
          <MetricCard
            title="Hydration"
            value="--"
            icon={<Droplets className="w-5 h-5 text-white" />}
            color="blue"
          />
          <MetricCard
            title="Nutrition"
            value="--"
            icon={<Apple className="w-5 h-5 text-white" />}
            color="orange"
          />
        </div>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
            <Link 
              href="/dashboard/journal"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div 
                key={log.id} 
                className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {formatUTCDateLong(log.date)}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {log.workouts.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Dumbbell className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300">{log.workouts[0].name || 'Workout'}</span>
                        </div>
                      )}
                      {log.nutrition && log.nutrition.calories && (
                        <div className="flex items-center space-x-2">
                          <Apple className="w-4 h-4 text-orange-400" />
                          <span className="text-slate-300">{log.nutrition.calories} kcal</span>
                        </div>
                      )}
                      {log.checkIn?.sleepHours && (
                        <div className="flex items-center space-x-2">
                          <Moon className="w-4 h-4 text-purple-400" />
                          <span className="text-slate-300">{log.checkIn.sleepHours}h sleep</span>
                        </div>
                      )}
                      {log.reflections.length > 0 && log.reflections[0].mood && (
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-pink-400" />
                          <span className="text-slate-300">Mood: {log.reflections[0].mood}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/journal/${log.date.toISOString().split('T')[0]}`}
                    className="text-sm text-blue-400 hover:text-blue-300 ml-4"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
