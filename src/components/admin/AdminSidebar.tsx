'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/services/authService';
import toast from 'react-hot-toast';
import { 
  ChevronDown, LayoutDashboard, BookOpen, ShoppingCart, MapPin, 
  Megaphone, UserCog, MessageSquare, Bell, Users, Settings, LogOut,
  Compass, Target, Filter, Link2, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useAuthorization } from '@/hooks/useAuthorization';

// 메뉴 아이템 타입 정의 (id 추가)
type MenuItem = {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  submenu?: MenuItem[];
};

// 메뉴 데이터 정의 (id 값은 useAuthorization 훅과 연동)
const ALL_MENUS: MenuItem[] = [
  {
    id: 'dashboard', // 대시보드는 하위 메뉴 권한에 따라 표시 여부 결정
    name: '대시보드',
    path: '#',
    icon: LayoutDashboard,
    submenu: [
      { id: 'summary', name: '종합 요약', path: '/admin/dashboard', icon: Compass },
      { id: 'marketing', name: '마케팅 분석', path: '#', icon: Target },
      { id: 'city_analysis', name: '도시별 분석', path: '#', icon: Filter },
      { id: 'place_analysis', name: '장소 분석', path: '#', icon: Link2 },
      { id: 'user_analysis', name: '사용자 분석', path: '#', icon: Users },
      { id: 'trend', name: '트렌드 예측', path: '#', icon: TrendingUp },
    ],
  },
  { id: 'content', name: '콘텐츠 관리', path: '/admin/content-library', icon: BookOpen },
  { id: 'commerce', name: '커머스 관리', path: '/admin/hotels', icon: ShoppingCart },
  { id: 'location', name: '위치 관리', path: '/admin/locations', icon: MapPin },
  { id: 'ads', name: '광고 관리', path: '#', icon: Megaphone },
  { id: 'members', name: '회원 관리', path: '#', icon: UserCog },
  { id: 'reviews', name: '리뷰 관리', path: '#', icon: MessageSquare },
  { id: 'notifications', name: '알림 센터', path: '#', icon: Bell },
  { id: 'admin_mgmt', name: '어드민 계정 관리', path: '/admin/accounts', icon: ShieldCheck },
  { id: 'settings', name: '설정', path: '#', icon: Settings },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { canView } = useAuthorization(); // 권한 검증 훅
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // [CTO Alex] 권한에 따라 필터링된 메뉴
  const visibleMenus = ALL_MENUS.map(item => {
    if (item.id === 'dashboard' && item.submenu) {
      const visibleSubmenu = item.submenu.filter(sub => canView(sub.id));
      return visibleSubmenu.length > 0 ? { ...item, submenu: visibleSubmenu } : null;
    }
    return canView(item.id) ? item : null;
  }).filter(Boolean) as MenuItem[];

  useEffect(() => {
    for (const item of visibleMenus) {
      if (item.submenu?.some(sub => sub.path === pathname) || item.path === pathname) {
        setOpenMenu(item.name);
        break;
      }
    }
  }, [pathname, visibleMenus]);

  const handleLogout = async () => {
    // [CTO Alex] confirm()은 샌드박스 환경에서 차단되므로, 즉시 실행하도록 수정합니다.
    try {
      await logout();
      toast.success("안전하게 로그아웃되었습니다.");
      router.push('/admin/login');
    } catch (e) { 
      console.error("Logout failed:", e);
      toast.error("로그아웃 중 오류가 발생했습니다."); 
    }
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col p-6">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter">VACANCE ADMIN</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        <ul className="space-y-1.5">
          {visibleMenus.map((item) => {
            const isMenuOpen = openMenu === item.name;
            const isParentActive = item.submenu?.some(sub => sub.path === pathname);

            return (
              <li key={item.name}>
                {item.submenu ? (
                  <>
                    <div onClick={() => setOpenMenu(isMenuOpen ? null : item.name)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isParentActive ? 'bg-blue-50/50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}>
                      <div className="flex items-center gap-3.5">
                        <item.icon className={`w-5 h-5 ${isParentActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isMenuOpen && (
                      <ul className="mt-1.5 ml-4 pl-3.5 space-y-1 border-l-2 border-gray-100">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.name}>
                            <Link href={subItem.path} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm ${pathname === subItem.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 font-bold' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                              <subItem.icon className="w-4 h-4" /> {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link href={item.path} className={`flex items-center gap-3.5 p-3 rounded-xl transition-all font-bold text-sm tracking-tight ${pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <item.icon className={`w-5 h-5 ${pathname === item.path ? 'text-white' : 'text-gray-400'}`} /> {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-6 border-t border-slate-50">
        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-black uppercase italic tracking-wider">로그아웃</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
