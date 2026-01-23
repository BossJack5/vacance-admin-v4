'use client';

import React, { useEffect, useState } from 'react';
import * as adminService from '@/services/adminService';
import AdminModal from '@/components/admin/AdminModal';
import { Edit2, Trash2, ShieldCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import PermissionGuard from '@/components/auth/PermissionGuard'; // 새로 만든 가드 컴포넌트 임포트

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<adminService.AdminAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<adminService.AdminAccount | null>(null);

  const loadAccounts = async () => {
    try {
      const data = await adminService.getAdminAccounts();
      setAccounts(data);
    } catch (e) {
      toast.error("계정 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleSave = async (adminData: adminService.AdminAccount) => {
    try {
      await adminService.saveAdminAccount(adminData);
      toast.success(adminData.id ? "수정되었습니다." : "신규 등록되었습니다.");
      setIsModalOpen(false);
      loadAccounts();
    } catch (e) {
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말로 이 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        await adminService.deleteAdminAccount(id);
        toast.success("계정이 성공적으로 삭제되었습니다.");
        loadAccounts();
      } catch (e) {
        toast.error("계정 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-700 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-8 h-8" /> 어드민 계정 관리
          </h1>
          <p className="text-blue-100 font-bold mt-2 text-sm opacity-80 uppercase tracking-widest">
            RBAC 기반 권한 제어 시스템 - 상세 접근 권한 관리
          </p>
        </div>
        <PermissionGuard menu="admin_mgmt" action="create">
          <button 
            onClick={() => { setSelectedAdmin(null); setIsModalOpen(true); }}
            className="absolute right-10 bottom-10 bg-white text-blue-700 px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <UserPlus className="w-5 h-5" /> 신규 어드민 등록
          </button>
        </PermissionGuard>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">프로필</th>
              <th className="px-6 py-5">역할 & 권한</th>
              <th className="px-6 py-5">상태</th>
              <th className="px-8 py-5 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">{acc.name[0]}</div>
                    <div>
                      <p className="font-black text-slate-800 tracking-tight">{acc.name}</p>
                      <p className="text-xs font-bold text-slate-400">{acc.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${acc.role === '슈퍼어드민' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{acc.role}</span></td>
                <td className="px-6 py-6"><span className={`px-3 py-1 rounded-lg text-xs font-black ${acc.status === '활성' ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-400'}`}>{acc.status}</span></td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <PermissionGuard menu="admin_mgmt" action="update">
                      <button onClick={() => { setSelectedAdmin(acc); setIsModalOpen(true); }} className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard menu="admin_mgmt" action="delete">
                      <button onClick={() => handleDelete(acc.id)} className="p-2 text-red-300 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <AdminModal admin={selectedAdmin} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}
