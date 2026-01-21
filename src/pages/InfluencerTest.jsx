import React, { useState, useEffect } from "react";
import { Influencer } from "@/api/entities";
import { Tourist } from "@/api/entities";

export default function InfluencerTest() {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createdTourist, setCreatedTourist] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const influencersData = await Influencer.list();
        setInfluencers(influencersData || []);
        console.log("Influencers encontrados:", influencersData);
      } catch (err) {
        console.error("Erro ao carregar influenciadores:", err);
        setError("Falha ao carregar dados dos influenciadores");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateTourist = async () => {
    try {
      setIsLoading(true);
      const touristData = {
        name: "Jaqueline OneClick",
        email: "jaqueline.oneclick@gmail.com",
        user_code: "USR" + Math.floor(Math.random() * 10000),
        user_id: "test-user-" + Date.now()
      };
      
      const createdData = await Tourist.create(touristData);
      setCreatedTourist(createdData);
      console.log("Turista criado:", createdData);
    } catch (err) {
      console.error("Erro ao criar turista:", err);
      setError("Falha ao criar turista de teste");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8">Carregando dados...</div>;

  if (error) return <div className="p-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Verificação da Entidade Influencer</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Influenciadores Encontrados: {influencers.length}</h2>
        <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">{JSON.stringify(influencers, null, 2)}</pre>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Criar Turista de Teste</h2>
        <p className="mb-2">Este botão irá criar um turista de teste com o email "jaqueline.oneclick@gmail.com" para teste de login.</p>
        <button 
          onClick={handleCreateTourist}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Criando..." : "Criar Turista de Teste"}
        </button>
        
        {createdTourist && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
            <h3 className="font-semibold">Turista criado com sucesso!</h3>
            <p>Agora você pode tentar fazer login com:</p>
            <p className="font-mono mt-1">Email: jaqueline.oneclick@gmail.com</p>
          </div>
        )}
      </div>
    </div>
  );
}