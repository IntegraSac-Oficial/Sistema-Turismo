
import React, { useState, useEffect } from 'react';
import { Role } from '@/api/entities';
import { Permission } from '@/api/entities';
import { UserRole } from '@/api/entities';
import { User } from '@/api/entities';
import { PERMISSIONS, SYSTEM_ROLES } from '@/components/permissions/permissions';
import { usePermissions } from '@/components/permissions/usePermissions';
import PermissionGuard from '@/components/permissions/PermissionGuard';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
    Plus,
    Edit,
    Trash2,
    Users,
    Shield,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import RoleForm from '@/components/permissions/RoleForm';

export default function RoleManagement() {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    useEffect(() => {
        loadRoles();
        // Retardamos a inicialização dos cargos do sistema para evitar sobrecarga na API
        const timer = setTimeout(() => {
            initializeSystemRoles();
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    // Inicializar cargos padrão do sistema se não existirem
    const initializeSystemRoles = async () => {
        try {
            const systemRoleKeys = Object.keys(SYSTEM_ROLES);
            
            // Buscar cargos existentes
            const existingRoles = await Role.list();
            
            // Identificar quais cargos do sistema não existem ainda
            const missingRoles = systemRoleKeys.filter(key => {
                const systemRole = SYSTEM_ROLES[key];
                return !existingRoles.some(role => role.slug === systemRole.slug);
            });
            
            // Criar cargos faltantes um por um com intervalo para evitar rate limits
            for (const key of missingRoles) {
                try {
                    const roleData = SYSTEM_ROLES[key];
                    
                    await Role.create({
                        name: roleData.name,
                        slug: roleData.slug,
                        description: roleData.description,
                        permissions: roleData.permissions,
                        is_system_role: true
                    });
                    
                    console.log(`Cargo do sistema criado: ${roleData.name}`);
                    
                    // Esperar um pouco entre criações para evitar rate limits
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Erro ao criar cargo ${key}:`, error);
                }
            }
            
            if (missingRoles.length > 0) {
                // Esperar um pouco antes de recarregar para evitar rate limits
                setTimeout(() => loadRoles(), 1000);
            }
        } catch (error) {
            console.error("Erro ao inicializar cargos do sistema:", error);
        }
    };

    const loadRoles = async () => {
        try {
            setIsLoading(true);
            
            // Adicionar retry pattern para evitar falhas por rate limiting
            let retries = 0;
            const maxRetries = 3;
            let fetchedRoles = null;
            
            while (!fetchedRoles && retries < maxRetries) {
                try {
                    fetchedRoles = await Role.list();
                } catch (error) {
                    retries++;
                    console.warn(`Tentativa ${retries} de carregar cargos falhou:`, error);
                    
                    if (retries < maxRetries) {
                        // Esperar mais tempo entre tentativas
                        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                    } else {
                        throw error;
                    }
                }
            }
            
            setRoles(fetchedRoles || []);
        } catch (error) {
            console.error("Erro ao carregar cargos:", error);
            toast({
                title: "Erro ao carregar cargos",
                description: "Não foi possível carregar a lista de cargos. Tente novamente mais tarde.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRole = async (roleData) => {
        try {
            if (selectedRole) {
                await Role.update(selectedRole.id, roleData);
                toast({
                    title: "Cargo atualizado",
                    description: "O cargo foi atualizado com sucesso."
                });
            } else {
                await Role.create(roleData);
                toast({
                    title: "Cargo criado",
                    description: "O novo cargo foi criado com sucesso."
                });
            }
            loadRoles();
            setShowDialog(false);
        } catch (error) {
            console.error("Erro ao salvar cargo:", error);
            toast({
                title: "Erro ao salvar cargo",
                description: error.message || "Ocorreu um erro ao salvar o cargo.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!confirm("Tem certeza que deseja excluir este cargo?")) return;

        try {
            await Role.delete(roleId);
            toast({
                title: "Cargo excluído",
                description: "O cargo foi excluído com sucesso."
            });
            loadRoles();
        } catch (error) {
            console.error("Erro ao excluir cargo:", error);
            toast({
                title: "Erro ao excluir cargo",
                description: error.message || "Ocorreu um erro ao excluir o cargo.",
                variant: "destructive"
            });
        }
    };
    
    const handleUserManagement = (roleId) => {
        navigate(createPageUrl(`UserRoles?roleId=${roleId}`));
    };

    return (
        <div className="container mx-auto p-6">
            <Button 
                variant="ghost" 
                className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => navigate(createPageUrl("Dashboard"))}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Dashboard
            </Button>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Cargos</h1>
                
                <div className="flex gap-3">
                    {/* O botão "Novo Usuário" foi removido pois a API não suporta criação direta com senha.
                        Usuários devem ser convidados pelo painel da plataforma base44. */}
                    <PermissionGuard permissions={[PERMISSIONS.ROLE_CREATE]}>
                        <Button
                            onClick={() => {
                                setSelectedRole(null);
                                setShowDialog(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Cargo
                        </Button>
                    </PermissionGuard>
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
                <p className="font-bold">Informação Importante sobre Usuários</p>
                <p>Para atribuir cargos, os usuários primeiro precisam ser convidados e registrados na plataforma. Utilize o painel de administração da base44 para enviar convites. Após o registro, eles aparecerão na página "Atribuição de Cargos a Usuários".</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-lg">Carregando cargos...</span>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Permissões</TableHead>
                                <TableHead>Usuários</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map(role => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>{role.description}</TableCell>
                                    <TableCell>{role.permissions?.length || 0} permissões</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleUserManagement(role.id)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Gerenciar Usuários com este Cargo
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <PermissionGuard permissions={[PERMISSIONS.ROLE_EDIT]}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                        setShowDialog(true);
                                                    }}
                                                    className="text-gray-500 hover:text-blue-600"
                                                    title="Editar Cargo"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </PermissionGuard>
                                            
                                            <PermissionGuard permissions={[PERMISSIONS.ROLE_DELETE]}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    disabled={role.is_system_role}
                                                    className={`text-gray-500 ${role.is_system_role ? 'cursor-not-allowed opacity-50' : 'hover:text-red-600'}`}
                                                    title={role.is_system_role ? "Cargos do sistema não podem ser excluídos" : "Excluir Cargo"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </PermissionGuard>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Dialog para criar/editar cargo */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedRole ? 'Editar Cargo' : 'Novo Cargo'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRole 
                                ? 'Edite as informações e permissões deste cargo.' 
                                : 'Crie um novo cargo e defina suas permissões.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <RoleForm
                        role={selectedRole}
                        onSubmit={handleSaveRole}
                        onCancel={() => setShowDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* O CreateUserDialog foi removido pois a criação direta de usuários não é suportada pela API.
                Use o painel da plataforma base44 para convidar usuários. */}
        </div>
    );
}
