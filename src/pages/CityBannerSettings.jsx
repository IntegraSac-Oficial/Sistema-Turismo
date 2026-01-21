
import React, { useState, useEffect, useCallback } from "react";
import { CityBanner } from "@/api/entities";
import { City } from "@/api/entities";
import { BannerCategory } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, List, BarChart3 } from "lucide-react"; // Adicionado BarChart3
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";
import CityBannerForm from "@/components/banners/CityBannerForm";
import { useNavigate } from "react-router-dom"; // Adicionado useNavigate
import { createPageUrl } from "@/utils"; // Adicionado createPageUrl
import { CalendarIcon, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function CityBannerSettings() {
  const [banners, setBanners] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const navigate = useNavigate(); // Inicializar useNavigate

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bannersData, citiesData, categoriesData] = await Promise.all([
        CityBanner.list("-created_at"),
        City.list(),
        BannerCategory.list()
      ]);
      setBanners(bannersData || []);
      setCities(citiesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os banners, cidades ou categorias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedBanner(null);
    fetchData(); // Recarregar os banners
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setShowFormModal(true);
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm("Tem certeza que deseja excluir este banner?")) {
      try {
        await CityBanner.delete(bannerId);
        toast({
          title: "Banner Excluído",
          description: "O banner foi removido com sucesso.",
        });
        fetchData();
      } catch (error) {
        console.error("Erro ao excluir banner:", error);
        toast({
          title: "Erro ao Excluir",
          description: "Não foi possível remover o banner.",
          variant: "destructive",
        });
      }
    }
  };
  
  const getCityName = (cityId) => cities.find(c => c.id === cityId)?.name || "N/A";
  const getCategoryName = (categoryId) => categories.find(cat => cat.id === categoryId)?.name || "N/A";

  const placementLabels = {
    "city_detail_top": "Topo da Cidade",
    "city_detail_sidebar": "Lateral da Cidade",
    "city_detail_bottom": "Rodapé da Cidade",
    "beach_detail_sidebar": "Lateral da Praia",
    "general_sidebar": "Lateral Geral"
  };
  
  const getPlacementLabel = (placementValue) => placementLabels[placementValue] || placementValue;


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Banners de Cidades</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => navigate(createPageUrl("BannerAnalytics"))} // Adicionado onClick para navegar
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Analytics
          </Button>
          <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setSelectedBanner(null);
                  setShowFormModal(true);
                }}
                className="flex-1 sm:flex-none"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Novo Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{selectedBanner ? "Editar Banner" : "Adicionar Novo Banner"}</DialogTitle>
              </DialogHeader>
              <CityBannerForm
                cities={cities}
                categories={categories}
                banner={selectedBanner}
                onSuccess={handleFormSuccess}
                onCancel={() => { setShowFormModal(false); setSelectedBanner(null); }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {banners.length === 0 ? (
        <Card className="text-center py-10">
          <CardHeader>
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <CardTitle className="mt-2">Nenhum banner encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Comece adicionando um novo banner para promover atrações ou serviços nas cidades.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Card do Banner */}
                  {banners.map((banner) => (
                    <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                    <CardHeader className="p-0 relative">
                      {banner.image_url ? (
                        <img 
                          src={banner.image_url} 
                          alt={banner.title} 
                          className="w-full h-40 object-cover" 
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                       <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${banner.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                        {banner.is_active ? "Ativo" : "Inativo"}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <CardTitle className="text-lg mb-1 truncate">{banner.title}</CardTitle>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <List className="w-4 h-4 mr-2 text-gray-400" />
                          Categoria: {categories.find(c => c.id === banner.category_id)?.name || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          Cidade: {cities.find(c => c.id === banner.city_id)?.name || "N/A"}
                        </div>
                        {banner.link_url && banner.link_url !== "#" && (
                          <div className="flex items-center">
                            <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {banner.link_url}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center">
                          <ImageIcon className="w-4 h-4 mr-2 text-gray-400" /> {/* Usando ImageIcon para "Alcance" */}
                          Alcance: {banner.placement ? banner.placement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "N/A"}
                        </div>
                        {(banner.start_date || banner.end_date) && (
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {banner.start_date ? `Início: ${format(parseISO(banner.start_date), 'dd/MM/yy')}` : ''}
                            {banner.start_date && banner.end_date ? ' - ' : ''}
                            {banner.end_date ? `Fim: ${format(parseISO(banner.end_date), 'dd/MM/yy')}` : ''}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 border-t bg-gray-50 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBanner(banner);
                          setShowFormModal(true);
                        }}
                      >
                        <Edit className="mr-1 h-3 w-3" /> Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Excluir
                      </Button>
                    </CardFooter>
                  </Card>
                  ))}
                </div>
      )}
    </div>
  );
}
