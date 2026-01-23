'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Globe, ShieldCheck, LogOut } from 'lucide-react';
import { logout } from '@/services/authService';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: '종합 요약', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: '위치 관리', path: '/admin/locations', icon: Globe },
    { name: '어드민 관리', path: '/admin/accounts', icon: ShieldCheck },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen p-6 flex flex-col shadow-sm">
      <div className="mb-10">
        <h1 className="text-xl font-black italic">VACANCE ADMIN</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm ${
              pathname === item.path ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      <button 
        onClick={() => logout().then(() => window.location.href = '/admin/login')}
        className="flex items-center gap-3 p-4 text-slate-400 font-bold hover:text-red-500 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        로그아웃
      </button>
    </div>
  );
}
