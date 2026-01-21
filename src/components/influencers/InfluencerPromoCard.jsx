import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InfluencerCardSettings } from "@/api/entities";
import { Loader2 } from "lucide-react";

export default function InfluencerPromoCard() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const cardSettings = await InfluencerCardSettings.list();
        if (cardSettings && cardSettings.length > 0) {
          setSettings(cardSettings[0]);
        } else {
          // Configurações padrão caso não exista no banco
          setSettings({
            title: "Seja um Influenciador das Praias Catarinenses!",
            description: "Ganhe comissões divulgando as melhores praias de Santa Catarina. Cadastre-se agora!",
            button_text: "Quero ser um Influenciador",
            background_color: "#0077b6",
            text_color: "#ffffff",
            button_color: "#f28c38",
            button_text_color: "#ffffff",
            is_active: true
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do card:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Se não estiver ativo ou estiver carregando, não mostra nada
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (!settings || !settings.is_active) {
    return null;
  }

  const cardStyle = {
    backgroundImage: settings.background_image ? `url(${settings.background_image})` : 'none',
    backgroundColor: settings.background_image ? 'rgba(0,0,0,0.5)' : (settings.background_color || '#0077b6'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundBlendMode: settings.background_image ? 'overlay' : 'normal',
    color: settings.text_color || '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  const buttonStyle = {
    backgroundColor: settings.button_color || '#f28c38',
    color: settings.button_text_color || '#ffffff',
  };

  const handleClick = () => {
    // Usar createPageUrl para garantir que o redirecionamento seja interno
    navigate(createPageUrl("InfluencerSignup"));
  };

  return (
    <Card className="border-0 shadow-lg my-8" style={cardStyle}>
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: settings.text_color || '#ffffff' }}>
          {settings.title}
        </h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: settings.text_color || '#ffffff' }}>
          {settings.description}
        </p>
        <Button
          onClick={handleClick}
          size="lg"
          className="font-medium text-lg px-6 py-6 h-auto"
          style={buttonStyle}
        >
          {settings.button_text || "Quero ser um Influenciador"}
        </Button>
      </CardContent>
    </Card>
  );
}