import React from 'react';
import { X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function PropertyMapPopup({ property, onClose }) {
  const navigate = useNavigate();

  if (!property) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="absolute z-[1000] bg-white rounded-lg shadow-lg overflow-hidden" style={{
      width: '280px',
      right: '10px',
      bottom: '10px'
    }}>
      {/* Imagem */}
      <div className="relative h-36">
        <img
          src={property.main_image_url || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onClose}
          className="absolute right-2 top-2 bg-white/90 rounded-full p-1 hover:bg-white transition-colors"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-3">
        {/* Título */}
        <h3 className="font-medium text-base mb-1">{property.title}</h3>
        
        {/* Localização */}
        <p className="text-sm text-gray-500 flex items-center mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {property.neighborhood}, {property.city_name}
        </p>

        {/* Características */}
        <div className="grid grid-cols-3 gap-2 text-center mb-2">
          <div className="bg-gray-50 rounded p-1">
            <p className="text-sm font-medium">{property.area}m²</p>
            <p className="text-xs text-gray-500">Área</p>
          </div>
          <div className="bg-gray-50 rounded p-1">
            <p className="text-sm font-medium">{property.bedrooms}</p>
            <p className="text-xs text-gray-500">Quartos</p>
          </div>
          <div className="bg-gray-50 rounded p-1">
            <p className="text-sm font-medium">{property.bathrooms}</p>
            <p className="text-xs text-gray-500">Banheiros</p>
          </div>
        </div>

        {/* Preço e botão */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-lg font-bold text-blue-600">
              {formatPrice(property.price)}
            </p>
            <p className="text-xs text-gray-500">{property.realtor_name}</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl(`PropertyDetail?id=${property.id}`))}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
}