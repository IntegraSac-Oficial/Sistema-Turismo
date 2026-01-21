import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Property } from '@/api/entities';
import { City } from '@/api/entities';
import { PropertyCategory } from '@/api/entities';
import { Realtor } from '@/api/entities';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Square, 
  DollarSign, 
  Building2,
  ArrowLeft,
  Printer,
  Share2,
  Star,
  CheckCircle,
  XCircle,
  ImageIcon
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from "@/components/ui/use-toast";

export default function CompareProperties() {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPropertiesToCompare = async () => {
      setIsLoading(true);
      const params = new URLSearchParams(location.search);
      const idsString = params.get('ids');
      if (!idsString) {
        setProperties([]);
        setIsLoading(false);
        toast({
          title: "Nenhum imóvel selecionado",
          description: "Selecione imóveis para comparar.",
          variant: "warning"
        });
        return;
      }

      const propertyIds = idsString.split(',');

      try {
        const [allProps, citiesData, categoriesData, realtorsData] = await Promise.all([
          Property.list(),
          City.list(),
          PropertyCategory.list(),
          Realtor.list()
        ]);

        const propsToCompare = allProps.filter(p => propertyIds.includes(p.id));
        setProperties(propsToCompare);
        setCities(citiesData || []);
        setCategories(categoriesData || []);
        setRealtors(realtorsData || []);

      } catch (error) {
        console.error("Erro ao carregar dados para comparação:", error);
        toast({
          title: "Erro ao carregar imóveis",
          description: "Não foi possível carregar os imóveis para comparação.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertiesToCompare();
  }, [location.search]);

  const getCityName = (cityId) => cities.find(c => c.id === cityId)?.name || 'N/A';
  const getCategoryName = (catId) => categories.find(c => c.id === catId)?.name || 'N/A';
  const getRealtor = (realtorId) => realtors.find(r => r.id === realtorId);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "N/A";
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };
  
  const renderAmenity = (hasAmenity) => {
    return hasAmenity ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };
  
  const allAmenities = [
    { key: "pool", label: "Piscina" },
    { key: "gym", label: "Academia" },
    { key: "barbecue", label: "Churrasqueira" },
    { key: "playground", label: "Playground" },
    { key: "security", label: "Segurança" },
    { key: "elevator", label: "Elevador" },
    { key: "furnished", label: "Mobiliado" },
    { key: "balcony", label: "Sacada" },
    { key: "laundry", label: "Lavanderia" },
    { key: "party_room", label: "Salão de Festas" },
    { key: "pet_friendly", label: "Aceita Pets" },
    { key: "ocean_view", label: "Vista para o Mar" },
    { key: "air_conditioning", label: "Ar Condicionado" },
    { key: "wifi", label: "Wi-Fi" },
    { key: "kitchen", label: "Cozinha" },
    { key: "private_pool", label: "Piscina Privativa" },
    { key: "workspace", label: "Espaço de Trabalho" },
    { key: "garden", label: "Jardim" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!properties.length) {
    return (
      <>
        <PublicHeader />
        <div className="container mx-auto py-12 px-4 text-center">
          <Home className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Comparar Imóveis</h1>
          <p className="text-gray-600 mb-6">
            Nenhum imóvel foi selecionado para comparação.
          </p>
          <Button asChild>
            <Link to={createPageUrl("PublicProperties")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a busca
            </Link>
          </Button>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Define as características que serão comparadas
  const comparisonFeatures = [
    { label: 'Preço', getValue: p => formatPrice(p.price), icon: DollarSign },
    { label: 'Tipo', getValue: p => p.property_type === 'sale' ? 'Venda' : p.property_type === 'rent' ? 'Aluguel' : 'Temporada', icon: Home },
    { label: 'Categoria', getValue: p => getCategoryName(p.category_id), icon: Building2 },
    { label: 'Cidade', getValue: p => getCityName(p.city_id), icon: MapPin },
    { label: 'Bairro', getValue: p => p.neighborhood || 'N/A', icon: MapPin },
    { label: 'Área (m²)', getValue: p => p.area || 'N/A', icon: Square },
    { label: 'Quartos', getValue: p => p.bedrooms || 'N/A', icon: Bed },
    { label: 'Suítes', getValue: p => p.suites || 'N/A', icon: Bed },
    { label: 'Banheiros', getValue: p => p.bathrooms || 'N/A', icon: Bath },
    { label: 'Vagas', getValue: p => p.parking_spots || 'N/A', icon: Car },
    { label: 'Condomínio', getValue: p => formatPrice(p.condo_fee), icon: DollarSign },
    { label: 'IPTU', getValue: p => formatPrice(p.iptu), icon: DollarSign },
    { label: 'Destaque?', getValue: p => p.is_featured ? <CheckCircle className="text-green-500 h-5 w-5"/> : <XCircle className="text-red-500 h-5 w-5"/>, icon: Star },
  ];

  const handlePrint = () => window.print();
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comparação de Imóveis - Praias Catarinenses',
          text: `Confira esta comparação de imóveis: ${properties.map(p => p.title).join(', ')}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        toast({ title: "Erro ao compartilhar", description: "Não foi possível compartilhar a comparação.", variant: "destructive"});
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!", description: "O link da comparação foi copiado para a área de transferência."});
    }
  };


  return (
    <>
      <PublicHeader />
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <Button variant="outline" asChild className="mb-2 sm:mb-0">
              <Link to={createPageUrl("PublicProperties")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a busca
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Comparar Imóveis</h1>
            <p className="text-gray-600">Compare lado a lado os imóveis selecionados.</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
            <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Compartilhar</Button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="min-w-full bg-white border border-gray-200">
            {/* Cabeçalho com Imagens e Títulos */}
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-semibold text-gray-700 min-w-[200px] sticky left-0 bg-gray-50 z-10">Característica</th>
                {properties.map(property => (
                  <th key={property.id} className="p-3 border-l min-w-[250px] max-w-[300px]">
                    <Card className="shadow-none border-0">
                      <CardContent className="p-0">
                        <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)} className="block">
                          <div className="relative aspect-video mb-2 rounded overflow-hidden">
                            {property.main_image_url ? (
                              <img src={property.main_image_url} alt={property.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="w-10 h-10 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm hover:text-blue-600 line-clamp-2">
                            {property.title}
                          </h3>
                        </Link>
                      </CardContent>
                    </Card>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature) => (
                <tr key={feature.label} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-600 sticky left-0 bg-white z-10">
                    <div className="flex items-center">
                      {feature.icon && <feature.icon className="w-4 h-4 mr-2 text-gray-400" />}
                      {feature.label}
                    </div>
                  </td>
                  {properties.map(property => (
                    <td key={property.id} className="p-3 border-l text-gray-700 text-sm">
                      {feature.getValue(property)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Comodidades */}
              <tr className="bg-gray-100">
                <td colSpan={properties.length + 1} className="p-3 font-semibold text-gray-800 sticky left-0 z-10">Comodidades</td>
              </tr>
              {allAmenities.map(amenity => (
                 <tr key={amenity.key} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-600 sticky left-0 bg-white z-10">{amenity.label}</td>
                    {properties.map(property => (
                        <td key={property.id} className="p-3 border-l text-center">
                            {renderAmenity(property.amenities?.includes(amenity.key))}
                        </td>
                    ))}
                 </tr>
              ))}
            </tbody>
             {/* Rodapé com botões */}
             <tfoot>
                <tr className="border-t">
                    <td className="p-3 sticky left-0 bg-gray-50 z-10"></td>
                    {properties.map(property => (
                        <td key={property.id} className="p-3 border-l text-center">
                            <Button size="sm" asChild>
                                <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)}>
                                    Ver Imóvel
                                </Link>
                            </Button>
                        </td>
                    ))}
                </tr>
             </tfoot>
          </table>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}