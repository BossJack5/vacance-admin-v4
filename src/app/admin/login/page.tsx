'use client';

import React, { useState } from 'react';
import { login } from '@/services/authService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('이메일과 비밀번호를 모두 입력해주세요.');

    setIsPending(true);
    const loadingToast = toast.loading('보안 서버에 접속 중입니다...');

    try {
      // [CTO Alex] Firebase Auth를 통한 실제 인증 시도
      await login(email, password);
      toast.success('관리자 인증에 성공했습니다. 환영합니다!', { id: loadingToast });
      
      // 로그인 성공 시 대시보드로 즉시 이동
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error('인증 실패: 이메일 또는 비밀번호를 다시 확인하세요.', { id: loadingToast });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100 transition-all">
        
        {/* 상단 헤더 섹션 */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-900 p-5 rounded-[1.5rem] mb-5 shadow-lg shadow-slate-200">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Vacance Admin</h1>
          <p className="text-slate-400 font-bold mt-2 text-sm">레바캉스 관리자 시스템 v4.0</p>
        </div>

        {/* [CTO Alex] 사용자 요청에 따라 데모 박스는 삭제되었습니다. */}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* 이메일 입력 필드 */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">이메일</label>
            <div className="relative group">
              <Mail className="w-5 h-5 absolute left-5 top-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-bold text-slate-800 transition-all"
                placeholder="admin@lesvacances.co.kr"
              />
            </div>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">비밀번호</label>
            <div className="relative group">
              <Lock className="w-5 h-5 absolute left-5 top-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-14 py-4.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-bold text-slate-800 transition-all"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-4.5 text-slate-300 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 이메일 저장 체크박스 */}
          <div className="flex items-center gap-2 ml-1">
            <input type="checkbox" id="saveEmail" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
            <label htmlFor="saveEmail" className="text-sm font-bold text-slate-500 cursor-pointer">이메일 저장</label>
          </div>

          {/* 로그인 버튼 */}
          <button 
            disabled={isPending}
            className="w-full bg-[#05070a] text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : '로그인'}
          </button>
        </form>
        
        {/* 하단 보안 경고 문구 */}
        <div className="mt-10 space-y-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            🔒 모든 접속 기록은 보안 감사 로그에 기록됩니다
          </p>
          <p className="flex items-center justify-center gap-1.5 text-[10px] text-amber-500 font-black uppercase tracking-widest">
            ⚠️ 5회 이상 로그인 실패 시 15분간 차단됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
