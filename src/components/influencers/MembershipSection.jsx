import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Gift, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MembershipSection({ influencer }) {
  const navigate = useNavigate();

  const handleViewCard = () => {
    // Atualizar no localStorage os dados necessários para o cartão
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = {
      ...currentUser,
      role: 'influencer', // Definir explicitamente o papel
      influencer_id: influencer.id,
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Navegar para a página do cartão
    navigate(createPageUrl("MembershipCard"));
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
          <Crown className="w-5 h-5 text-blue-600" />
          Clube de Benefícios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Seu Cartão Digital</h3>
                <p className="text-sm text-gray-600">
                  Use seu cartão para obter descontos exclusivos
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Ativo
              </Badge>
            </div>
            
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handleViewCard}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Meu Cartão de Membro
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <div className="flex flex-col items-center">
                <Gift className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium text-gray-900">Descontos Especiais</h3>
                <p className="text-sm text-gray-600 text-center">
                  Até 50% OFF em parceiros
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <div className="flex flex-col items-center">
                <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-medium text-gray-900">Benefícios VIP</h3>
                <p className="text-sm text-gray-600 text-center">
                  Acesso exclusivo a eventos
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}