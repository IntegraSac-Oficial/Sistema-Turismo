import React, { useEffect } from "react";
import { trackBannerAnalytics } from "@/api/functions";

export default function CityBanners({ banners = [], placement = "city_detail_sidebar" }) {
  useEffect(() => {
    // Rastrear visualização de todos os banners visíveis
    const trackVisibleBanners = async () => {
      if (!banners || banners.length === 0) return;
      
      banners.forEach(async banner => {
        if (banner.placement === placement) {
          try {
            // Rastrear visualização do banner
            await trackBannerAnalytics({ 
              banner_id: banner.id,
              event_type: "view",
              screen_size: `${window.innerWidth}x${window.innerHeight}`,
              session_id: getOrCreateSessionId(),
              referrer: document.referrer
            });
          } catch (error) {
            console.error("Erro ao rastrear visualização do banner:", error);
          }
        }
      });
    };
    
    trackVisibleBanners();
  }, [banners, placement]);

  // Função para obter ou criar um ID de sessão
  const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem('banner_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('banner_session_id', sessionId);
    }
    return sessionId;
  };

  // Função para rastrear clique no banner
  const handleBannerClick = async (banner) => {
    try {
      await trackBannerAnalytics({ 
        banner_id: banner.id,
        event_type: "click",
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        session_id: getOrCreateSessionId(),
        referrer: document.referrer
      });
      
      // Navegar para o link de destino do banner
      if (banner.link_url) {
        window.open(banner.link_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Erro ao rastrear clique no banner:", error);
      
      // Mesmo que o rastreamento falhe, ainda deve navegar para o destino
      if (banner.link_url) {
        window.open(banner.link_url, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Filtrar banners pelo placement atual
  const filteredBanners = banners.filter(banner => 
    banner.placement === placement && banner.is_active && 
    (!banner.start_date || new Date(banner.start_date) <= new Date()) &&
    (!banner.end_date || new Date(banner.end_date) >= new Date())
  );

  if (filteredBanners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 py-2">
      {filteredBanners.map(banner => (
        <div 
          key={banner.id}
          className="cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden"
          onClick={() => handleBannerClick(banner)}
        >
          <div 
            className="relative"
            style={{
              width: banner.width ? `${banner.width}px` : '100%',
              height: banner.height ? `${banner.height}px` : 'auto',
              maxWidth: '100%'
            }}
          >
            <img 
              src={banner.image_url} 
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 px-1">
            {banner.title}
          </div>
        </div>
      ))}
    </div>
  );
}