import db from "@/lib/db";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { getUTCMidnight } from "@/lib/dateUtils";
import Link from "next/link";
import { ArrowLeft, Camera, Dumbbell, Utensils, Activity } from "lucide-react";
import Image from "next/image";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Client components for modals
import LogModal from "@/components/LogModal";
import WorkoutForm from "@/components/forms/WorkoutForm";
import NutritionFormWithAPI from "@/components/forms/NutritionFormWithAPI";
import CheckInForm from "@/components/forms/CheckInForm";
import PhotoUpload from "@/components/PhotoUpload";
import WorkoutList from "@/components/WorkoutList";
import NutritionDetails from "@/components/NutritionDetails";
import CheckInDetails from "@/components/CheckInDetails";

interface PageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function DailyLogPage({ params }: PageProps) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return notFound();
  }

  const log = (await db.dailyLog.findUnique({
    where: { date: getUTCMidnight(date) },
    include: {
      workouts: true,
      nutrition: {
        include: {
          foodItems: true,
        },
      },
      reflections: true,
      checkIn: true,
      photos: true,
    },
  })) as any; // Type assertion to bypass IDE cache issues with Prisma types

  // Helper to ensure types (Prisma types can be tricky with includes in Server Components sometimes)
  // But usually it works. The errors suggest 'log' might be null or type inference failed.
  // We already check if (!log) return notFound(), but let's be explicit if needed.
  // If no log exists, we'll just render the empty state.
  // if (!log) return notFound();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-900 rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{format(parseISO(date), "EEEE, MMM do")}</h1>
              <p className="text-slate-400">Daily Dashboard</p>
            </div>
          </div>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LogModal
            title="Log Workout"
            trigger={
              <button className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                <Dumbbell className="text-blue-400" size={24} />
                <span className="text-sm font-medium text-blue-100">Workout</span>
              </button>
            }
          >
            <WorkoutForm date={date} />
          </LogModal>

          <LogModal
            title="Log Nutrition"
            trigger={
              <button className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                <Utensils className="text-emerald-400" size={24} />
                <span className="text-sm font-medium text-emerald-100">Nutrition</span>
              </button>
            }
          >
            <NutritionFormWithAPI date={date} />
          </LogModal>

          <LogModal
            title="Check In"
            trigger={
              <button className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                <Activity className="text-purple-400" size={24} />
                <span className="text-sm font-medium text-purple-100">Check-In</span>
              </button>
            }
          >
            <CheckInForm date={date} />
          </LogModal>

          <LogModal
            title="Upload Photo"
            trigger={
              <button className="bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                <Camera className="text-rose-400" size={24} />
                <span className="text-sm font-medium text-rose-100">Photo</span>
              </button>
            }
          >
            <PhotoUpload date={date} />
          </LogModal>
        </div>

        {/* Summary Sections */}
        <div className="space-y-6">
          {/* Photos */}
          {log?.photos && log.photos.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-slate-300">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {log.photos?.map((photo: any) => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800">
                    <Image src={photo.url} alt={photo.caption || "Progress photo"} fill className="object-cover" />
                    {photo.caption && <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-white truncate">{photo.caption}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Workouts */}
          <section className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Workouts</h2>
            <WorkoutList workouts={log?.workouts || []} />
          </section>

          {/* Nutrition */}
          <NutritionDetails nutrition={log?.nutrition} />

          {/* Check-In */}
          <CheckInDetails checkIn={log?.checkIn} />
        </div>
      </div>
    </DashboardLayout>
  );
}
