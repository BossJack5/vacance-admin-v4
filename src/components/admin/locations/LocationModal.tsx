'use client';

import React from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { Location } from '@/types/location';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  form: any;
  setForm: (form: any) => void;
  isSaving: boolean;
  editData: Location | null;
  selectedCityName: string;
}

export default function LocationModal({ 
  isOpen, onClose, onSave, form, setForm, isSaving, editData, selectedCityName 
}: LocationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#f9f8ff] rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-purple-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">
              {editData ? 'Edit Region' : 'New Region'}
            </h3>
            <p className="text-sm text-purple-600 font-bold mt-1">{selectedCityName} 내 상세 지역 등록</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-full transition-all">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Region Name (KR)</label>
              <input value={form.nameKr} onChange={(e) => setForm({...form, nameKr: e.target.value})}
                className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-purple-500 font-bold" placeholder="강남구" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Region Name (EN)</label>
              <input value={form.nameEn} onChange={(e) => setForm({...form, nameEn: e.target.value})}
                className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-purple-500 font-bold" placeholder="Gangnam-gu" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Zip/Postal Prefix</label>
            <input value={form.zipPrefix} onChange={(e) => setForm({...form, zipPrefix: e.target.value})}
              className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-purple-500 font-bold" placeholder="06000" />
          </div>

          <div className="flex gap-3 pt-6">
            <button onClick={onSave} disabled={isSaving}
              className="flex-[2.5] bg-purple-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-purple-700 shadow-xl shadow-purple-100 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              지역 데이터 확정
            </button>
            <button onClick={onClose} className="flex-1 bg-white text-slate-400 py-5 rounded-[1.5rem] font-black border border-slate-100">취소</button>
          </div>
        </div>
      </div>
    </div>
  );
}