import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, X, Upload, MapPin, Tag, Camera, PencilLine, 
  ChevronDown, ChevronUp, Trash, DollarSign, Calendar,
  Clock, Sparkles, Phone
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { UploadFile } from "@/api/integrations";

export default function CreateGuideModal({ user, onClose, onSubmit, cities, beaches }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location_type: "city",
    location_id: "",
    category: "geral",
    tips: [{ title: "", content: "", image_url: "" }],
    cover_image_url: "",
    tags: [],
    difficulty_level: "facil",
    budget_range: "moderado",
    best_season: "",
    duration: "",
    contact_info: ""
  });
  const [currentTag, setCurrentTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [tipImageFiles, setTipImageFiles] = useState([null]);
  const coverFileInputRef = useRef(null);
  const tipFileInputRefs = useRef([React.createRef()]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const handleTagRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleTipChange = (index, field, value) => {
    const newTips = [...formData.tips];
    newTips[index] = { ...newTips[index], [field]: value };
    setFormData(prev => ({ ...prev, tips: newTips }));
  };

  const handleAddTip = () => {
    setFormData(prev => ({
      ...prev,
      tips: [...prev.tips, { title: "", content: "", image_url: "" }]
    }));
    
    // Adicionar novo ref para o novo input de arquivo
    tipFileInputRefs.current.push(React.createRef());
    setTipImageFiles(prev => [...prev, null]);
  };

  const handleRemoveTip = (index) => {
    if (formData.tips.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index)
    }));
    
    // Remover ref e estado do arquivo
    tipFileInputRefs.current = tipFileInputRefs.current.filter((_, i) => i !== index);
    setTipImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCoverImageFile(file);
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, cover_image_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleTipImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const newTipImageFiles = [...tipImageFiles];
    newTipImageFiles[index] = file;
    setTipImageFiles(newTipImageFiles);
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = () => {
      handleTipChange(index, "image_url", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMoveTip = (index, direction) => {
    if (
      (direction === "up" && index === 0) || 
      (direction === "down" && index === formData.tips.length - 1)
    ) {
      return;
    }
    
    const newTips = [...formData.tips];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    // Trocar posições
    [newTips[index], newTips[newIndex]] = [newTips[newIndex], newTips[index]];
    
    setFormData(prev => ({ ...prev, tips: newTips }));
    
    // Trocar também as referências e arquivos
    const newRefs = [...tipFileInputRefs.current];
    [newRefs[index], newRefs[newIndex]] = [newRefs[newIndex], newRefs[index]];
    tipFileInputRefs.current = newRefs;
    
    const newImageFiles = [...tipImageFiles];
    [newImageFiles[index], newImageFiles[newIndex]] = [newImageFiles[newIndex], newImageFiles[index]];
    setTipImageFiles(newImageFiles);
  };

  const uploadImages = async () => {
    setIsUploading(true);
    try {
      let coverImageUrl = formData.cover_image_url;
      
      // Upload da imagem de capa, se houver um arquivo
      if (coverImageFile && !coverImageUrl.startsWith("https://")) {
        const { file_url } = await UploadFile({ file: coverImageFile });
        coverImageUrl = file_url;
      }
      
      // Upload das imagens das dicas
      const tipsWithImages = await Promise.all(
        formData.tips.map(async (tip, index) => {
          let imageUrl = tip.image_url;
          
          if (tipImageFiles[index] && !imageUrl.startsWith("https://")) {
            const { file_url } = await UploadFile({ file: tipImageFiles[index] });
            imageUrl = file_url;
          }
          
          return { ...tip, image_url: imageUrl };
        })
      );
      
      return {
        ...formData,
        cover_image_url: coverImageUrl,
        tips: tipsWithImages
      };
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location_id) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      // Fazer upload das imagens e obter URLs finais
      const finalData = await uploadImages();
      
      onSubmit(finalData);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      alert("Ocorreu um erro ao criar o guia. Tente novamente.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose} size="lg">
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Criar Novo Guia Local</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Guia *</Label>
              <Input 
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Melhores restaurantes de frutos do mar em Florianópolis"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea 
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva o que as pessoas encontrarão neste guia..."
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location_type">Tipo de Local *</Label>
                <Select 
                  value={formData.location_type} 
                  onValueChange={(value) => handleSelectChange("location_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">Cidade</SelectItem>
                    <SelectItem value="beach">Praia</SelectItem>
                    <SelectItem value="region">Região</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location_id">Local Específico *</Label>
                <Select 
                  value={formData.location_id} 
                  onValueChange={(value) => handleSelectChange("location_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.location_type === "city" && cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                    
                    {formData.location_type === "beach" && beaches.map(beach => (
                      <SelectItem key={beach.id} value={beach.id}>
                        {beach.name}
                      </SelectItem>
                    ))}
                    
                    {formData.location_type === "region" && (
                      <SelectItem value="general">Santa Catarina (geral)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gastronomia">Gastronomia</SelectItem>
                    <SelectItem value="hospedagem">Hospedagem</SelectItem>
                    <SelectItem value="passeios">Passeios</SelectItem>
                    <SelectItem value="eventos">Eventos</SelectItem>
                    <SelectItem value="cultura">Cultura</SelectItem>
                    <SelectItem value="compras">Compras</SelectItem>
                    <SelectItem value="familia">Família</SelectItem>
                    <SelectItem value="noturno">Vida Noturna</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Imagem de capa */}
          <div>
            <Label>Imagem de Capa</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 mt-1 text-center ${
                formData.cover_image_url ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              {formData.cover_image_url ? (
                <div className="relative">
                  <img 
                    src={formData.cover_image_url} 
                    alt="Imagem de capa" 
                    className="max-h-40 mx-auto rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, cover_image_url: "" }));
                      setCoverImageFile(null);
                      if (coverFileInputRef.current) {
                        coverFileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              ) : (
                <div 
                  className="cursor-pointer py-4"
                  onClick={() => coverFileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Clique para escolher uma imagem de capa</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={coverFileInputRef}
                onChange={handleCoverImageChange}
              />
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <Label>Tags (palavras-chave para busca)</Label>
            <div className="flex mt-1 gap-2">
              <Input 
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Ex: praia, sunset, família..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleTagAdd}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center rounded-full bg-blue-100 px-3 py-1">
                    <Tag className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-700">{tag}</span>
                    <button 
                      type="button"
                      className="ml-1 text-blue-700 hover:text-blue-900"
                      onClick={() => handleTagRemove(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Informações complementares */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty_level">Nível de Dificuldade</Label>
              <Select 
                value={formData.difficulty_level} 
                onValueChange={(value) => handleSelectChange("difficulty_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="budget_range">Faixa de Orçamento</Label>
              <Select 
                value={formData.budget_range} 
                onValueChange={(value) => handleSelectChange("budget_range", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economico">Econômico</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="luxo">Luxo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="best_season">Melhor Época</Label>
              <Input 
                id="best_season"
                name="best_season"
                value={formData.best_season}
                onChange={handleInputChange}
                placeholder="Ex: Verão, Dezembro a Março"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duração Recomendada</Label>
              <Input 
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Ex: 2 horas, dia inteiro, fim de semana"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="contact_info">Informações de Contato (opcional)</Label>
              <Input 
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleInputChange}
                placeholder="Contato para mais informações (telefone, email)"
              />
            </div>
          </div>
          
          {/* Dicas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-lg">Dicas e Recomendações</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddTip}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Dica
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.tips.map((tip, index) => (
                <div 
                  key={index} 
                  className="rounded-lg border p-4 relative"
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400"
                      onClick={() => handleMoveTip(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400"
                      onClick={() => handleMoveTip(index, "down")}
                      disabled={index === formData.tips.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-400"
                      onClick={() => handleRemoveTip(index)}
                      disabled={formData.tips.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <div>
                      <Label htmlFor={`tip-title-${index}`}>Título da Dica</Label>
                      <Input 
                        id={`tip-title-${index}`}
                        value={tip.title}
                        onChange={(e) => handleTipChange(index, "title", e.target.value)}
                        placeholder="Ex: Melhor horário para visitar"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`tip-content-${index}`}>Conteúdo</Label>
                      <Textarea 
                        id={`tip-content-${index}`}
                        value={tip.content}
                        onChange={(e) => handleTipChange(index, "content", e.target.value)}
                        placeholder="Detalhe sua dica aqui..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <Label>Imagem (opcional)</Label>
                      <div 
                        className={`border-2 border-dashed rounded-lg p-3 mt-1 text-center ${
                          tip.image_url ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {tip.image_url ? (
                          <div className="relative">
                            <img 
                              src={tip.image_url} 
                              alt={`Imagem para ${tip.title}`} 
                              className="max-h-32 mx-auto rounded-md"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                handleTipChange(index, "image_url", "");
                                const newTipImageFiles = [...tipImageFiles];
                                newTipImageFiles[index] = null;
                                setTipImageFiles(newTipImageFiles);
                                if (tipFileInputRefs.current[index]?.current) {
                                  tipFileInputRefs.current[index].current.value = "";
                                }
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer py-2"
                            onClick={() => tipFileInputRefs.current[index]?.current?.click()}
                          >
                            <Camera className="h-6 w-6 mx-auto text-gray-400" />
                            <p className="mt-1 text-xs text-gray-500">Adicionar imagem</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={tipFileInputRefs.current[index]}
                          onChange={(e) => handleTipImageChange(index, e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Publicar Guia
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}