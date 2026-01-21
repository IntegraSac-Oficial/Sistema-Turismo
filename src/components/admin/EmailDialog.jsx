import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "@/api/entities";

export default function EmailDialog({ open, onOpenChange }) {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await User.me();
        if (userData) {
          setCurrentEmail(userData.email || "");
          setNewEmail(userData.email || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    if (open) {
      loadUserData();
    }
  }, [open]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSave = async () => {
    if (!newEmail.trim()) {
      setError("O e-mail não pode estar vazio");
      return;
    }

    if (!validateEmail(newEmail)) {
      setError("Insira um e-mail válido");
      return;
    }

    setIsLoading(true);
    try {
      await User.updateMyUserData({ email: newEmail });
      onOpenChange(false);
      window.location.reload(); // Recarrega para atualizar o e-mail
    } catch (error) {
      setError("Erro ao salvar o e-mail. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar E-mail de Acesso</DialogTitle>
          <DialogDescription>
            Altere seu e-mail para acessar o sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Digite seu e-mail"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !newEmail.trim() || newEmail === currentEmail || !validateEmail(newEmail)}
            className="bg-[#007BFF] hover:bg-blue-600"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}