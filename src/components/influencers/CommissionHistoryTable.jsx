import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function CommissionHistoryTable({ commissions }) {
  if (!commissions || commissions.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-lg text-gray-700 font-medium mb-2">Nenhuma comissão registrada ainda.</p>
        <p className="text-gray-500 text-sm">
          As comissões aparecerão aqui quando suas indicações contratarem planos.
        </p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "credited":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Creditado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  // Renderizador de tabela para desktop
  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plano
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comissão
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {commissions.map((commission) => (
            <tr key={commission.id}>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {commission.plan_name || "Plano sem nome"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {commission.plan_type === "commercial" && "Comércio"}
                {commission.plan_type === "providers" && "Prestador"}
                {commission.plan_type === "club" && "Clube"}
                {commission.plan_type === "properties" && "Imóvel"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                {formatCurrency(commission.plan_amount || 0)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-700">
                {formatCurrency(commission.commission_amount || 0)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                {commission.payment_date 
                  ? format(new Date(commission.payment_date), 'dd/MM/yyyy')
                  : "N/A"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                {getStatusBadge(commission.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Renderizador de cards para mobile
  const renderMobileCards = () => (
    <div className="md:hidden space-y-4">
      {commissions.map((commission) => (
        <div key={commission.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {commission.plan_name || "Plano sem nome"}
                </h3>
                <span className="inline-block text-xs text-gray-500 rounded-full bg-gray-100 py-1 px-2">
                  {commission.plan_type === "commercial" && "Comércio"}
                  {commission.plan_type === "providers" && "Prestador"}
                  {commission.plan_type === "club" && "Clube"}
                  {commission.plan_type === "properties" && "Imóvel"}
                </span>
              </div>
              {getStatusBadge(commission.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-500">Valor do plano:</div>
              <div className="text-right text-gray-900 font-medium">
                {formatCurrency(commission.plan_amount || 0)}
              </div>
              
              <div className="text-gray-500">Comissão:</div>
              <div className="text-right text-blue-700 font-medium">
                {formatCurrency(commission.commission_amount || 0)}
              </div>
              
              <div className="text-gray-500">Data:</div>
              <div className="text-right text-gray-900">
                {commission.payment_date 
                  ? format(new Date(commission.payment_date), 'dd/MM/yyyy')
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {renderDesktopTable()}
      {renderMobileCards()}
    </>
  );
}