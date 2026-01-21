
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader2, X, Home, Building2, ArrowRight, ImageIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/components/ui/utils';

export function PropertyMap({ 
  properties = [], 
  cities = [], 
  categories = [], 
  realtors = [],
  onRegionSearch,
  className,
  mapHeight = '600px'
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  
  // Carregar o mapa quando o componente for montado
  useEffect(() => {
    let isMounted = true;
    const scriptId = 'leaflet-script';
    const cssId = 'leaflet-css';
    
    const loadLeaflet = async () => {
      try {
        // Evitar carregamentos duplicados
        if (document.getElementById(scriptId)) {
          return initializeMap();
        }
        
        // Adicionar CSS do Leaflet
        if (!document.getElementById(cssId)) {
          const link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        
        // Adicionar script do Leaflet
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        script.onload = () => {
          if (isMounted) {
            console.log("Leaflet carregado com sucesso");
            initializeMap();
          }
        };
        
        script.onerror = (error) => {
          if (isMounted) {
            console.error("Erro ao carregar Leaflet:", error);
            setMapError("Não foi possível carregar o mapa. Por favor, recarregue a página.");
            setIsLoading(false);
          }
        };
        
        document.body.appendChild(script);
      } catch (error) {
        if (isMounted) {
          console.error("Erro ao configurar Leaflet:", error);
          setMapError("Ocorreu um erro ao configurar o mapa.");
          setIsLoading(false);
        }
      }
    };
    
    const initializeMap = () => {
      try {
        if (!window.L || !mapRef.current || mapInstanceRef.current) {
          return;
        }
        
        // Criar instância do mapa
        const map = window.L.map(mapRef.current, {
          center: [-27.5969, -48.5495], // Santa Catarina
          zoom: 8,
          zoomControl: true,
          scrollWheelZoom: true,
        });
        
        // Adicionar camada de tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);
        
        // Salvar referência
        mapInstanceRef.current = map;
        
        // Configurar eventos
        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);
        
        // Adicionar marcadores
        if (properties.length > 0) {
          addMarkers();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao inicializar mapa:", error);
        setMapError("Erro ao inicializar o mapa.");
        setIsLoading(false);
      }
    };
    
    loadLeaflet();
    
    // Limpeza
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('mousedown', handleMouseDown);
        mapInstanceRef.current.off('mousemove', handleMouseMove);
        mapInstanceRef.current.off('mouseup', handleMouseUp);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Atualizar marcadores quando as propriedades mudam
  useEffect(() => {
    if (mapInstanceRef.current && properties.length > 0) {
      addMarkers();
    }
  }, [properties]);
  
  // Atualizar a função addMarkers
  const addMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;
    
    try {
      // Limpar marcadores existentes
      Object.values(markersRef.current).forEach(marker => {
        if (marker) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      markersRef.current = {};
      
      const bounds = window.L.latLngBounds();
      let hasValidCoordinates = false;
      
      properties.forEach(property => {
        if (!property.latitude || !property.longitude) return;
        
        hasValidCoordinates = true;
        const position = [property.latitude, property.longitude];
        bounds.extend(position);
        
        // Criar HTML para o pin simplificado
        const markerHtml = `
          <div class="map-pin ${property.is_featured ? 'featured' : ''}">
            <div class="pin-content">
              <span class="pin-price">${formatPrice(property.price)}</span>
            </div>
          </div>
        `;
        
        const icon = window.L.divIcon({
          html: markerHtml,
          className: 'custom-pin-container',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });
        
        const marker = window.L.marker(position, { icon })
          .addTo(mapInstanceRef.current)
          .on('click', () => setSelectedProperty(property));
        
        markersRef.current[property.id] = marker;
      });
      
      if (hasValidCoordinates) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15
        });
        
        addCustomStyles();
      }
    } catch (error) {
      console.error("Erro ao adicionar marcadores:", error);
    }
  };

  const addCustomStyles = () => {
    if (document.getElementById('custom-map-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'custom-map-styles';
    style.innerHTML = `
      .custom-pin-container {
        width: 40px !important;
        height: 40px !important;
      }
      
      .map-pin {
        width: 32px;
        height: 32px;
        background: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid #3b82f6;
        position: relative;
        transition: all 0.2s ease;
      }
      
      .map-pin:hover {
        transform: scale(1.1);
      }
      
      .map-pin.featured {
        border-color: #f59e0b;
      }
      
      .map-pin:after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #3b82f6;
      }
      
      .map-pin.featured:after {
        border-top-color: #f59e0b;
      }
      
      .pin-content {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .pin-price {
        font-size: 10px;
        font-weight: bold;
        color: #3b82f6;
        white-space: nowrap;
      }
      
      /* Estilos para o popup de propriedade */
      .property-popup {
        position: absolute;
        bottom: 20px;
        left: 20px;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        overflow: hidden;
        animation: slideIn 0.3s ease;
        z-index: 1000;
      }
      
      @keyframes slideIn {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .property-popup-header {
        position: relative;
        height: 200px;
        overflow: hidden;
      }
      
      .property-popup-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .property-popup-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255,255,255,0.9);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }
      
      .property-popup-close:hover {
        background: white;
        transform: scale(1.1);
      }
      
      .property-popup-content {
        padding: 16px;
      }
      
      .property-popup-title {
        font-size: 18px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      .property-popup-address {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .property-popup-features {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .property-popup-feature {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      
      .feature-value {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .feature-label {
        font-size: 12px;
        color: #6b7280;
      }
      
      .property-popup-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }
      
      .property-popup-price {
        font-size: 20px;
        font-weight: bold;
        color: #3b82f6;
      }
      
      .property-popup-realtor {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
      }
      
      .realtor-logo {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .realtor-info {
        font-size: 12px;
        color: #6b7280;
      }
    `;
    
    document.head.appendChild(style);
  };
  
  // Handler para desenho de seleção de região
  const handleMouseDown = (e) => {
    if (!isDrawingBox) return;
    setStartPoint(e.latlng);
  };
  
  const handleMouseMove = (e) => {
    if (!isDrawingBox || !startPoint || !mapInstanceRef.current || !window.L) return;
    
    // Remover retângulo anterior
    if (mapInstanceRef.current._rectangle) {
      mapInstanceRef.current.removeLayer(mapInstanceRef.current._rectangle);
    }
    
    // Desenhar novo retângulo
    const bounds = window.L.latLngBounds(startPoint, e.latlng);
    mapInstanceRef.current._rectangle = window.L.rectangle(bounds, {
      color: '#3b82f6',
      weight: 2,
      fillOpacity: 0.2
    }).addTo(mapInstanceRef.current);
  };
  
  const handleMouseUp = (e) => {
    if (!isDrawingBox || !startPoint || !mapInstanceRef.current) return;
    
    const endPoint = e.latlng;
    const bounds = {
      north: Math.max(startPoint.lat, endPoint.lat),
      south: Math.min(startPoint.lat, endPoint.lat),
      east: Math.max(startPoint.lng, endPoint.lng),
      west: Math.min(startPoint.lng, endPoint.lng),
    };
    
    // Chamar função de busca por região
    if (onRegionSearch) {
      onRegionSearch(bounds);
    }
    
    setIsDrawingBox(false);
    setStartPoint(null);
    
    // Remover o retângulo após a seleção
    setTimeout(() => {
      if (mapInstanceRef.current && mapInstanceRef.current._rectangle) {
        mapInstanceRef.current.removeLayer(mapInstanceRef.current._rectangle);
        delete mapInstanceRef.current._rectangle;
      }
    }, 500);
  };
  
  const formatPrice = (price) => {
    if (!price) return "Consulte";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "";
  };

  const getCityName = (cityId) => {
    const city = cities.find(city => city.id === cityId);
    return city?.name || "";
  };

  // Atualizar o componente de popup da propriedade
  const PropertyPopup = ({ property, onClose }) => {
    const realtor = realtors.find(r => r.id === property.realtor_id);
    const category = categories.find(c => c.id === property.category_id);
    const city = cities.find(c => c.id === property.city_id);

    return (
      <div className="property-popup">
        <div className="property-popup-header">
          {property.main_image_url ? (
            <img
              src={property.main_image_url}
              alt={property.title}
              className="property-popup-image"
            />
          ) : (
            <div className="property-popup-image-placeholder">
              <Home className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="property-popup-close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute top-3 left-3">
            <Badge className={
              property.property_type === "rent"
                ? "bg-purple-600"
                : property.property_type === "sale"
                ? "bg-blue-600"
                : "bg-teal-600"
            }>
              {property.property_type === "rent"
                ? "Aluguel"
                : property.property_type === "sale"
                ? "Venda"
                : "Temporada"}
            </Badge>
          </div>
        </div>
        
        <div className="property-popup-content">
          <h3 className="property-popup-title">{property.title}</h3>
          
          <div className="property-popup-address">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>
              {property.neighborhood ? `${property.neighborhood}, ` : ''}
              {city?.name || ''}
            </span>
          </div>
          
          <div className="property-popup-features">
            {property.area > 0 && (
              <div className="property-popup-feature">
                <span className="feature-value">{property.area}m²</span>
                <span className="feature-label">Área</span>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div className="property-popup-feature">
                <span className="feature-value">{property.bedrooms}</span>
                <span className="feature-label">Quartos</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="property-popup-feature">
                <span className="feature-value">{property.bathrooms}</span>
                <span className="feature-label">Banheiros</span>
              </div>
            )}
          </div>
          
          <div className="property-popup-footer">
            <div>
              <div className="property-popup-price">
                {formatPrice(property.price)}
                {property.property_type === 'rent' && (
                  <span className="text-sm font-normal text-gray-500 ml-1">/mês</span>
                )}
              </div>
              {realtor && (
                <div className="property-popup-realtor">
                  {realtor.logo_url && (
                    <img
                      src={realtor.logo_url}
                      alt={realtor.company_name}
                      className="realtor-logo"
                    />
                  )}
                  <span className="realtor-info">{realtor.company_name}</span>
                </div>
              )}
            </div>
            
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              asChild
            >
              <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)}>
                Ver detalhes
                <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Renderização condicional
  if (mapError) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: mapHeight }}>
        <div className="text-center p-6">
          <div className="text-amber-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h3 className="text-lg font-medium">Não foi possível carregar o mapa</h3>
          <p className="text-gray-600 mt-2 mb-4">{mapError}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('relative', className, 'rounded-lg overflow-hidden')} style={{ height: mapHeight }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Carregando mapa...</p>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {isDrawingBox ? (
          <Button 
            variant="destructive" 
            size="sm"
            className="gap-1"
            onClick={() => {
              setIsDrawingBox(false);
              setStartPoint(null);
              if (mapInstanceRef.current && mapInstanceRef.current._rectangle) {
                mapInstanceRef.current.removeLayer(mapInstanceRef.current._rectangle);
                delete mapInstanceRef.current._rectangle;
              }
            }}
          >
            <X className="h-4 w-4" />
            Cancelar seleção
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 gap-1"
            onClick={() => setIsDrawingBox(true)}
          >
            <Search className="h-4 w-4" />
            Buscar nesta região
          </Button>
        )}
      </div>
      
      {isDrawingBox && (
        <div className="absolute top-16 right-4 left-4 bg-amber-50 border border-amber-200 p-3 rounded-md z-10 text-sm text-amber-800">
          <p className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-amber-600" />
            Clique e arraste para selecionar uma área no mapa
          </p>
        </div>
      )}
      
      <div ref={mapRef} className="h-full w-full" />
      
      {selectedProperty && (
        <PropertyPopup property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  );
}

// Estes componentes são referenciados no arquivo mas não definidos
// Vamos adicioná-los para que não haja erros
function Square(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

function Bed(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 4v16" />
      <path d="M22 4v16" />
      <path d="M2 8h20" />
      <path d="M2 16h20" />
      <path d="M12 4v4" />
      <path d="M12 16v4" />
    </svg>
  );
}

function Bath(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" x2="10" y1="5" y2="19" />
      <line x1="14" x2="14" y1="9" y2="19" />
      <line x1="18" x2="18" y1="13" y2="19" />
      <line x1="6" x2="6" y1="12" y2="19" />
    </svg>
  );
}

function RefreshCw(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 5l5 0 0 5" />
      <path d="M8 19l0 5-5 0" />
    </svg>
  );
}
