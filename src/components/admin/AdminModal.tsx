'use client';

import React, { useState, useEffect } from 'react';
import * as adminService from '@/services/adminService';
import { Plus, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

// [CTO Alex] 좌측 사이드바의 모든 메뉴 리스트를 정의합니다.
const ALL_SYSTEM_MENUS = [
  { id: 'summary', name: '종합 요약' },
  { id: 'marketing', name: '마케팅 분석' },
  { id: 'city_analysis', name: '도시별 분석' },
  { id: 'place_analysis', name: '장소 분석' },
  { id: 'user_analysis', name: '사용자 분석' },
  { id: 'trend', name: '트렌드 예측' },
  { id: 'content', name: '콘텐츠 관리' },
  { id: 'commerce', name: '커머스 관리' },
  { id: 'location', name: '위치 관리' },
  { id: 'ads', name: '광고 관리' },
  { id: 'members', name: '회원 관리' },
  { id: 'reviews', name: '리뷰 관리' },
  { id: 'notifications', name: '알림 센터' },
  { id: 'admin_mgmt', name: '어드민 계정 관리' },
  { id: 'settings', name: '설정' }
];

interface AdminModalProps {
  admin: adminService.AdminAccount | null;
  onClose: () => void;
  onSave: (data: adminService.AdminAccount) => void;
}

export default function AdminModal({ admin, onClose, onSave }: AdminModalProps) {
  // [CTO Alex] 초기 상태 설정: 수정 모드일 경우 기존 데이터 바인딩
  const [formData, setFormData] = useState<Omit<adminService.AdminAccount, 'id' | 'createdAt'>>(admin || {
    name: '',
    email: '',
    role: '마케터', // 기본값 설정
    status: '활성',
    permissions: {}
  });

  // [CTO Alex] 슈퍼어드민 선택 시 모든 권한을 자동으로 체크하는 편의 기능
  useEffect(() => {
    if (formData.role === '슈퍼어드민') {
      const allFullAccess: Record<string, any> = {};
      ALL_SYSTEM_MENUS.forEach(m => {
        allFullAccess[m.id] = { view: true, create: true, update: true, delete: true };
      });
      setFormData(prev => ({ ...prev, permissions: allFullAccess }));
    }
  }, [formData.role]);

  const togglePermission = (menuId: string, action: string) => {
    if (formData.role === '슈퍼어드민') return; // 슈퍼어드민은 수동 변경 제한 (항상 풀권한)
    
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [menuId]: {
          ...(prev.permissions[menuId] || { view: false, create: false, update: false, delete: false }),
          [action]: !(prev.permissions[menuId] as any)?.[action]
        }
      }
    }));
  };

  const handleSave = () => {
    const dataToSave = {
      ...(admin || {}),
      ...formData
    } as adminService.AdminAccount;
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        
        {/* 모달 헤더 */}
        <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              {admin ? <CheckCircle2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
              {admin ? '어드민 계정 수정' : '신규 어드민 등록'}
            </h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition-all"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          {/* 1. 기본 정보 및 역할 선택 섹션 */}
          <section className="grid grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">성함</label>
              <input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-5 bg-slate-50 border-none rounded-3xl font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="성함을 입력하세요"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">이메일 (ID)</label>
              <input 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={!!admin} // 수정 시 이메일 변경 불가 (ID 역할)
                className="w-full p-5 bg-slate-50 border-none rounded-3xl font-bold disabled:opacity-50" 
                placeholder="admin@lesvacances.co.kr"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">시스템 역할</label>
              <select 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value as any})}
                className="w-full p-5 bg-slate-100 border-none rounded-3xl font-black text-blue-600 appearance-none cursor-pointer"
              >
                <option value="슈퍼어드민">🔴 슈퍼어드민</option>
                <option value="콘텐츠 매니저">🟢 콘텐츠 매니저</option>
                <option value="마케터">🔵 마케터</option>
              </select>
            </div>
          </section>

          {/* 2. 상세 권한 매트릭스 섹션 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black italic text-slate-800 uppercase tracking-tight">메뉴별 접근 권한 설정</h3>
              {formData.role === '슈퍼어드민' && (
                <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full animate-pulse flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3" /> 슈퍼어드민은 모든 권한이 강제 부여됩니다
                </span>
              )}
            </div>
            
            <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-10 py-6 text-left">시스템 메뉴 리스트</th>
                    {['조회', '입력', '수정', '삭제'].map(h => <th key={h} className="px-4 py-6 text-center">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ALL_SYSTEM_MENUS.map(menu => (
                    <tr key={menu.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-5 font-black text-slate-700 tracking-tight">{menu.name}</td>
                      {['view', 'create', 'update', 'delete'].map(action => (
                        <td key={action} className="px-4 py-5 text-center">
                          <input 
                            type="checkbox"
                            disabled={formData.role === '슈퍼어드민'}
                            checked={(formData.permissions as any)[menu.id]?.[action] || false}
                            onChange={() => togglePermission(menu.id, action)}
                            className="w-6 h-6 rounded-xl border-slate-200 text-blue-600 focus:ring-blue-500 disabled:opacity-30 transition-all cursor-pointer" 
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 3. 모달 하단 푸터 */}
        <div className="p-10 border-t border-slate-50 flex justify-end gap-4 bg-slate-50/50">
          <button onClick={onClose} className="px-10 py-4 font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600">취소</button>
          <button 
            onClick={handleSave}
            className="px-14 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-black hover:scale-105 transition-all"
          >
            {admin ? '수정 완료' : '신규 계정 등록 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
