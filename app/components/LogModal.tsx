'use client';

import { useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import React from 'react';

export default function LogModal({ title, trigger, children }: { title: string, trigger: ReactNode, children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-semibold text-lg">{title}</h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Clone child to pass onClose prop */}
              {React.isValidElement(children) 
                ? React.cloneElement(children as React.ReactElement<any>, { onClose: handleClose }) 
                : children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
