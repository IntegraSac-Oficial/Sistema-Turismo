import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function PayoutHistoryTable({ payouts = [] }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Concluído</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeitado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  if (!payouts || payouts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma solicitação de saque realizada.</p>
        <p className="text-sm mt-2">Utilize o formulário para solicitar um saque do seu saldo disponível.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Histórico de solicitações de saque</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Data da Solicitação</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data da Conclusão</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((payout, index) => (
          <TableRow key={index}>
            <TableCell>
              {payout.date ? format(new Date(payout.date), 'dd/MM/yyyy') : 'N/A'}
            </TableCell>
            <TableCell>{formatCurrency(payout.amount)}</TableCell>
            <TableCell>{getStatusBadge(payout.status)}</TableCell>
            <TableCell>
              {payout.completed_date ? format(new Date(payout.completed_date), 'dd/MM/yyyy') : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}