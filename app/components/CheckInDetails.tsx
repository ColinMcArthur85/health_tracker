'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import EditCheckInModal from './EditCheckInModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface CheckIn {
  id: string;
  sleepHours?: number | null;
  weight?: number | null;
  water?: number | null;
  caffeine?: string | null;
  alcohol?: string | null;
  supplements?: string | null;
  pain?: string | null;
  notes?: string | null;
}

export default function CheckInDetails({ checkIn }: { checkIn?: CheckIn | null }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!checkIn) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/log/checkin/${checkIn.id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting check-in:', error);
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (!checkIn) {
    return <p className="text-slate-500 italic text-sm">No check-in logged.</p>;
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-purple-400">Daily Stats</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit check-in"
          >
            <Edit2 size={16} className="text-blue-400" />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete check-in"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Stat label="Weight" value={checkIn.weight ? `${checkIn.weight} lbs` : '--'} />
        <Stat label="Sleep" value={checkIn.sleepHours ? `${checkIn.sleepHours} hrs` : '--'} />
        <Stat label="Water" value={checkIn.water ? `${checkIn.water} ml` : '--'} />
        <Stat label="Caffeine" value={checkIn.caffeine || '--'} />
        <Stat label="Alcohol" value={checkIn.alcohol || '--'} />
        <Stat label="Supplements" value={checkIn.supplements || '--'} />
      </div>

      {checkIn.notes && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-200">
          {checkIn.notes}
        </div>
      )}

      {isEditing && (
        <EditCheckInModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          checkIn={checkIn}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Check-In"
        message="This will remove the check-in for this day."
        isDeleting={isDeleting}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-slate-950 p-3 rounded-lg border border-slate-800">
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}
