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
import { UploadFile } from "@/api/integrations";
import { User } from "@/api/entities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileImageDialog({ open, onOpenChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (open) {
      const loadUserData = async () => {
        try {
          const userData = await User.me();
          setCurrentUser(userData);
          if (userData?.avatar_url) {
            setPreview(userData.avatar_url);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      };
      
      loadUserData();
    }
  }, [open]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 2MB");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Apenas arquivos JPG e PNG são permitidos");
        return;
      }
      setSelectedFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file: selectedFile });
      await User.updateMyUserData({ avatar_url: file_url });
      onOpenChange(false);
      // Atualize a UI diretamente em vez de recarregar a página
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setError("Erro ao salvar a imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Foto de Perfil</DialogTitle>
          <DialogDescription>
            Escolha uma nova foto para seu perfil administrativo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#007BFF] flex items-center justify-center">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Prévia" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar className="w-full h-full">
                  <AvatarFallback className="text-4xl">{currentUser?.full_name?.[0] || 'A'}</AvatarFallback>
                </Avatar>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-2 w-full">
              <Label 
                htmlFor="picture" 
                className="bg-[#007BFF] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors w-full text-center"
              >
                Escolher Nova Foto
              </Label>
              <input
                id="picture"
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileSelect}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <p className="text-xs text-gray-500 mt-1">
                JPG ou PNG, máximo 2MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedFile || isUploading}
            className="bg-[#4CAF50] hover:bg-green-600"
          >
            {isUploading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}