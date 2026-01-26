'use client';

import React, { useEffect, useState } from 'react';
import { locationService } from '@/services/locationService';
import { Globe, Building2, MapPin, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardSummaryPage() {
  const [stats, setStats] = useState({ totalCountries: 0, totalCities: 0, totalRegions: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await locationService.getLocationStats();
      setStats(data);
    } catch (e) {
      toast.error("데이터 동기화에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = [
    { label: '국가', value: stats.totalCountries, icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '도시', value: stats.totalCities, icon: Building2, color: 'text-green-500', bg: 'bg-green-50' },
    { label: '지역', value: stats.totalRegions, icon: MapPin, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      {/* 상단 헤더: 국문 변경 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">시스템 요약</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">실시간 인프라 운영 현황</p>
        </div>
        <button onClick={fetchStats} className="p-2 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
          <RefreshCcw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 가로형 통계 카드 섹션 */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3 ${s.bg} rounded-2xl`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800">
                  {loading ? '...' : s.value?.toLocaleString() ?? '0'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">개</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 시스템 상태 바: 국문 변경 */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold italic">클라우드 상태: 최적</span>
        </div>
        <div className="flex gap-6 text-[10px] font-black text-slate-500 uppercase tracking-tight">
          <span>활성 연결 수: 6</span> 
          <span className="text-blue-400">누적 읽기: 10K+</span>
        </div>
      </div>
    </div>
  );
}