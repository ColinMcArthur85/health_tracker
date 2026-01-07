'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { formatUTCDateLong } from '@/lib/dateUtils';
import { Image as ImageIcon, Camera, Plus, Calendar, BrainCircuit, Activity, Info, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import AnalyzePhotosButton from '@/components/photos/AnalyzePhotosButton';
import PhotoActions from '@/components/photos/PhotoActions';
import LogModal from '@/components/LogModal';
import DirectPhotoUpload from '@/components/photos/DirectPhotoUpload';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos/list');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group photos by dailyLogId
  const photoSets = photos.reduce((acc, photo) => {
    if (!acc[photo.dailyLogId]) {
      acc[photo.dailyLogId] = {
        date: photo.dailyLog.date,
        dailyLogId: photo.dailyLogId,
        photos: [],
        analysis: photo.analysis
      };
    }
    acc[photo.dailyLogId].photos.push(photo);
    return acc;
  }, {} as Record<string, any>);

  const photoSetsArray = Object.values(photoSets) as Array<{
    date: string;
    dailyLogId: string;
    photos: any[];
    analysis: string | null;
  }>;
  const totalPhotos = photos.length;
  const recentPhoto = photos.length > 0 ? photos[0] : null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Physical Evolution
            </h1>
            <p className="text-slate-400 text-lg font-medium">Visualizing progress across Front, Side, and Back views.</p>
          </div>
          <LogModal 
            title="Upload New Photo" 
            trigger={
              <button className="group flex items-center space-x-2 px-8 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-bold transition-all shadow-xl shadow-white/5">
                <Plus className="w-5 h-5" />
                <span>New Photo</span>
              </button>
            }
          >
            <DirectPhotoUpload />
          </LogModal>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<ImageIcon className="w-5 h-5 text-blue-400" />} label="Total Photos" value={totalPhotos} />
          <StatCard icon={<Calendar className="w-5 h-5 text-emerald-400" />} label="Last Logged" value={recentPhoto ? format(new Date(recentPhoto.dailyLog.date), 'MMM d, yyyy') : '--'} />
          <StatCard icon={<BrainCircuit className="w-5 h-5 text-purple-400" />} label="Analysis Sets" value={photoSetsArray.filter(s => s.analysis).length} />
        </div>

        {/* Photo Sets */}
        <div className="space-y-16">
          {photoSetsArray.map((set) => (
            <div key={set.dailyLogId} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{formatUTCDateLong(new Date(set.date))}</h2>
                    <p className="text-slate-500 text-sm font-medium">{set.photos.length} photos in this set</p>
                  </div>
                </div>
                {!set.analysis && (
                  <AnalyzePhotosButton dailyLogId={set.dailyLogId} />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['FRONT', 'SIDE', 'BACK'].map((viewType) => {
                  const photo = set.photos.find((p: any) => p.view === viewType);
                  return (
                    <div key={viewType} className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{viewType} VIEW</p>
                      <div className="relative aspect-3/4 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 group transition-all hover:border-slate-700">
                        {photo ? (
                          <>
                            <Image 
                              src={photo.url} 
                              alt={`${viewType} view`} 
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                              {photo.view}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-slate-950/80 to-transparent">
                              {photo.caption && <p className="text-sm text-slate-200 line-clamp-1">{photo.caption}</p>}
                            </div>
                            <PhotoActions 
                              photoId={photo.id}
                              currentView={photo.view}
                              currentCaption={photo.caption}
                              onEdit={fetchPhotos}
                            />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                            <Camera className="w-12 h-12 mb-2 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-tighter">Missing</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {set.analysis && (
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden">
                  <div className="bg-linear-to-r from-blue-600/10 to-purple-600/10 p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <BrainCircuit className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="font-bold text-lg text-white">AI Biological Analysis</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Posture & Balance Report</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed prose-headings:text-white prose-headings:font-bold prose-p:mb-4">
                      {set.analysis.split('\n').map((line: string, i: number) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-800 flex items-center text-xs text-slate-500 space-x-2">
                      <Info className="w-4 h-4" />
                      <span>This analysis is generated by AI vision models and should not substitute professional medical advice.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {photoSetsArray.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-dashed border-slate-800 rounded-[40px]">
              <div className="p-10 rounded-full bg-slate-900 mb-6 border border-slate-800 shadow-2xl">
                <ImageIcon className="w-16 h-16 text-slate-700" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-3">No evolution logged</h3>
              <p className="text-slate-500 mb-10 max-w-md text-center text-lg font-medium leading-relaxed">
                Consistency is key. Start your visual journey today by uploading your first set of progress photos.
              </p>
              <LogModal 
                title="Upload New Photo" 
                trigger={
                  <button className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
                    Launch Journey
                  </button>
                }
              >
                <DirectPhotoUpload />
              </LogModal>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[32px] p-8 hover:border-slate-700 transition-all">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
          {icon}
        </div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-[2px]">{label}</h3>
      </div>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}
