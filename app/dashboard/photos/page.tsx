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

import { StatCard } from '@/components/StatCards';

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
          <Loader2 className="w-12 h-12 text-success animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-success/80 uppercase tracking-widest">Physical Progress</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
              Physical Evolution
            </h1>
            <p className="text-text-secondary text-lg font-medium">Visualizing progress across Front, Side, and Back views.</p>
          </div>
          <LogModal 
            title="Upload New Photo" 
            trigger={
              <button className="group flex items-center space-x-2 px-8 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-bold transition-all shadow-xl shadow-white/10 active:scale-95">
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span>New Photo</span>
              </button>
            }
          >
            <DirectPhotoUpload />
          </LogModal>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard icon={<ImageIcon className="w-5 h-5 text-blue-300" />} label="Total Photos" value={totalPhotos} />
          <StatCard icon={<Calendar className="w-5 h-5 text-success" />} label="Last Logged" value={recentPhoto ? format(new Date(recentPhoto.dailyLog.date), 'MMM d, yyyy') : '--'} />
          <StatCard icon={<BrainCircuit className="w-5 h-5 text-purple-400" />} label="Analysis Sets" value={photoSetsArray.filter(s => s.analysis).length} />
        </div>

        {/* Photo Sets */}
        <div className="space-y-20">
          {photoSetsArray.map((set) => (
            <div key={set.dailyLogId} className="space-y-8 animate-slide-up">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-6">
                <div className="flex items-center space-x-5">
                  <div className="p-3.5 bg-surface rounded-2xl border border-border-subtle shadow-sm">
                    <Calendar className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{formatUTCDateLong(new Date(set.date))}</h2>
                    <p className="text-text-tertiary text-sm font-medium">{set.photos.length} photos in this set</p>
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
                    <div key={viewType} className="space-y-4">
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-1">{viewType} VIEW</p>
                      <div className="relative aspect-3/4 bg-surface rounded-3xl overflow-hidden border border-border-subtle group transition-all hover:border-border hover:shadow-lg">
                        {photo ? (
                          <>
                            <Image 
                              src={photo.url} 
                              alt={`${viewType} view`} 
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                              {photo.view}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-background/90 via-background/40 to-transparent">
                              {photo.caption && <p className="text-sm text-text-primary font-medium line-clamp-1">{photo.caption}</p>}
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <PhotoActions 
                                photoId={photo.id}
                                currentView={photo.view}
                                currentCaption={photo.caption}
                                onEdit={fetchPhotos}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-tertiary/20">
                            <Camera className="w-12 h-12 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Capture</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {set.analysis && (
                <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
                  <div className="bg-linear-to-r from-emerald-500/5 to-blue-500/5 p-6 flex items-center justify-between border-b border-border-subtle/30">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 rounded-xl">
                        <BrainCircuit className="w-5 h-5 text-success" />
                      </div>
                      <h3 className="font-bold text-lg text-text-primary">AI Biological Analysis</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                      <Activity className="w-4 h-4 text-success/60" />
                      <span>Posture & Balance Report</span>
                    </div>
                  </div>
                  <div className="p-10">
                    <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed prose-headings:text-text-primary prose-headings:font-bold">
                      {set.analysis.split('\n').map((line: string, i: number) => (
                        <p key={i} className="mb-4 last:mb-0">{line}</p>
                      ))}
                    </div>
                    <div className="mt-10 pt-8 border-t border-border-subtle/30 flex items-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest gap-3">
                      <Info className="w-4 h-4 text-success/40" />
                      <span>Confidential AI-Generated Insight • Not Medical Advice</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {photoSetsArray.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 glass border border-dashed border-border-subtle rounded-[48px]">
              <div className="p-12 rounded-full bg-background-raised mb-8 border border-border-subtle shadow-2xl">
                <ImageIcon className="w-20 h-20 text-text-tertiary/20" />
              </div>
              <h3 className="text-4xl font-black text-text-primary mb-4">No evolution logged</h3>
              <p className="text-text-tertiary mb-12 max-w-md text-center text-lg font-medium leading-relaxed">
                Consistency is key. Start your visual journey today by uploading your first set of progress photos.
              </p>
              <LogModal 
                title="Upload New Photo" 
                trigger={
                  <button className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/10">
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

