'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, MapPin, ShieldCheck, BarChart3, Building2, 
  Map as MapIcon, Users, TrendingUp, FileText, ShoppingBag, 
  Megaphone, UserCircle, MessageSquare, Bell, Settings, LogOut,
  ChevronDown, ChevronRight, Globe, Compass, BookOpen, 
  Image, Flag, Newspaper, Hotel, Ticket, Bus, Car, 
  List, PieChart, UserMinus, UserX, History, Clock, Calendar
} from 'lucide-react';

const MENU_DATA = [
  {
    id: 'dashboard',
    name: '대시보드',
    icon: LayoutDashboard,
    subItems: [
      { id: 'summary', name: '종합 요약', path: '/admin/dashboard/summary', icon: BarChart3 },
      { id: 'marketing', name: '마케팅 분석', path: '/admin/dashboard/marketing', icon: TrendingUp },
      { id: 'city_analysis', name: '도시별 분석', path: '/admin/dashboard/city', icon: Building2 },
      { id: 'place_analysis', name: '장소 분석', path: '/admin/dashboard/place', icon: MapIcon },
      { id: 'user_analysis', name: '사용자 분석', path: '/admin/dashboard/user', icon: Users },
      { id: 'trend', name: '트렌드 예측', path: '/admin/dashboard/trend', icon: TrendingUp },
    ]
  },
  {
    id: 'content',
    name: '콘텐츠 관리',
    icon: FileText,
    subItems: [
      { id: 'library', name: '콘텐츠 라이브러리', path: '/admin/content/library', icon: Image },
      { id: 'country_detail', name: '국가 상세', path: '/admin/content/country', icon: Flag },
      { id: 'city_detail', name: '도시 상세', path: '/admin/content/city', icon: MapPin },
      { id: 'guidebook', name: '가이드북', path: '/admin/content/guide', icon: BookOpen },
      { id: 'judy_magazine', name: '쥬디 매거진', path: '/admin/content/magazine', icon: Newspaper },
    ]
  },
  {
    id: 'commerce',
    name: '커머스 관리',
    icon: ShoppingBag,
    subItems: [
      { id: 'hotel', name: '호텔', path: '/admin/commerce/hotel', icon: Hotel },
      { id: 'ticket', name: '투어&티켓', path: '/admin/commerce/ticket', icon: Ticket },
      { id: 'transport', name: '교통&패스', path: '/admin/commerce/transport', icon: Bus },
      { id: 'car_rental', name: '렌트카', path: '/admin/commerce/car', icon: Car },
    ]
  },
  { id: 'location', name: '위치 관리', icon: Globe, path: '/admin/locations' },
  { id: 'ads', name: '광고 관리', icon: Megaphone, path: '/admin/ads' },
  {
    id: 'members',
    name: '회원 관리',
    icon: UserCircle,
    subItems: [
      { id: 'member_list', name: '회원 목록', path: '/admin/members/list', icon: List },
      { id: 'grade_dist', name: '등급별 분포', path: '/admin/members/grades', icon: PieChart },
      { id: 'dormant', name: '휴면/정지 회원', path: '/admin/members/dormant', icon: UserMinus },
      { id: 'blacklist', name: '블랙리스트', path: '/admin/members/blacklist', icon: UserX },
    ]
  },
  { id: 'reviews', name: '리뷰 관리', icon: MessageSquare, path: '/admin/reviews' },
  { id: 'notifications', name: '알림 센터', icon: Bell, path: '/admin/notifications' },
  { id: 'accounts', name: '어드민 계정 관리', icon: ShieldCheck, path: '/admin/accounts' },
  { id: 'settings', name: '설정', icon: Settings, path: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  // 단일 열림을 위해 string | null로 관리 [배타적 아코디언 로직]
  const [openMenu, setOpenMenu] = useState<string | null>('dashboard');

  const toggleMenu = (id: string) => {
    // 클릭한 메뉴가 이미 열려있으면 닫고(null), 아니면 해당 메뉴만 열기
    setOpenMenu(prev => prev === id ? null : id);
  };

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold italic tracking-tighter">VACANCE ADMIN</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-10">
        {MENU_DATA.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openMenu === item.id;

          return (
            <div key={item.id} className="space-y-1">
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.id)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} className="text-gray-400" />
                    <span className="text-[13.5px] font-medium">{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <Link
                  href={item.path || '#'}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                    pathname === item.path ? 'bg-gray-900 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-[13.5px] font-medium">{item.name}</span>
                </Link>
              )}

              {hasSubItems && isOpen && (
                <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
                  {item.subItems?.map((sub) => {
                    const isActive = pathname === sub.path;
                    return (
                      <Link
                        key={sub.id}
                        href={sub.path}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-[#1a1f2e] text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <sub.icon size={16} />
                        <span className="text-[13px]">{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}