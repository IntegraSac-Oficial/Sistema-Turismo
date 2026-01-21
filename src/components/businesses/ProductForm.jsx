import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { UploadFile } from "@/api/integrations";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
  X,
  Image as ImageIcon
} from "lucide-react";

export default function ProductForm({ business, product, onSubmit, onCancel }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_featured: false,
    is_available: true,
    business_id: business?.id || ""
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        image_url: product.image_url || "",
        is_featured: product.is_featured || false,
        is_available: product.is_available !== false,
        business_id: business?.id || product.business_id || ""
      });
    }
  }, [product, business?.id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleToggle = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field]
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const { file_url } = await UploadFile({ file });
      
      setFormData({
        ...formData,
        image_url: file_url
      });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image_url: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };
      
      await onSubmit(productData);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <button 
        onClick={onCancel}
        className="text-blue-600 mb-4 flex items-center hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar
      </button>
      
      <Card>
        <CardHeader>
          <CardTitle>{product ? "Editar Produto" : "Novo Produto"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Detalhes básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nome do Produto*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome do produto ou serviço"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Preço (R$)*</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva detalhes sobre o produto ou serviço"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ex: Alimentos, Bebidas, Hospedagem"
                />
              </div>
            </div>

            {/* Imagem */}
            <div>
              <Label>Imagem do Produto</Label>
              
              {formData.image_url ? (
                <div className="mt-2 relative">
                  <img
                    src={formData.image_url}
                    alt="Preview do produto"
                    className="w-full max-w-md h-64 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {uploading ? "Enviando..." : "Clique para fazer upload de uma imagem"}
                    </p>
                    
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        disabled={uploading}
                        onClick={() => document.getElementById("image-upload").click()}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Selecionar Imagem
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Configurações adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Disponível</h3>
                  <p className="text-sm text-gray-500">
                    Produto disponível para venda
                  </p>
                </div>
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={() => handleToggle('is_available')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Destacar Produto</h3>
                  <p className="text-sm text-gray-500">
                    Mostrar em destaque na loja
                  </p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={() => handleToggle('is_featured')}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Produto
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}