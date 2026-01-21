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

export default function NameDialog({ open, onOpenChange }) {
  const [currentName, setCurrentName] = useState("");
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await User.me();
        if (userData) {
          setCurrentName(userData.full_name || "");
          setNewName(userData.full_name || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    if (open) {
      loadUserData();
    }
  }, [open]);

  const handleSave = async () => {
    if (!newName.trim()) {
      setError("O nome não pode estar vazio");
      return;
    }

    setIsLoading(true);
    try {
      await User.updateMyUserData({ full_name: newName });
      onOpenChange(false);
      window.location.reload(); // Recarrega para atualizar o nome
    } catch (error) {
      setError("Erro ao salvar o nome. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mudar Nome</DialogTitle>
          <DialogDescription>
            Altere seu nome de exibição no sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !newName.trim() || newName === currentName}
            className="bg-[#007BFF] hover:bg-blue-600"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}