// Lista de todas as permissões disponíveis no sistema
export const PERMISSIONS = {
    // Usuários
    USER_VIEW: 'user.view',
    USER_CREATE: 'user.create',
    USER_EDIT: 'user.edit',
    USER_DELETE: 'user.delete',
    
    // Cargos
    ROLE_VIEW: 'role.view',
    ROLE_CREATE: 'role.create',
    ROLE_EDIT: 'role.edit',
    ROLE_DELETE: 'role.delete',
    
    // Imóveis
    PROPERTY_VIEW: 'property.view',
    PROPERTY_CREATE: 'property.create',
    PROPERTY_EDIT: 'property.edit',
    PROPERTY_DELETE: 'property.delete',
    PROPERTY_APPROVE: 'property.approve',
    
    // Negócios
    BUSINESS_VIEW: 'business.view',
    BUSINESS_CREATE: 'business.create',
    BUSINESS_EDIT: 'business.edit',
    BUSINESS_DELETE: 'business.delete',
    BUSINESS_APPROVE: 'business.approve',
    
    // Relatórios
    REPORT_VIEW: 'report.view',
    REPORT_CREATE: 'report.create',
    REPORT_EXPORT: 'report.export',
    
    // Configurações
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_EDIT: 'settings.edit',
    
    // Analytics
    ANALYTICS_VIEW: 'analytics.view',
    ANALYTICS_EXPORT: 'analytics.export'
};

// Cargos padrão do sistema
export const SYSTEM_ROLES = {
    SUPER_ADMIN: {
        name: 'Super Administrador',
        slug: 'super_admin',
        description: 'Acesso total ao sistema',
        permissions: Object.values(PERMISSIONS)
    },
    ADMIN: {
        name: 'Administrador',
        slug: 'admin',
        description: 'Gerenciamento geral do sistema',
        permissions: [
            PERMISSIONS.USER_VIEW,
            PERMISSIONS.USER_CREATE,
            PERMISSIONS.USER_EDIT,
            PERMISSIONS.ROLE_VIEW,
            PERMISSIONS.ROLE_CREATE,
            PERMISSIONS.ROLE_EDIT,
            PERMISSIONS.PROPERTY_VIEW,
            PERMISSIONS.PROPERTY_CREATE,
            PERMISSIONS.PROPERTY_EDIT,
            PERMISSIONS.PROPERTY_APPROVE,
            PERMISSIONS.BUSINESS_VIEW,
            PERMISSIONS.BUSINESS_CREATE,
            PERMISSIONS.BUSINESS_EDIT,
            PERMISSIONS.BUSINESS_APPROVE,
            PERMISSIONS.REPORT_VIEW,
            PERMISSIONS.REPORT_CREATE,
            PERMISSIONS.SETTINGS_VIEW,
            PERMISSIONS.ANALYTICS_VIEW
        ]
    },
    EDITOR: {
        name: 'Editor',
        slug: 'editor',
        description: 'Gerenciamento de conteúdo',
        permissions: [
            PERMISSIONS.PROPERTY_VIEW,
            PERMISSIONS.PROPERTY_CREATE,
            PERMISSIONS.PROPERTY_EDIT,
            PERMISSIONS.BUSINESS_VIEW,
            PERMISSIONS.BUSINESS_CREATE,
            PERMISSIONS.BUSINESS_EDIT,
            PERMISSIONS.REPORT_VIEW
        ]
    },
    HR: {
        name: 'Recursos Humanos',
        slug: 'hr',
        description: 'Gerenciamento de usuários',
        permissions: [
            PERMISSIONS.USER_VIEW,
            PERMISSIONS.USER_CREATE,
            PERMISSIONS.USER_EDIT,
            PERMISSIONS.REPORT_VIEW
        ]
    }
};