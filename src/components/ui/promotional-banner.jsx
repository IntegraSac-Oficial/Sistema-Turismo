import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Link2 } from "lucide-react";
import { PromotionalBanner } from "@/api/entities";
import PreviewBanner from "@/components/banners/PreviewBanner";

export default function PromotionalBannerDisplay({ 
  location = "home_top", 
  maxBanners = 1, 
  className = "",
  onClose = null
}) {
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [closed, setClosed] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    loadBanners();
    
    // Verificar se é dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [location]);
  
  useEffect(() => {
    // Alternar entre banners a cada 8 segundos se houver mais de um
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 8000);
      
      return () => clearInterval(interval);
    }
  }, [banners]);
  
  const loadBanners = async () => {
    try {
      const today = new Date();
      let allBanners = await PromotionalBanner.list("-priority");
      
      // Filtrar por:
      // 1. Localização (específica ou "all")
      // 2. Status ativo
      // 3. Dentro do período de exibição
      // 4. Não está fechado pelo usuário
      const filteredBanners = allBanners
        .filter(banner => 
          (banner.location === location || banner.location === "all") &&
          banner.active &&
          new Date(banner.start_date) <= today &&
          new Date(banner.end_date) >= today &&
          !closed.includes(banner.id)
        )
        // Limitar ao número máximo de banners
        .slice(0, maxBanners);
      
      setBanners(filteredBanners);
    } catch (error) {
      console.error("Erro ao carregar banners promocionais:", error);
    }
  };
  
  const closeBanner = (bannerId) => {
    setClosed(prev => [...prev, bannerId]);
    if (onClose) onClose(bannerId);
  };
  
  // Se não houver banners ou todos foram fechados, não renderizar nada
  if (banners.length === 0) {
    return null;
  }
  
  const currentBanner = banners[currentBannerIndex];
  
  return (
    <div className={`${className} relative`}>
      <PreviewBanner 
        banner={currentBanner} 
        type={isMobile ? "mobile" : "desktop"} 
      />
      
      {/* Botão de fechar */}
      <button
        onClick={() => closeBanner(currentBanner.id)}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-800/20 hover:bg-gray-800/40 text-white"
        aria-label="Fechar banner"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Indicadores para vários banners */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {banners.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                currentBannerIndex === index 
                  ? 'bg-white' 
                  : 'bg-white/40'
              }`}
              onClick={() => setCurrentBannerIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}