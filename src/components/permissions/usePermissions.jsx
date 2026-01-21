import { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { Role } from '@/api/entities';
import { UserRole } from '@/api/entities';

// Cache simples para reduzir chamadas à API
let permissionsCache = {
  userId: null,
  permissions: [],
  timestamp: null
};

export function usePermissions() {
    const [userPermissions, setUserPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUserPermissions();
    }, []);

    const loadUserPermissions = async () => {
        try {
            setIsLoading(true);
            
            // Verificar se há um usuário atual em localStorage
            const storedUser = localStorage.getItem('currentUser');
            if (!storedUser) {
                setUserPermissions([]);
                setIsLoading(false);
                return;
            }

            const currentUser = JSON.parse(storedUser);
            
            // Verificar se temos um cache válido (menos de 5 minutos)
            const now = Date.now();
            if (
                permissionsCache.userId === currentUser.id && 
                permissionsCache.permissions.length > 0 && 
                permissionsCache.timestamp && 
                (now - permissionsCache.timestamp) < 5 * 60 * 1000
            ) {
                // Usar o cache
                setUserPermissions(permissionsCache.permissions);
                setIsLoading(false);
                return;
            }

            // Se chegar aqui, precisamos buscar as permissões na API
            // Simular permissões do super admin para o email do admin principal
            if (currentUser.email === 'contato.jrsn@gmail.com') {
                const allPermissions = [
                    'user.view', 'user.create', 'user.edit', 'user.delete',
                    'role.view', 'role.create', 'role.edit', 'role.delete',
                    'property.view', 'property.create', 'property.edit', 'property.delete', 'property.approve',
                    'business.view', 'business.create', 'business.edit', 'business.delete', 'business.approve',
                    'report.view', 'report.create', 'report.export',
                    'settings.view', 'settings.edit',
                    'analytics.view', 'analytics.export'
                ];
                
                // Atualizar o cache
                permissionsCache = {
                    userId: currentUser.id,
                    permissions: allPermissions,
                    timestamp: now
                };
                
                setUserPermissions(allPermissions);
                setIsLoading(false);
                return;
            }

            // Se não for o admin principal, buscar as permissões na API com retry
            let retries = 0;
            const maxRetries = 3;
            let success = false;
            
            while (!success && retries < maxRetries) {
                try {
                    // Buscar usuário atual
                    const user = await User.me().catch(() => currentUser);
                    
                    // Buscar cargos do usuário com pequeno intervalo entre tentativas
                    const userRoles = await UserRole.filter({ 
                        user_id: user.id, 
                        is_active: true 
                    });
                    
                    // Buscar detalhes dos cargos um por um para evitar muitas requisições simultâneas
                    const roles = [];
                    for (const ur of userRoles) {
                        try {
                            const role = await Role.get(ur.role_id);
                            if (role) roles.push(role);
                            
                            // Pequena espera entre requisições para evitar rate limits
                            await new Promise(resolve => setTimeout(resolve, 300));
                        } catch (err) {
                            console.warn("Erro ao buscar role:", err);
                        }
                    }

                    // Combinar todas as permissões dos cargos
                    const permissions = roles.reduce((acc, role) => {
                        if (role && role.permissions) {
                            return [...acc, ...role.permissions];
                        }
                        return acc;
                    }, []);

                    // Remover duplicatas
                    const uniquePermissions = [...new Set(permissions)];
                    
                    // Atualizar o cache
                    permissionsCache = {
                        userId: user.id,
                        permissions: uniquePermissions,
                        timestamp: now
                    };
                    
                    setUserPermissions(uniquePermissions);
                    success = true;
                } catch (error) {
                    retries++;
                    console.warn(`Tentativa ${retries} falhou. Erro:`, error);
                    
                    // Esperar mais tempo antes da próxima tentativa
                    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                }
            }
            
            if (!success) {
                // Após todas as tentativas, usar permissões padrões mínimas
                setUserPermissions(['user.view', 'role.view']);
                console.error('Não foi possível obter permissões após várias tentativas');
            }
        } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            setError(error);
            
            // Usar permissões mínimas caso ocorra erro
            setUserPermissions(['user.view', 'role.view']);
        } finally {
            setIsLoading(false);
        }
    };

    const hasPermission = (permission) => {
        return userPermissions.includes(permission);
    };

    const hasAnyPermission = (permissions) => {
        return permissions.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissions) => {
        return permissions.every(permission => hasPermission(permission));
    };

    return {
        permissions: userPermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isLoading,
        error,
        refresh: loadUserPermissions
    };
}