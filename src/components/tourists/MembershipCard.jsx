
import React from "react";
import { QrCode, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MembershipCard({ 
  user, 
  tourist, 
  subscription, 
  plan, 
  preview, 
  cardFrontDesignUrl,
  cardBackBackgroundUrl,
  cardLogoUrl,
  showQrCodeOnFront = true,
  qrCodeData = null 
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      try {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
      } catch (innerError) {
        return dateString;
      }
    }
  };

  const getCardNumber = () => {
    if (tourist?.user_code) {
      return tourist.user_code;
    } else if (user?.id) {
      return user.id.substring(0, 8).toUpperCase();
    }
    return "DEMO123";
  };

  const cardNumber = getCardNumber();
  const memberName = user?.full_name || (preview ? "Nome do Turista" : "Membro");
  const planName = plan?.name || (preview ? "Plano Padrão" : "Padrão");
  const validityDate = subscription?.end_date ? formatDate(subscription.end_date) : (preview ? "31/12/2025" : "Indefinida");

  const frontCardStyle = cardFrontDesignUrl 
    ? { 
        backgroundImage: `url(${cardFrontDesignUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        background: 'linear-gradient(to bottom right, #007BFF, #005cbf)'
      };

  const backCardStyle = cardBackBackgroundUrl
    ? {
        backgroundImage: `url(${cardBackBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : { backgroundColor: '#FFFFFF' };

  // Garantir que o QR Code no cartão use o user_code diretamente
  const qrCodeContentForCard = qrCodeData || cardNumber;

  return (
    <div className="perspective-1000 w-full">
      <div className="card-container transform-style-3d transition-transform duration-700 w-full h-56 md:h-64">
        {/* Frente do cartão */}
        <div 
          className="absolute inset-0 rounded-xl shadow-xl overflow-hidden p-6 text-white flex flex-col justify-between"
          style={frontCardStyle}
        >
          {/* Cabeçalho - Logo e Título */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {cardLogoUrl ? (
                <img src={cardLogoUrl} alt="Logo" className="h-10 mr-3 object-contain" style={{maxHeight: '40px', filter: 'brightness(0) invert(1)'}} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <span className="text-[#007BFF] font-bold text-xl">SC</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold tracking-wide">TurismoSC Club</h2>
                <p className="text-blue-200 text-xs">Cartão de Membro Oficial</p>
              </div>
            </div>
            
            {showQrCodeOnFront && (
              <div className="w-20 h-20 bg-white rounded-md p-1 flex items-center justify-center shadow">
                {/* A API para gerar QR Code será chamada diretamente no src da img */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeContentForCard)}&size=120x120&margin=0`} 
                  alt="QR Code" 
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
          
          {/* Área do Nome */}
          <div className="mt-3">
            <p className="text-xs uppercase tracking-wider mb-1 opacity-80">Nome do Membro</p>
            <p className="text-lg font-medium tracking-wide truncate">{memberName}</p>
          </div>
          
          {/* Informações na parte inferior */}
          <div className="grid grid-cols-3 gap-x-4 mt-auto">
            <div>
              <p className="text-xs uppercase tracking-wider mb-1 opacity-80">Nº do Cartão</p>
              <p className="font-mono text-sm">{cardNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1 opacity-80">Plano</p>
              <p className="font-medium text-sm">{planName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1 opacity-80">Validade</p>
              <p className="font-medium text-sm">{validityDate}</p>
            </div>
          </div>
          
          {/* Elementos decorativos para o design */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-blue-400 opacity-20"></div>
          <div className="absolute right-10 -top-6 w-20 h-20 rounded-full bg-blue-300 opacity-20"></div>
        </div>
        
        {/* Verso do cartão */}
        <div 
          className="absolute inset-0 rounded-xl shadow-xl overflow-hidden backface-hidden transform-3d rotate-y-180 border border-gray-200"
          style={backCardStyle}
        >
          {!showQrCodeOnFront && (
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold" style={{color: cardBackBackgroundUrl ? '#FFF' : '#333', textShadow: cardBackBackgroundUrl ? '0px 0px 4px rgba(0,0,0,0.8)' : 'none'}}>
                  Cartão de Membro
                </h3>
                
                <Badge 
                  style={{ 
                    backgroundColor: plan?.badge_color || "#007BFF",
                    color: '#FFFFFF',
                    boxShadow: '0px 0px 5px rgba(0,0,0,0.5)'
                  }} 
                  className="text-white"
                >
                  {plan?.discount_percentage || (preview ? 5 : 0)}% de desconto
                </Badge>
              </div>
              
              <div className="flex justify-center items-center flex-grow">
                <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center shadow-md">
                   <img 
                     src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeContentForCard)}&size=120x120&margin=0`} 
                     alt="QR Code" 
                     className="w-full h-full"
                   />
                </div>
              </div>
              
              <div className="text-center" style={{color: cardBackBackgroundUrl ? '#FFF' : '#333', textShadow: cardBackBackgroundUrl ? '0px 0px 4px rgba(0,0,0,0.8)' : 'none'}}>
                <p className="text-xs mb-1">Apresente este QR Code nos estabelecimentos parceiros</p>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-sm font-medium">
                    Ativo até {validityDate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Estilos para efeito 3D */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-3d {
          transform: rotateY(180deg);
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        /* Efeito hover para virar o cartão */
        .card-container:hover {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
