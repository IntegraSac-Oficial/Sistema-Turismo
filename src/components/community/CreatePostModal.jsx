import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, MapPin, Trash2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function CreatePostModal({ isOpen, onClose, onSubmit, user }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [type, setType] = useState("experience");
  const [locationName, setLocationName] = useState("");
  const [locationType, setLocationType] = useState("custom");
  const [error, setError] = useState("");
  
  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Por favor, escreva algo para compartilhar");
      return;
    }
    
    setError("");
    
    const postData = {
      content,
      images,
      type,
      locationName,
      locationType
    };
    
    onSubmit(postData);
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      setError("O arquivo selecionado não é uma imagem");
      return;
    }
    
    setIsUploading(true);
    setError("");
    
    try {
      // Criar uma prévia local para mostrar imediatamente
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result;
        setImages([...images, previewUrl]);
      };
      reader.readAsDataURL(file);
      
      // Fazer o upload para o servidor
      const { file_url } = await UploadFile({ file });
      
      // Substituir a prévia local pela URL real
      setImages(prev => {
        const newImages = [...prev];
        newImages[newImages.length - 1] = file_url;
        return newImages;
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setError("Erro ao fazer upload da imagem. Tente novamente.");
      setImages(prev => prev.slice(0, -1)); // Remover a prévia se o upload falhar
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const resetForm = () => {
    setContent("");
    setImages([]);
    setType("experience");
    setLocationName("");
    setLocationType("custom");
    setError("");
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Criar Publicação</DialogTitle>
          <DialogDescription>
            Compartilhe experiências e dicas com a comunidade de turismo de Santa Catarina.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
              {user?.avatar_url && (
                <AvatarImage src={user.avatar_url} alt={user?.full_name} />
              )}
            </Avatar>
            <div>
              <p className="font-medium">{user?.full_name || "Usuário"}</p>
              
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-7 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipo de publicação</SelectLabel>
                    <SelectItem value="experience">Experiência</SelectItem>
                    <SelectItem value="tip">Dica</SelectItem>
                    <SelectItem value="question">Pergunta</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Textarea
            placeholder="O que você gostaria de compartilhar?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 resize-none"
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative rounded-md overflow-hidden h-32">
                  <img
                    src={image}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 bg-white text-red-500 hover:bg-red-100"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Localização (cidade, praia, etc.)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => document.getElementById("image-upload").click()}
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4" />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || isUploading}
              className="bg-[#007BFF] hover:bg-blue-600"
            >
              {isUploading ? "Enviando..." : "Publicar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}