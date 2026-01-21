import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PreviewBanner({ bannerConfig }) {
  if (!bannerConfig) return null;
  
  // Verificar se a cor é clara para usar texto escuro sobre ela
  const isLightColor = (hexColor) => {
    if (!hexColor || hexColor === 'transparent') return false;
    
    // Remove o # se existir
    hexColor = hexColor.replace('#', '');
    
    // Se a cor não for hexadecimal válida, retorna false
    if (!/^[0-9A-F]{6}$/i.test(hexColor)) return false;
    
    // Converte para RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calcula a luminosidade
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retorna true se a cor for clara (luminosidade > 0.5)
    return luminance > 0.5;
  };

  // Estilo do background
  const bgStyle = bannerConfig.tipo_fundo === 'imagem' && bannerConfig.imagem_fundo
    ? { backgroundImage: `url(${bannerConfig.imagem_fundo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: bannerConfig.cor_fundo || '#007BFF' };

  // Determinar a cor do texto baseada no fundo
  const textColor = bannerConfig.tipo_fundo === 'cor' && isLightColor(bannerConfig.cor_fundo) 
    ? 'text-gray-900' 
    : 'text-white';

  // Estilo para o botão primário com hover simulado
  const primaryButtonStyle = {
    backgroundColor: bannerConfig.botao_primario?.cor_fundo || '#ffffff',
    color: bannerConfig.botao_primario?.cor_texto || '#007BFF',
  };

  // Estilo para o botão secundário com hover simulado
  const secondaryButtonStyle = {
    backgroundColor: bannerConfig.botao_secundario?.cor_fundo || 'transparent',
    color: bannerConfig.botao_secundario?.cor_texto || '#ffffff',
    borderColor: bannerConfig.botao_secundario?.cor_borda || '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid'
  };

  return (
    <div 
      className="rounded-lg overflow-hidden shadow-md"
      style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}
    >
      <div 
        className="py-8 px-4 flex flex-col items-center"
        style={bgStyle}
      >
        <div className={`text-center ${textColor}`}>
          <h3 className="text-xl font-bold mb-2">
            {bannerConfig.titulo || "Descubra o Paraíso Catarinense"}
          </h3>
          <p className="text-sm mb-4 max-w-[240px]">
            {bannerConfig.subtitulo || "O guia completo das melhores praias e serviços de SC"}
          </p>
          <div className="flex flex-col gap-2">
            <button 
              className="px-4 py-2 rounded text-sm font-medium"
              style={primaryButtonStyle}
            >
              {bannerConfig.botao_primario?.texto || "Criar Conta Gratuita"}
            </button>
            <button 
              className="px-4 py-2 rounded text-sm font-medium"
              style={secondaryButtonStyle}
            >
              {bannerConfig.botao_secundario?.texto || "Ver o melhor Plano"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}