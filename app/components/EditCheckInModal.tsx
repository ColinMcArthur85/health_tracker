'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

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

interface EditCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: CheckIn;
}

export default function EditCheckInModal({ isOpen, onClose, checkIn }: EditCheckInModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toNumber = (value: FormDataEntryValue | null) => {
    if (value === null) return null;
    const num = parseFloat(String(value));
    return Number.isFinite(num) ? num : null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      sleepHours: toNumber(formData.get('sleepHours')),
      weight: toNumber(formData.get('weight')),
      water: toNumber(formData.get('water')),
      caffeine: formData.get('caffeine') || null,
      alcohol: formData.get('alcohol') || null,
      supplements: formData.get('supplements') || null,
      pain: formData.get('pain') || null,
      notes: formData.get('notes') || null,
    };

    try {
      await fetch(`/api/log/checkin/${checkIn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating check-in:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Check-In</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close edit check-in modal"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NumberField label="Weight (lbs)" name="weight" defaultValue={checkIn.weight ?? ''} step="0.1" />
            <NumberField label="Sleep (hrs)" name="sleepHours" defaultValue={checkIn.sleepHours ?? ''} step="0.1" />
            <NumberField label="Water (ml)" name="water" defaultValue={checkIn.water ?? ''} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Caffeine" name="caffeine" defaultValue={checkIn.caffeine ?? ''} />
            <TextField label="Alcohol" name="alcohol" defaultValue={checkIn.alcohol ?? ''} />
          </div>

          <TextField label="Supplements" name="supplements" defaultValue={checkIn.supplements ?? ''} />
          <TextField label="Pain / Aches" name="pain" defaultValue={checkIn.pain ?? ''} />

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
            <textarea
              name="notes"
              defaultValue={checkIn.notes ?? ''}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white h-24"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        step={step}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
      />
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
      />
    </div>
  );
}
