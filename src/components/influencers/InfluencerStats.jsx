import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, DollarSign, Users } from "lucide-react";

export default function InfluencerStats({ stats }) {
  // Verificar se stats existe e providenciar um valor padrão caso não exista
  const safeStats = stats || {
    balance: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    totalReferrals: 0,
    planTypes: {
      commercial: 0,
      providers: 0,
      club: 0
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-blue-600 text-white shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center sm:text-left">
              <div className="text-sm font-medium text-blue-100 mb-1">Saldo Disponível</div>
              <div className="text-3xl font-bold">{formatCurrency(safeStats.balance)}</div>
            </div>

            <div className="text-center sm:text-left">
              <div className="text-sm font-medium text-blue-100 mb-1">Total de Comissões</div>
              <div className="text-3xl font-bold">{formatCurrency(safeStats.totalCommissions)}</div>
              <div className="text-xs text-blue-200 mt-1">
                {formatCurrency(safeStats.pendingCommissions)} em processamento
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <Users className="h-6 w-6 text-blue-600 mb-1" />
            <div className="text-lg font-bold text-gray-900">{safeStats.totalReferrals}</div>
            <div className="text-xs text-gray-500 text-center">Indicações</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <svg className="h-6 w-6 text-blue-600 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v.5H2V7z"/>
              <path d="M20 11V7"/>
              <path d="M4 11V7"/>
              <rect x="4" y="11" width="16" height="8" rx="1"/>
              <path d="M8 11v8"/>
              <path d="M16 11v8"/>
              <path d="M12 11v8"/>
            </svg>
            <div className="text-lg font-bold text-gray-900">{safeStats.planTypes?.commercial || 0}</div>
            <div className="text-xs text-gray-500 text-center">Comércios</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <svg className="h-6 w-6 text-blue-600 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <div className="text-lg font-bold text-gray-900">{safeStats.planTypes?.providers || 0}</div>
            <div className="text-xs text-gray-500 text-center">Prestadores</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <svg className="h-6 w-6 text-blue-600 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <div className="text-lg font-bold text-gray-900">{safeStats.planTypes?.club || 0}</div>
            <div className="text-xs text-gray-500 text-center">Turistas</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}