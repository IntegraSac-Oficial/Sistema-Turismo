import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { User } from '@/api/entities';
import { Role } from '@/api/entities';
import { UserRole } from '@/api/entities';
import CreateUserDialog from '@/components/users/CreateUserDialog';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
    ArrowLeft,
    Search,
    UserPlus,
    Shield,
    RefreshCw,
    Users
} from 'lucide-react';

export default function UserRoles() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, rolesData, userRolesData] = await Promise.all([
                User.list(),
                Role.list(),
                UserRole.list()
            ]);
            
            const usersWithRoles = usersData.map(user => {
                const userRoleEntries = userRolesData.filter(ur => ur.user_id === user.id);
                const userRoleIds = userRoleEntries.map(ur => ur.role_id);
                const assignedRoles = rolesData.filter(role => userRoleIds.includes(role.id));
                
                return {
                    ...user,
                    roles: assignedRoles
                };
            });
            
            setUsers(usersWithRoles);
            setRoles(rolesData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRole) return;
        
        try {
            await UserRole.create({
                user_id: selectedUser,
                role_id: selectedRole,
                assigned_date: new Date().toISOString(),
                is_active: true
            });
            
            toast({
                title: "Sucesso",
                description: "Cargo atribuído com sucesso"
            });
            
            setShowAssignDialog(false);
            loadData();
        } catch (error) {
            console.error('Erro ao atribuir cargo:', error);
            toast({
                title: "Erro",
                description: "Não foi possível atribuir o cargo",
                variant: "destructive"
            });
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6">
            <Button 
                variant="ghost" 
                className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => navigate(createPageUrl("RoleManagement"))}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Gerenciamento de Cargos
            </Button>
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Atribuição de Cargos a Usuários</h1>
                    <p className="text-gray-500">
                        Gerencie quais usuários têm acesso a cada cargo e funcionalidade
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(true)}
                        className="flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Novo Usuário
                    </Button>
                    <Button
                        onClick={() => setShowAssignDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Atribuir Cargo
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                className="pl-10"
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={loadData}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Atualizar
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Cargos</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <Users className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">Nenhum usuário encontrado</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.full_name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map(role => (
                                                    <span
                                                        key={role.id}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                                    >
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user.id);
                                                    setShowAssignDialog(true);
                                                }}
                                            >
                                                Atribuir Cargo
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Diálogo de Atribuição de Cargo */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atribuir Cargo a Usuário</DialogTitle>
                        <DialogDescription>
                            Selecione um usuário e um cargo para realizar a atribuição
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Usuário</label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecionar usuário" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cargo</label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecionar cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAssignRole} className="bg-blue-600 hover:bg-blue-700">
                            Atribuir Cargo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Criação de Usuário */}
            <CreateUserDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onUserCreated={loadData}
            />
        </div>
    );
}