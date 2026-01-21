import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadFile } from "@/api/integrations";
import { Image, X, Loader2 } from "lucide-react";

export default function ImageUploader({ 
  onMainImageUpload, 
  onGalleryUpload,
  mainImageUrl,
  galleryUrls = [],
  onRemoveGalleryImage
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      if (result && result.file_url) {
        onMainImageUpload(result.file_url);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const result = await UploadFile({ file: files[i] });
        if (result && result.file_url) {
          onGalleryUpload(result.file_url);
        }
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Imagem Principal</Label>
        <div className="mt-2">
          {mainImageUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={mainImageUrl} 
                alt="Imagem principal" 
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onMainImageUpload("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
                id="main-image-upload"
              />
              <Label 
                htmlFor="main-image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Image className="h-8 w-8 mb-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Clique para upload da imagem principal
                </span>
              </Label>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Galeria de Fotos</Label>
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleGalleryUpload}
            multiple
            className="hidden"
            id="gallery-upload"
          />
          <div className="grid grid-cols-3 gap-4 mb-4">
            {galleryUrls.map((url, index) => (
              <div key={index} className="relative h-32">
                <img 
                  src={url} 
                  alt={`Foto ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => onRemoveGalleryImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Label 
            htmlFor="gallery-upload"
            className="cursor-pointer block border-2 border-dashed rounded-lg p-4 text-center"
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="mt-2 text-sm text-gray-600">
                  Enviando... {Math.round(uploadProgress)}%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Image className="h-8 w-8 mb-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Clique para adicionar mais fotos
                </span>
              </div>
            )}
          </Label>
        </div>
      </div>
    </div>
  );
}