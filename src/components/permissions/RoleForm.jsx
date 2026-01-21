import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSIONS } from './permissions';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RoleForm({ role, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        permissions: [],
        is_active: true
    });

    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name || '',
                slug: role.slug || '',
                description: role.description || '',
                permissions: role.permissions || [],
                is_active: role.is_active !== false
            });
        }
    }, [role]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handlePermissionToggle = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    // Agrupar permissões por categoria
    const groupedPermissions = Object.entries(PERMISSIONS).reduce((acc, [key, value]) => {
        const category = value.split('.')[0];
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push({ key, value });
        return acc;
    }, {});

    const handleGenerateSlug = () => {
        if (formData.name) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '_');
            setFormData({...formData, slug});
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Nome do Cargo</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onBlur={handleGenerateSlug}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="slug">Identificador (slug)</Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <Label>Permissões</Label>
                    <div className="h-[200px] border rounded-md p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([category, permissions]) => (
                                <div key={category} className="space-y-2">
                                    <h4 className="font-medium capitalize">{category}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {permissions.map(({ key, value }) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={key}
                                                    checked={formData.permissions.includes(value)}
                                                    onCheckedChange={() => handlePermissionToggle(value)}
                                                />
                                                <label htmlFor={key} className="text-sm">
                                                    {key.split('_').map(word => 
                                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                    ).join(' ')}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {role ? 'Atualizar' : 'Criar'} Cargo
                </Button>
            </div>
        </form>
    );
}