
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { User } from "@/api/entities";

export default function CreateUserDialog({ open, onOpenChange, onUserCreated }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            toast({
                title: "Erro",
                description: "As senhas não coincidem",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const userData = {
                full_name: formData.full_name,
                email: formData.email.toLowerCase(),
                password: formData.password
            };

            // Simulate API call - replace with actual API endpoint
            const response = await new Promise((resolve) => {
                setTimeout(() => {
                    // Simulate successful user creation
                    const newUser = {
                        id: Math.random().toString(36).substring(7), // Simulate ID generation
                        ...userData,
                    };
                    resolve({ data: newUser, success: true });
                }, 1500); // Simulate API latency
            });


            if (response.success) {
                toast({
                    title: "Sucesso",
                    description: "Usuário criado com sucesso!"
                });

                onOpenChange(false);
                if (onUserCreated) onUserCreated(response.data);

                setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    confirm_password: ''
                });
            } else {
                toast({
                    title: "Erro",
                    description: response.message || "Erro ao criar usuário",
                    variant: "destructive"
                });
            }


        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            toast({
                title: "Erro",
                description: error.message || "Erro ao criar usuário",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Digite os dados do novo usuário.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input
                            id="full_name"
                            placeholder="Digite o nome completo"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="exemplo@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Digite a senha"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirmar Senha</Label>
                        <Input
                            id="confirm_password"
                            type="password"
                            placeholder="Confirme a senha"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Usuário'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
