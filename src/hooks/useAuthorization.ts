import { useAuth } from '@/context/AuthContext';

type Action = 'view' | 'create' | 'update' | 'delete';

export const useAuthorization = () => {
  const { adminData } = useAuth();

  const checkPermission = (menuId: string, action: Action): boolean => {
    if (!adminData) return false;
    if (adminData.role === '슈퍼어드민') return true; // 슈퍼어드민은 무조건 통과

    const permission = adminData.permissions?.[menuId];
    return permission?.[action] || false;
  };

  return {
    checkPermission,
    canView: (menuId: string) => checkPermission(menuId, 'view'),
    canCreate: (menuId: string) => checkPermission(menuId, 'create'),
    canUpdate: (menuId: string) => checkPermission(menuId, 'update'),
    canDelete: (menuId: string) => checkPermission(menuId, 'delete'),
  };
};
