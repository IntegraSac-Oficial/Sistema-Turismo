import React from 'react';
import { usePermissions } from '@/components/permissions/usePermissions';

export default function PermissionGuard({ 
    permissions, 
    requireAll = false, 
    children, 
    fallback = null 
}) {
    const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

    // Se não houver permissões especificadas, renderiza o conteúdo
    if (!permissions || permissions.length === 0) {
        return children;
    }

    // Verifica as permissões
    const hasAccess = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);

    // Renderiza o conteúdo ou fallback baseado nas permissões
    return hasAccess ? children : fallback;
}