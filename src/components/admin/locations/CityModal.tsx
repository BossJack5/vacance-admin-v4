'use client';

import React from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { City } from '@/types/location';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  form: any;
  setForm: (form: any) => void;
  isSaving: boolean;
  editData: City | null;
  selectedCountryName: string;
}

export default function CityModal({ 
  isOpen, onClose, onSave, form, setForm, isSaving, editData, selectedCountryName 
}: CityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#f2f9f5] rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-green-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">
              {editData ? 'Edit City' : 'New City'}
            </h3>
            <p className="text-sm text-green-600 font-bold mt-1">{selectedCountryName} 내 도시 등록</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-100 rounded-full transition-all">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">City Name (KR)</label>
              <input value={form.nameKr} onChange={(e) => setForm({...form, nameKr: e.target.value})}
                className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="서울" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">City Name (EN)</label>
              <input value={form.nameEn} onChange={(e) => setForm({...form, nameEn: e.target.value})}
                className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="Seoul" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">IATA Code</label>
              <input value={form.cityCode} onChange={(e) => setForm({...form, cityCode: e.target.value.toUpperCase()})}
                maxLength={3} className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="ICN" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Timezone</label>
              <input value={form.timezone} onChange={(e) => setForm({...form, timezone: e.target.value})}
                className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="Asia/Seoul" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Latitude</label>
              <input value={form.lat} onChange={(e) => setForm({...form, lat: e.target.value})}
                className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="37.5665" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Longitude</label>
              <input value={form.lng} onChange={(e) => setForm({...form, lng: e.target.value})}
                className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="126.9780" />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button onClick={onSave} disabled={isSaving}
              className="flex-[2.5] bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-green-700 shadow-xl shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              도시 정보 저장
            </button>
            <button onClick={onClose} className="flex-1 bg-white text-slate-400 py-5 rounded-[1.5rem] font-black border border-slate-100">취소</button>
          </div>
        </div>
      </div>
    </div>
  );
}