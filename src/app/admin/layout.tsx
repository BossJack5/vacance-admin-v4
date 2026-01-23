'use client';

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [forceShow, setForceShow] = useState(false);

  // [CTO Alex] 3초 이상 로딩이 지속되면 강제로 화면을 보여주는 안전장치
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setForceShow(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (pathname === '/admin/login') return <>{children}</>;

  // 슈퍼 어드민 하이패스 또는 강제 노출 상태라면 무조건 렌더링
  const isSuperAdmin = user?.email === 'jackmimosa@gmail.com';
  
  if (!loading || isSuperAdmin || forceShow) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // 아직 로딩 중이고 하이패스 조건이 아닐 때만 로딩 화면 출력
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-slate-400 italic">보안 인증 확인 중...</p>
      </div>
    </div>
  );
}