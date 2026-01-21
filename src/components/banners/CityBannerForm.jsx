
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityBanner } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UploadCloud, ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar ScrollArea
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CityBannerForm({ cities, categories, banner, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    city_id: "",
    category_id: "",
    title: "",
    image_url: "",
    link_url: "",
    width: 300,
    height: 200,
    placement: "city_detail_sidebar", // Valor padrão para placement
    is_active: true,
    start_date: null,
    end_date: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = React.useRef(null);

  const placementOptions = [
    { value: "city_detail_top", label: "Topo da Página da Cidade" },
    { value: "city_detail_sidebar", label: "Barra Lateral da Cidade" },
    { value: "city_detail_bottom", label: "Rodapé da Página da Cidade" },
    { value: "beach_detail_sidebar", label: "Barra Lateral da Praia" },
    { value: "general_sidebar", label: "Barra Lateral Geral" },
  ];

  useEffect(() => {
    if (banner) {
      setFormData({
        city_id: banner.city_id || "",
        category_id: banner.category_id || "",
        title: banner.title || "",
        image_url: banner.image_url || "",
        link_url: banner.link_url || "",
        width: banner.width || 300,
        height: banner.height || 200,
        placement: banner.placement || "city_detail_sidebar",
        is_active: typeof banner.is_active === 'boolean' ? banner.is_active : true,
        start_date: banner.start_date ? parseISO(banner.start_date) : null,
        end_date: banner.end_date ? parseISO(banner.end_date) : null,
      });
      setImagePreview(banner.image_url || "");
    } else {
      setFormData({
        city_id: "",
        category_id: "",
        title: "",
        image_url: "",
        link_url: "",
        width: 300,
        height: 200,
        placement: "city_detail_sidebar",
        is_active: true,
        start_date: null,
        end_date: null,
      });
      setImagePreview("");
    }
  }, [banner]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setImagePreview(URL.createObjectURL(file)); 
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange("image_url", file_url);
      toast({ title: "Upload Concluído", description: "Imagem do banner enviada." });
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      toast({ title: "Erro no Upload", description: "Não foi possível enviar a imagem.", variant: "destructive" });
      setImagePreview(formData.image_url); // Reverter para imagem anterior se houver
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!formData.city_id || !formData.category_id || !formData.title || !formData.image_url || !formData.placement) {
        toast({ title: "Campos Obrigatórios", description: "Cidade, Categoria, Título, Imagem e Alcance são obrigatórios.", variant: "destructive"});
        setIsSaving(false);
        return;
    }

    try {
      const dataToSave = { 
        ...formData,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
       };
      if (!dataToSave.link_url) delete dataToSave.link_url;
      if (!dataToSave.start_date) delete dataToSave.start_date;
      if (!dataToSave.end_date) delete dataToSave.end_date;


      if (banner && banner.id) {
        await CityBanner.update(banner.id, dataToSave);
        toast({ title: "Banner Atualizado", description: "As alterações no banner foram salvas." });
      } else {
        await CityBanner.create(dataToSave);
        toast({ title: "Banner Criado", description: "O novo banner foi adicionado com sucesso." });
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar o banner.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollArea className="h-[70vh] sm:h-auto sm:max-h-[80vh] px-6"> {/* Ajustado padding horizontal */}
      <form onSubmit={handleSubmit} className="space-y-6 py-6"> {/* Ajustado espaçamento vertical */}
        <div>
          <Label htmlFor="city_id">Cidade*</Label>
          <Select
            value={formData.city_id}
            onValueChange={(value) => handleInputChange("city_id", value)}
            required
          >
            <SelectTrigger id="city_id">
              <SelectValue placeholder="Selecione uma cidade" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category_id">Categoria*</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => handleInputChange("category_id", value)}
            required
          >
            <SelectTrigger id="category_id">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="placement">Alcance do Banner*</Label>
          <Select
            value={formData.placement}
            onValueChange={(value) => handleInputChange("placement", value)}
            required
          >
            <SelectTrigger id="placement">
              <SelectValue placeholder="Selecione o local de exibição" />
            </SelectTrigger>
            <SelectContent>
              {placementOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Título do Banner*</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Ex: Melhor Hotel da Cidade"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="image_upload_banner">Imagem do Banner*</Label>
          <div className="mt-1 flex flex-col items-center">
            
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              {imagePreview ? "Trocar Imagem" : "Enviar Imagem"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              id="image_upload_banner" // ID único para o input de imagem
            />
            {formData.image_url && !imagePreview && (
               <p className="text-xs text-gray-500 mt-1">URL atual: {formData.image_url}</p>
            )}
          </div>
        </div>

        {/* Preview da imagem ajustado */}
        <div className="space-y-2">
          <Label>Preview do Banner</Label>
          <div className="relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center" 
               style={{
                 width: formData.width ? `${formData.width}px` : '100%',
                 height: formData.height ? `${formData.height}px` : '200px',
                 maxWidth: '100%',
                 margin: '0 auto'
               }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span>Nenhuma imagem selecionada</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="link_url">URL de Destino (Opcional)</Label>
          <Input
            id="link_url"
            type="url"
            value={formData.link_url}
            onChange={(e) => handleInputChange("link_url", e.target.value)}
            placeholder="https://exemplo.com/oferta"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="start_date_banner">Data de Início</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.start_date ? format(formData.start_date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={formData.start_date}
                            onSelect={(date) => handleInputChange("start_date", date)}
                            locale={ptBR}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
                <Label htmlFor="end_date_banner">Data de Término</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.end_date ? format(formData.end_date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={formData.end_date}
                            onSelect={(date) => handleInputChange("end_date", date)}
                            disabled={(date) => formData.start_date && date < formData.start_date}
                            locale={ptBR}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
        
        {/* Dimensões em uma grid responsiva */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="width">Largura (px)</Label>
            <Input
              id="width"
              type="number"
              value={formData.width}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handleInputChange("width", value);
              }}
              min="0"
              step="1"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="height">Altura (px)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handleInputChange("height", value);
              }}
              min="0"
              step="1"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
            <Checkbox
                id="is_active_banner" // ID único para o checkbox
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active_banner" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Banner Ativo
            </Label>
        </div>


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {banner ? "Salvar Alterações" : "Criar Banner"}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}
