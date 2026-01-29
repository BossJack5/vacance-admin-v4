'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { 
  LayoutDashboard, MapPin, ShieldCheck, BarChart3, Building2, 
  Map as MapIcon, Users, TrendingUp, FileText, ShoppingBag, 
  Megaphone, UserCircle, MessageSquare, Bell, Settings, 
  ChevronDown, ChevronRight, Globe, BookOpen, 
  Image, Flag, Newspaper, Hotel, Ticket, Bus, Car, 
  List, PieChart, UserMinus, UserX, 
  MapPinned, Landmark, Palette, UtensilsCrossed, Sparkles, FlagTriangleRight, Library,
  PlaneTakeoff, Map, Beaker, CalendarCheck,
  Mail, FileX, History, Clock, MousePointerClick
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
      { id: 'library', name: '콘텐츠 라이브러리', path: '/admin/content/library', icon: Library },
      { id: 'country_detail', name: '국가 상세', path: '/admin/content/countries', icon: Flag },
      { id: 'city_detail', name: '도시 상세', path: '/admin/content/cities', icon: MapPin },
      { id: 'guidebook', name: '가이드북', path: '/admin/content/guidebooks', icon: BookOpen },
      { id: 'landmarks', name: '명소/관광지', path: '/admin/content/landmarks', icon: MapPinned },
      { id: 'museums', name: '박물관/미술관', path: '/admin/content/museums', icon: Landmark },
      { id: 'artworks', name: '박물관 작품', path: '/admin/content/museum-artworks', icon: Palette },
      { id: 'dining', name: '레스토랑/카페', path: '/admin/content/restaurants', icon: UtensilsCrossed },
      { id: 'shopping', name: '쇼핑', path: '/admin/content/shopping', icon: ShoppingBag },
      { id: 'services', name: '서비스(살롱/스파)', path: '/admin/content/services', icon: Sparkles },
      { id: 'golf', name: '골프장', path: '/admin/content/golf-courses', icon: FlagTriangleRight },
      { id: 'judy_magazine', name: '쥬디 매거진', path: '/admin/content/jeudi-magazine', icon: Newspaper },
      { id: 'culture', name: '문화 스페셜', path: '/admin/content/culture', icon: Image },
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
      { id: 'pickup', name: '픽업서비스', path: '/admin/commerce/pickup', icon: PlaneTakeoff },
      { id: 'insurance', name: '여행보험', path: '/admin/commerce/insurance', icon: ShieldCheck },
      { id: 'daytrip', name: '데이트립', path: '/admin/commerce/daytrip', icon: Map },
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
      { id: 'region_signup', name: '지역별 가입', path: '/admin/members/region', icon: MapPin },
      { id: 'marketing_agree', name: '마케팅 수신 동의', path: '/admin/members/marketing', icon: Mail },
      { id: 'conv_rate', name: '예약 전환율', path: '/admin/members/conversion', icon: MousePointerClick },
      { id: 'dormant', name: '휴면/정지 회원', path: '/admin/members/dormant', icon: UserMinus },
      { id: 'withdraw_req', name: '탈퇴 요청', path: '/admin/members/withdrawal', icon: FileX },
      { id: 'blacklist', name: '블랙리스트', path: '/admin/members/blacklist', icon: UserX },
      { id: 'grade_history', name: '등급 조정 이력', path: '/admin/members/history', icon: History },
      { id: 'long_term', name: '장기 미접속', path: '/admin/members/inactivity', icon: Clock },
    ]
  },
  { id: 'reviews', name: '리뷰 관리', icon: MessageSquare, path: '/admin/reviews' },
  { id: 'notifications', name: '알림 센터', icon: Bell, path: '/admin/notifications' },
  { id: 'attribution', name: 'Attribution 데모', icon: Beaker, path: '/admin/attribution' },
  { id: 'ai_schedule', name: 'AI 자동 일정 관리', icon: CalendarCheck, path: '/admin/ai-schedule' },
  { id: 'accounts', name: '어드민 계정 관리', icon: ShieldCheck, path: '/admin/accounts' },
  { id: 'settings', name: '설정', icon: Settings, path: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const parentOfPath = MENU_DATA.find(item => 
      item.subItems?.some(sub => pathname === sub.path)
    );
    const singlePathItem = MENU_DATA.find(item => item.path === pathname);

    if (parentOfPath) {
      setActiveMenuId(parentOfPath.id);
      setOpenMenu(parentOfPath.id);
    } else if (singlePathItem) {
      setActiveMenuId(singlePathItem.id);
      setOpenMenu(null);
    }
  }, [pathname]);

  const handleParentClick = (id: string) => {
    const isOpening = openMenu !== id;
    setOpenMenu(isOpening ? id : null);
    setActiveMenuId(id);
  };

  const handleSingleClick = (id: string, path: string) => {
    setActiveMenuId(id);
    setOpenMenu(null);
    router.push(path);
  };

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold italic tracking-tighter uppercase text-gray-900">Vacance Admin v4.0</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-10">
        {MENU_DATA.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isActive = activeMenuId === item.id;
          const isOpen = openMenu === item.id;

          return (
            <div key={item.id} className="space-y-1">
              {hasSubItems ? (
                <button
                  onClick={() => handleParentClick(item.id)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-all ${
                    isActive ? 'bg-gray-900 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span className="text-[13.5px] font-medium">{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <button
                  onClick={() => handleSingleClick(item.id, item.path || '#')}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-all ${
                    isActive ? 'bg-gray-900 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span className="text-[13.5px] font-medium">{item.name}</span>
                  </div>
                </button>
              )}

              {hasSubItems && isOpen && (
                <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
                  {item.subItems?.map((sub) => {
                    const isSubActive = pathname === sub.path;
                    return (
                      <Link
                        key={sub.id}
                        href={sub.path}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
                          isSubActive 
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