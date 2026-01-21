import React, { useState, useEffect } from "react";
import { BenefitClubConfig } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BenefitClubBanner() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const configs = await BenefitClubConfig.list();
        if (configs && configs.length > 0) {
          setConfig(configs[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar configuração do clube:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 p-8 rounded-lg flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!config || !config.is_active) {
    return null;
  }

  // Estilo para a posição e tamanho do cartão
  const cardStyle = {
    transform: `
      translate(${config.card_position_x || 0}px, ${config.card_position_y || 0}px) 
      scale(${config.card_scale || 1}) 
      rotate(${config.card_rotation || 0}deg)
    `,
    transformOrigin: 'center',
    transition: 'transform 0.3s ease'
  };

  return (
    <div className="mb-12 rounded-xl overflow-hidden shadow-md">
      <div 
        className="relative py-8 px-6 md:px-10 flex flex-col md:flex-row items-center" 
        style={{ backgroundColor: config.background_color || "#003087" }}
      >
        <div className="w-full md:w-1/2 mb-6 md:mb-0 text-white">
          <h3 className="text-2xl font-bold mb-3">{config.title || "Clube de Benefícios"}</h3>
          <p className="text-xl font-medium mb-1">{config.subtitle || "A partir de R$ 19,90/mês"}</p>
          <p className="text-sm mb-4">{config.subtitle_description || "Cartão virtual ou físico, você escolhe!"}</p>
          
          {config.benefits && config.benefits.length > 0 && (
            <ul className="space-y-2 mb-6">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}
          
          <Button 
            asChild
            style={{ backgroundColor: config.button_color || "#F28C38" }}
            className="hover:opacity-90"
          >
            <Link to={createPageUrl("SubscriptionPlans")}>
              {config.button_text || "Ver Planos"}
            </Link>
          </Button>
        </div>
        
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          {config.card_image_url ? (
            <img 
              src={config.card_image_url}
              alt="Cartão do clube de benefícios"
              className="max-w-full h-auto max-h-[250px] object-contain"
              style={cardStyle}
            />
          ) : (
            <div className="bg-white/10 rounded-lg p-8 text-center text-white">
              <CreditCard className="h-16 w-16 mx-auto mb-2" />
              <p>Cartão do Clube</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}