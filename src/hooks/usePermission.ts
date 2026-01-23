// [CTO Alex] 이 훅이 true를 줘야 버튼들이 다시 나타납니다.
import { useAuth } from "@/context/AuthContext";

export const usePermission = (menuId: string) => {
  const { user, adminData } = useAuth();

  // [슈퍼 어드민 하이패스] 이메일 주소 일치 시 DB 조회 없이 모든 권한 승인
  if (user?.email === 'jackmimosa@gmail.com') {
    return { canView: true, canCreate: true, canUpdate: true, canDelete: true, isSuper: true };
  }

  const p = adminData?.permissions?.[menuId] || {
    view: false, create: false, update: false, delete: false
  };

  return { 
    canView: p.view, 
    canCreate: p.create, 
    canUpdate: p.update, 
    canDelete: p.delete, 
    isSuper: false 
  };
};
