import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, DollarSign, Wallet, Loader2 } from "lucide-react";
import { Influencer } from "@/api/entities";

export default function PayoutRequestForm({ influencerId, balance, onRequestSent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState("");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        throw new Error("Por favor, informe um valor válido para o saque.");
      }

      const numericAmount = Number(amount);
      
      if (numericAmount > balance) {
        throw new Error("O valor do saque não pode ser maior que o seu saldo disponível.");
      }

      if (numericAmount < 50) {
        throw new Error("O valor mínimo para saque é de R$ 50,00.");
      }

      // Buscar o influenciador atual
      const influencer = await Influencer.get(influencerId);
      
      if (!influencer) {
        throw new Error("Influenciador não encontrado.");
      }

      // Preparar o novo request de saque
      const newPayoutRequest = {
        date: new Date().toISOString().split('T')[0],
        amount: numericAmount,
        status: "pending"
      };

      // Atualizar o array de solicitações de saque
      const currentPayoutRequests = influencer.payout_requests || [];
      const updatedPayoutRequests = [...currentPayoutRequests, newPayoutRequest];

      // Atualizar o saldo
      const updatedBalance = (influencer.balance || 0) - numericAmount;

      // Atualizar o influenciador
      await Influencer.update(influencerId, {
        payout_requests: updatedPayoutRequests,
        balance: updatedBalance
      });

      // Limpar o formulário e mostrar mensagem de sucesso
      setAmount("");
      setSuccess(true);
      
      // Notificar o componente pai
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error("Erro ao solicitar saque:", error);
      setError(error.message || "Ocorreu um erro ao processar sua solicitação de saque.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Wallet className="w-5 h-5 mr-2 text-gray-500" />
          Solicitar Saque
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Saldo Disponível
            </h3>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(balance || 0)}
            </p>
          </div>
          
          {success ? (
            <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Sua solicitação de saque foi enviada com sucesso! Processaremos seu pagamento em até 48 horas úteis.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Valor do Saque (mínimo R$ 50,00)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    step="0.01"
                    max={balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="pl-8"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !amount || Number(amount) <= 0 || Number(amount) > balance}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Solicitar Saque
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}