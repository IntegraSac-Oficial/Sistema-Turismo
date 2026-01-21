import React, { useState, useEffect } from "react";
import { 
  ArrowUp, ArrowDown, ChevronDown, ChevronUp, Filter,
  Calendar, RefreshCw, TrendingUp, Star, Shield,
  MessageSquare, CheckCircle2, Heart, Users, Map, Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PointTransaction } from "@/api/entities";

export default function PointsHistory({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const data = await PointTransaction.filter({ user_id: userId }, "-transaction_date", 100);
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar histórico de pontos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, [userId]);
  
  const refreshTransactions = async () => {
    setLoading(true);
    try {
      const data = await PointTransaction.filter({ user_id: userId }, "-transaction_date", 100);
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao atualizar histórico de pontos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === "all") return true;
    return transaction.action_type === filter;
  });
  
  // Ordenar transações
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.transaction_date).getTime();
    const dateB = new Date(b.transaction_date).getTime();
    return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
  });
  
  // Limitar o número de transações exibidas se não estiver expandido
  const displayedTransactions = isExpanded ? sortedTransactions : sortedTransactions.slice(0, 5);
  
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "review":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "check_in":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "post":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case "achievement":
        return <Shield className="w-4 h-4 text-amber-500" />;
      case "streak":
        return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      case "referral":
        return <Users className="w-4 h-4 text-teal-500" />;
      case "membership":
        return <Crown className="w-4 h-4 text-[#FF5722]" />;
      default:
        return <ArrowUp className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getActionColor = (actionType) => {
    switch (actionType) {
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "check_in":
        return "bg-green-100 text-green-800";
      case "post":
        return "bg-blue-100 text-blue-800";
      case "like":
        return "bg-red-100 text-red-800";
      case "comment":
        return "bg-purple-100 text-purple-800";
      case "achievement":
        return "bg-amber-100 text-amber-800";
      case "streak":
        return "bg-indigo-100 text-indigo-800";
      case "referral":
        return "bg-teal-100 text-teal-800";
      case "membership":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#007BFF]" />
            Histórico de Pontos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={refreshTransactions}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
            >
              {sortDirection === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as atividades</SelectItem>
              <SelectItem value="review">Avaliações</SelectItem>
              <SelectItem value="check_in">Check-ins</SelectItem>
              <SelectItem value="post">Publicações</SelectItem>
              <SelectItem value="like">Curtidas</SelectItem>
              <SelectItem value="comment">Comentários</SelectItem>
              <SelectItem value="achievement">Conquistas</SelectItem>
              <SelectItem value="streak">Sequências</SelectItem>
              <SelectItem value="referral">Indicações</SelectItem>
              <SelectItem value="membership">Assinatura</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : displayedTransactions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Filter className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>Nenhuma atividade encontrada para os filtros atuais.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getActionColor(transaction.action_type)}`}>
                    {getActionIcon(transaction.action_type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(transaction.transaction_date).toLocaleString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <Badge className={transaction.points > 0 ? "bg-green-500" : "bg-red-500"}>
                  {transaction.points > 0 ? "+" : ""}{transaction.points} pts
                </Badge>
              </div>
            ))}
            
            {sortedTransactions.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-[#007BFF]"
                onClick={handleToggleExpand}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Mostrar mais ({sortedTransactions.length - 5} restantes)
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}