
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function CityForm({ city, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    state: "Santa Catarina",
    description: "",
    image_url: "",
    population: "",
    gastronomy: "",
    accommodation_types: "",
    season_start: "",
    culinary_origin: "",
    city_hall_phone: "",
    latitude: "",
    longitude: "",
    beaches_count: "",
    map_iframe_url: ""
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name || "",
        state: city.state || "Santa Catarina",
        description: city.description || "",
        image_url: city.image_url || "",
        population: city.population ? String(city.population) : "",
        gastronomy: city.gastronomy || "",
        accommodation_types: city.accommodation_types || "",
        season_start: city.season_start || "",
        culinary_origin: city.culinary_origin || "",
        city_hall_phone: city.city_hall_phone || "",
        latitude: city.latitude !== undefined && city.latitude !== null ? String(city.latitude) : "",
        longitude: city.longitude !== undefined && city.longitude !== null ? String(city.longitude) : "",
        beaches_count: city.beaches_count ? String(city.beaches_count) : "",
        map_iframe_url: city.map_iframe_url || ""
      });
      
      if (city.image_url) {
        setPreviewUrl(city.image_url);
      }
    }
  }, [city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^-?[0-9]*[.,]?[0-9]*$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      name: formData.name || "",
      state: formData.state || "Santa Catarina",
      description: formData.description || "",
      image_url: formData.image_url || "",
      population: formData.population ? Number(formData.population) : null,
      gastronomy: formData.gastronomy || "",
      accommodation_types: formData.accommodation_types || "",
      culinary_origin: formData.culinary_origin || "",
      city_hall_phone: formData.city_hall_phone || "",
      beaches_count: formData.beaches_count ? Number(formData.beaches_count) : null,
      map_iframe_url: formData.map_iframe_url || ""
    };

    if (formData.latitude) {
      const cleanedLat = formData.latitude.toString().replace(',', '.');
      dataToSubmit.latitude = Number(cleanedLat);
      if (isNaN(dataToSubmit.latitude)) {
        dataToSubmit.latitude = null;
      }
    } else {
      dataToSubmit.latitude = null;
    }
    
    if (formData.longitude) {
      const cleanedLng = formData.longitude.toString().replace(',', '.');
      dataToSubmit.longitude = Number(cleanedLng);
      if (isNaN(dataToSubmit.longitude)) {
        dataToSubmit.longitude = null;
      }
    } else {
      dataToSubmit.longitude = null;
    }
    
    onSubmit(dataToSubmit);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { file_url } = await UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      setPreviewUrl(file_url);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      alert("Falha ao fazer upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLatLongChange = (e) => {
    const { name, value } = e.target;
    
    // Permitir que sejam inseridos apenas números, sinais de - e .
    if (value && !/^-?\d*\.?\d*$/.test(value)) {
      return;
    }
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMapIframeUrlChange = (e) => {
    const { value } = e.target;
    
    // Armazena o valor como está, sem modificação
    setFormData((prevData) => ({
      ...prevData,
      map_iframe_url: value
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{city ? "Editar Cidade" : "Adicionar Nova Cidade"}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium">
                Nome da Cidade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Ex: Florianópolis"
              />
            </div>

            <div>
              <Label htmlFor="state" className="text-base font-medium">
                Estado
              </Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1"
                placeholder="Santa Catarina"
              />
            </div>
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="description" className="text-base font-medium">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={5}
              placeholder="Descrição detalhada da cidade"
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="gastronomy" className="text-base font-medium">Gastronomia</Label>
            <Textarea
              id="gastronomy"
              name="gastronomy"
              value={formData.gastronomy || ""}
              onChange={handleInputChange}
              rows={3}
              placeholder="Descrição da gastronomia local"
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="accommodation_types" className="text-base font-medium">Tipos de Hospedagem</Label>
            <Textarea
              id="accommodation_types"
              name="accommodation_types"
              value={formData.accommodation_types || ""}
              onChange={handleInputChange}
              rows={3}
              placeholder="Tipos de acomodação disponíveis (hotéis, pousadas, etc.)"
              className="w-full mt-1"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="culinary_origin" className="text-base font-medium">
                Origem Culinária
              </Label>
              <Input
                id="culinary_origin"
                name="culinary_origin"
                value={formData.culinary_origin}
                onChange={handleChange}
                className="mt-1"
                placeholder="Ex: Açoriana, Italiana..."
              />
            </div>

            <div>
              <Label htmlFor="city_hall_phone" className="text-base font-medium">
                Telefone da Prefeitura
              </Label>
              <Input
                id="city_hall_phone"
                name="city_hall_phone"
                value={formData.city_hall_phone}
                onChange={handleChange}
                className="mt-1"
                placeholder="Ex: (48) 3000-0000"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="population" className="text-base font-medium">
                População
              </Label>
              <Input
                id="population"
                name="population"
                value={formData.population}
                onChange={handleNumberChange}
                className="mt-1"
                placeholder="Ex: 500000"
              />
            </div>

            <div>
              <Label htmlFor="beaches_count" className="text-base font-medium">
                Quantidade de Praias
              </Label>
              <Input
                id="beaches_count"
                name="beaches_count"
                value={formData.beaches_count}
                onChange={handleNumberChange}
                className="mt-1"
                placeholder="Ex: 42"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="latitude" className="text-base font-medium">Latitude</Label>
            <Input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude || ""}
              onChange={handleLatLongChange}
              placeholder="-27.5419"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formato decimal (ex: -27.5419)
            </p>
          </div>
          
          <div>
            <Label htmlFor="longitude" className="text-base font-medium">Longitude</Label>
            <Input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude || ""}
              onChange={handleLatLongChange}
              placeholder="-48.5019"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formato decimal (ex: -48.5019)
            </p>
          </div>

          <div className="col-span-2">
            <Label htmlFor="map_iframe_url" className="text-base font-medium">URL do Mapa (iframe)</Label>
            <Textarea
              id="map_iframe_url"
              name="map_iframe_url"
              value={formData.map_iframe_url || ""}
              onChange={handleMapIframeUrlChange}
              placeholder="Cole aqui o iframe completo do Google Maps ou apenas a URL"
              rows={3}
              className="w-full mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Você pode colar tanto o código iframe completo 
              (<code>&lt;iframe src="..."&gt;&lt;/iframe&gt;</code>) quanto apenas a URL. 
              Este campo tem prioridade sobre latitude e longitude.
            </p>
          </div>

          <div>
            <Label htmlFor="image" className="text-base font-medium">
              Imagem Principal
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-1">
              <div className="md:col-span-1">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md transition-colors w-full h-10"
                >
                  <span>Carregar Imagem</span>
                  <input
                    type="file"
                    id="image-upload"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="md:col-span-3">
                <Input
                  id="image"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="URL da imagem"
                  className="h-10"
                />
              </div>
            </div>
            {previewUrl && (
              <div className="mt-4 relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-60 object-cover rounded-md"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
