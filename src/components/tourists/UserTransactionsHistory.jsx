import React, { useState, useEffect } from 'react';
import { BusinessTransaction } from '@/api/entities';
import { Business } from '@/api/entities'; // Para buscar nome do comércio
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Coins, Percent, CheckCircle, ShoppingBag, Loader2, History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TransactionIcon = ({ type }) => {
  switch (type) {
    case 'earn_cashback':
      return <Percent className="h-5 w-5 text-yellow-500" />;
    case 'earn_points':
      return <Coins className="h-5 w-5 text-blue-500" />;
    case 'redeem_cashback':
      return <ShoppingBag className="h-5 w-5 text-green-500" />;
    case 'redeem_points':
      return <ShoppingBag className="h-5 w-5 text-green-500" />;
    case 'check_in_bonus_points':
      return <CheckCircle className="h-5 w-5 text-indigo-500" />;
    case 'check_in_bonus_cashback':
        return <CheckCircle className="h-5 w-5 text-indigo-500" />;
    default:
      return <History className="h-5 w-5 text-gray-400" />;
  }
};

export default function UserTransactionsHistory({ touristId }) {
  const [transactions, setTransactions] = useState([]);
  const [businesses, setBusinesses] = useState({}); // Cache para nomes de comércios
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!touristId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetchedTransactions = await BusinessTransaction.filter({ tourist_id: touristId }, '-created_date');
        setTransactions(fetchedTransactions || []);

        //Buscar nomes dos comércios
        const businessIds = [...new Set(fetchedTransactions.map(t => t.business_id))];
        const businessesData = {};
        for (const id of businessIds) {
          if (!businesses[id]) { // Evitar buscar se já tiver no cache
            try {
                const business = await Business.get(id);
                businessesData[id] = business?.business_name || "Comércio Desconhecido";
            } catch (e) {
                console.warn(`Comércio com ID ${id} não encontrado.`);
                businessesData[id] = "Comércio Desconhecido";
            }
          }
        }
        setBusinesses(prev => ({ ...prev, ...businessesData }));

      } catch (error) {
        console.error("Erro ao buscar histórico de transações:", error);
      }
      setIsLoading(false);
    };

    fetchTransactions();
  }, [touristId]);

  const formatTransactionDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };
  
  const getTransactionValueDisplay = (transaction) => {
    if (transaction.cashback_amount && transaction.cashback_amount !== 0) {
      const prefix = transaction.transaction_type.startsWith('earn') ? '+' : '-';
      return `${prefix} R$${Math.abs(transaction.cashback_amount).toFixed(2)}`;
    }
    if (transaction.points_amount && transaction.points_amount !== 0) {
      const prefix = transaction.transaction_type.startsWith('earn') ? '+' : '-';
      return `${prefix} ${Math.abs(transaction.points_amount)} pontos`;
    }
    return "";
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700">Nenhuma transação encontrada</h3>
        <p className="text-gray-500">Você ainda não realizou nenhuma transação de fidelidade.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Histórico de Transações de Fidelidade</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-3">
          <div className="space-y-4">
            {transactions.map(transaction => (
              <div key={transaction.id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-gray-100 rounded-full mr-3 mt-1">
                   <TransactionIcon type={transaction.transaction_type} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    Em: {businesses[transaction.business_id] || "Carregando..."}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTransactionDate(transaction.created_date)}
                  </p>
                </div>
                <div className={`font-semibold text-lg ml-2 ${
                    transaction.transaction_type.startsWith('earn') ? 'text-green-600' : 
                    transaction.transaction_type.startsWith('redeem') ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {getTransactionValueDisplay(transaction)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}