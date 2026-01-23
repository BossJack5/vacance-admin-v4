// [CTO Alex] 특정 권한이 필요한 UI 요소를 감싸서 보호합니다.
import { usePermission } from "@/hooks/usePermission";

interface GuardProps {
  menu: string;
  action: 'view' | 'create' | 'update' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode; // 권한 없을 때 보여줄 대체 UI
}

export default function PermissionGuard({ menu, action, children, fallback = null }: GuardProps) {
  const permissions = usePermission(menu);
  
  const hasPermission = 
    (action === 'view' && permissions.canView) ||
    (action === 'create' && permissions.canCreate) ||
    (action === 'update' && permissions.canUpdate) ||
    (action === 'delete' && permissions.canDelete);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
