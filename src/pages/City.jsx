import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function City() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const cityId = urlParams.get('id');
  
  useEffect(() => {
    // Redirecionamento automático para CityDetail
    if (cityId) {
      navigate(createPageUrl(`CityDetail?id=${cityId}`));
    } else {
      navigate(createPageUrl("PublicCities"));
    }
  }, [cityId, navigate]);
  
  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Florianópolis</h1>
          <p className="mb-6 text-gray-600">
            Você não pode perder As praias com maior número de diversão em viagens de aventura Nossa equipe visita cada local para trazer tudo o que você precisa saber: as melhores atrações, onde se hospedar, os restaurantes mais bacanas, os passeios imperdíveis, dicas de compras e muito mais!
          </p>
          <Button 
            onClick={() => navigate(createPageUrl("Public"))} 
            className="bg-[#007BFF] hover:bg-blue-600"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar para a página inicial
          </Button>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}