
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin, Bed, Bath, Car, Square, Building2, Heart, ImageIcon, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/components/analytics/utils';

export default function PropertyCard({ property, realtor, categoryName, cityName, isFavorite, onToggleFavorite, isInCompareList, onToggleCompare }) {
  if (!property) return null;

  const formatPrice = (price) => {
    if (!price) return "Preço sob consulta";
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const propertyTypeLabels = {
    sale: "Venda",
    rent: "Aluguel",
    temporary: "Temporada"
  };
  
  const propertyTypeColors = {
    sale: "bg-blue-600",
    rent: "bg-purple-600",
    temporary: "bg-teal-600"
  };

  // Determine if it's a new property (less than 7 days old)
  const isNew = new Date() - new Date(property.created_date) < 7 * 24 * 60 * 60 * 1000;
  
  // Count images
  const imagesCount = (property.images?.length || 0) + (property.main_image_url ? 1 : 0);
  
  // Track click on property card
  const handleCardClick = () => {
    trackEvent('item_click', {
      item_id: property.id,
      item_name: property.title,
      item_category: 'property'
    });
  };

  return (
    <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)} className="block hover:no-underline group" onClick={handleCardClick}>
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200 hover:border-blue-400 group">
        <div className="relative aspect-[4/3] overflow-hidden">
          {property.main_image_url ? (
            <img
              src={property.main_image_url}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Home className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className={`${propertyTypeColors[property.property_type] || 'bg-gray-600'} text-white shadow px-3 py-1 text-sm font-bold`}>
              {propertyTypeLabels[property.property_type] || property.property_type}
            </Badge>
            {property.featured && <Badge className="bg-orange-500 text-white shadow">Destaque</Badge>}
            {isNew && <Badge className="bg-green-600 text-white shadow">Novo</Badge>}
          </div>
          
          {/* Gallery badge */}
          {imagesCount > 0 && (
            <Badge className="absolute top-3 right-3 bg-black bg-opacity-70 text-white flex items-center gap-1 py-1.5 px-2.5">
              <ImageIcon className="h-4 w-4" /> {imagesCount}
            </Badge>
          )}
          
          {realtor?.logo_url && (
            <div className="absolute bottom-3 right-3 bg-white p-1.5 rounded-full shadow-lg w-12 h-12 flex items-center justify-center">
                <img src={realtor.logo_url} alt={realtor.company_name} className="max-w-full max-h-full object-contain rounded-full" />
            </div>
          )}
          
          {/* Favorite Button */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute top-12 right-3 bg-white/80 hover:bg-white border-gray-300 ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          
          {/* Compare Button */}
          {onToggleCompare && (
            <Button
              variant="outline"
              size="icon"
              className={`absolute top-24 right-3 bg-white/80 hover:bg-white border-gray-300 
                         ${isInCompareList ? 'text-blue-600 border-blue-600' : 'text-gray-600'}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(); }}
              title={isInCompareList ? "Remover da comparação" : "Adicionar para comparação"}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            {categoryName && <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider">{categoryName}</p>}
            <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-700">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{cityName || property.address}</span>
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-blue-700 mb-3">
              {formatPrice(property.price)}
              {property.property_type === 'rent' && <span className="text-sm font-normal text-gray-500 ml-1">/mês</span>}
            </div>

            <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-sm text-gray-600 mb-4">
              {property.area > 0 && (
                <div className="flex items-center" title="Área">
                  <Square className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.area}m²</span>
                </div>
              )}
              {property.bedrooms > 0 && (
                <div className="flex items-center" title="Quartos">
                  <Bed className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center" title="Banheiros">
                  <Bath className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.parking_spots > 0 && (
                <div className="flex items-center" title="Vagas">
                  <Car className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span>{property.parking_spots}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3 mt-3 flex items-center justify-between">
              <div className='flex items-center'>
                {realtor?.logo_url ? (
                  <img src={realtor.logo_url} alt={realtor.company_name} className="w-8 h-8 rounded-full mr-2 object-cover"/>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <Building2 className="w-4 h-4 text-gray-500"/>
                  </div>
                )}
                <span className="text-xs text-gray-500 truncate group-hover:text-gray-700">
                  {realtor?.company_name || "Imobiliária"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
