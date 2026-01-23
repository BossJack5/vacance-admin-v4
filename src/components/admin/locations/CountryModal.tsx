'use client';

import React from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { Country } from '@/types/location';

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>; // onSave now correctly doesn't expect a 'data' argument
  form: any;
  setForm: (form: any) => void;
  isSaving: boolean;
  editData: Country | null;
}

export default function CountryModal({ 
  isOpen, onClose, onSave, form, setForm, isSaving, editData 
}: CountryModalProps) {
  if (!isOpen) return null;

  // Generic handler to update form state
  const handleFormChange = (field: string, value: string) => {
    // Specific logic for ISO code to enforce uppercase
    if (field === 'isoCode') {
      value = value.toUpperCase();
    }
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">
              {editData ? 'Edit Country' : 'New Country'}
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">국가 정보를 정확히 입력해 주세요.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Form Area */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 italic uppercase tracking-widest">Name (KR)</label>
              <input 
                value={form.nameKr} 
                onChange={(e) => handleFormChange('nameKr', e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
                placeholder="대한민국" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 italic uppercase tracking-widest">Name (EN)</label>
              <input 
                value={form.nameEn} 
                onChange={(e) => handleFormChange('nameEn', e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
                placeholder="South Korea" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 italic uppercase tracking-widest">ISO Code (2 Letters)</label>
              <input 
                value={form.isoCode} 
                onChange={(e) => handleFormChange('isoCode', e.target.value)}
                maxLength={2}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
                placeholder="KR" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 italic uppercase tracking-widest">Phone Code</label>
              <input 
                value={form.phoneCode} 
                onChange={(e) => handleFormChange('phoneCode', e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
                placeholder="+82" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 italic uppercase tracking-widest">Continent</label>
            <select 
              value={form.continent} 
              onChange={(e) => handleFormChange('continent', e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 appearance-none"
            >
              <option value="">대륙 선택</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="America">America</option>
              <option value="Oceania">Oceania</option>
              <option value="Africa">Africa</option>
            </select>
          </div>

          {/* Bottom Buttons */}
          <div className="flex gap-3 pt-8">
            <button 
              onClick={onSave}
              disabled={isSaving}
              className="flex-[2.5] bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              {editData ? '정보 수정하기' : '새 국가 등록'}
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 bg-slate-100 text-slate-400 py-5 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}