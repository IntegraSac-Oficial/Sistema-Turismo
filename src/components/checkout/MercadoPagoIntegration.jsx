import React, { useEffect, useState } from "react";
import { AlertCircle, Copy, Check, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function MercadoPagoIntegration({ 
  paymentMethod, 
  amount, 
  description, 
  customerEmail, 
  customerName,
  onPaymentSuccess,
  onPaymentError
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pixData, setPixData] = useState(null);
  const [mpConfig, setMpConfig] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Tenta carregar a configuração do Mercado Pago do localStorage
    const siteConfig = localStorage.getItem("siteConfig");
    if (siteConfig) {
      try {
        const config = JSON.parse(siteConfig);
        if (config?.pagamentos?.mercadopago?.access_token) {
          setMpConfig({
            accessToken: config.pagamentos.mercadopago.access_token,
            publicKey: config.pagamentos.mercadopago.public_key || ""
          });
        } else {
          setError("Token do Mercado Pago não configurado nas configurações do site");
          setIsLoading(false);
        }
      } catch (err) {
        setError("Erro ao processar configurações do Mercado Pago");
        setIsLoading(false);
      }
    } else {
      setError("Configurações do site não encontradas");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Se temos configuração e estamos no modo PIX, gerar QR code de pagamento
    if (mpConfig && paymentMethod === "pix" && !pixData) {
      generatePixPayment();
    }
  }, [mpConfig, paymentMethod]);
  
  // Para simular verificação de pagamento
  useEffect(() => {
    if (pixData) {
      // Verificar a cada 5 segundos (em um cenário real, isso seria feito via webhook)
      const interval = setInterval(() => {
        // Simulação: 25% de chance de o pagamento ser aprovado a cada verificação
        if (Math.random() < 0.25) {
          clearInterval(interval);
          handlePaymentSuccess();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [pixData]);

  const generatePixPayment = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Em um cenário real, aqui faríamos uma chamada para o backend
      // que se comunicaria com a API do Mercado Pago para gerar o pagamento

      // Simulando a criação de um pagamento PIX
      const timestamp = new Date().getTime();
      const amountStr = amount.toFixed(2).replace('.', '');
      const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      // Formato semelhante ao do PIX real
      const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136TURISMOSCAPP${timestamp}52040000530398658${amountStr}5802BR5922${customerName.substring(0, 25)}6009SAO PAULO62290525${randomId}${timestamp}6304${Math.floor(Math.random() * 9000 + 1000)}`;
      
      // Gerar QR code para o PIX (usando serviço externo para demo)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCopiaECola)}`;
      
      setPixData({
        qrCodeUrl,
        copiaECola: pixCopiaECola,
        expirationDate: new Date(Date.now() + 30 * 60000), // 30 minutos
        transactionId: `TX${timestamp.toString().substring(7)}${randomId}`
      });
      
      setIsLoading(false);

      // Salvar a transação localmente para simular banco de dados
      saveTransaction("pending");
      
    } catch (err) {
      setError("Erro ao gerar pagamento PIX. " + (err.message || ""));
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus("approved");
    saveTransaction("approved");
    
    if (onPaymentSuccess) {
      onPaymentSuccess({
        status: "approved",
        transactionId: pixData.transactionId
      });
    }
  };

  const saveTransaction = (status) => {
    try {
      // Obter assinaturas existentes
      const savedSubscriptions = localStorage.getItem("userSubscriptions") || "[]";
      const subscriptions = JSON.parse(savedSubscriptions);
      
      // Verificar se já existe esta transação
      const existingIndex = subscriptions.findIndex(s => s.transaction_id === pixData.transactionId);
      
      const newSubscription = {
        id: `sub_${new Date().getTime()}`,
        client_name: customerName || "Cliente Teste",
        email: customerEmail || "cliente@teste.com",
        plan_name: description || "Plano",
        plan_id: "teste",
        amount: amount,
        period: "Mensal",
        payment_method: "PIX",
        payment_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transaction_id: pixData.transactionId,
        status: status === "approved" ? "Aprovado" : status === "rejected" ? "Rejeitado" : "Pendente",
        pix_info: {
          key: "pix@turismsc.com.br"
        }
      };
      
      if (existingIndex >= 0) {
        // Atualizar status
        subscriptions[existingIndex] = {
          ...subscriptions[existingIndex],
          status: status === "approved" ? "Aprovado" : status === "rejected" ? "Rejeitado" : "Pendente"
        };
      } else {
        // Adicionar nova assinatura
        subscriptions.push(newSubscription);
      }
      
      localStorage.setItem("userSubscriptions", JSON.stringify(subscriptions));
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  // Em loading
  if (isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF]"></div>
        <p className="mt-4 text-gray-600">Preparando pagamento via {paymentMethod === "pix" ? "PIX" : "cartão"}...</p>
      </div>
    );
  }

  // Em caso de erro
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <p className="mt-2 text-sm">
            Configure o token do Mercado Pago nas configurações do site para habilitar pagamentos reais.
          </p>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Pagamento aprovado
  if (paymentStatus === "approved") {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Pagamento Aprovado!</h3>
        <p className="text-green-700 mb-4">Seu pagamento foi processado com sucesso.</p>
        <p className="text-sm text-green-600 mb-6">ID da transação: {pixData.transactionId}</p>
        
        <Button className="bg-[#4CAF50] hover:bg-green-700" onClick={onPaymentSuccess}>
          Continuar
        </Button>
      </div>
    );
  }

  // Renderizar PIX
  if (paymentMethod === "pix" && pixData) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <p className="text-lg font-medium mb-4">Escaneie o QR Code para pagar</p>
        
        <div className="mx-auto w-48 h-48 bg-white p-2 rounded-lg shadow-sm mb-4 flex items-center justify-center">
          <img 
            src={pixData.qrCodeUrl} 
            alt="QR Code para pagamento PIX" 
            className="max-w-full max-h-full"
          />
        </div>
        
        <div className="mb-4">
          <p className="font-medium mb-2">Ou copie o código PIX abaixo</p>
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-md p-3 pr-10 font-mono text-sm break-all">
              {pixData.copiaECola}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => copyToClipboard(pixData.copiaECola)}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
          {isCopied && (
            <p className="text-xs text-green-600 mt-1">Código copiado!</p>
          )}
        </div>
        
        <div className="text-sm text-gray-500 mb-4">
          <p>O código expira em 30 minutos. Após o pagamento, sua assinatura será ativada automaticamente.</p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-left">
            <p className="text-sm font-medium">Valor a pagar:</p>
            <p className="text-lg font-bold text-[#007BFF]">R$ {amount.toFixed(2).replace('.', ',')}</p>
          </div>
          
          <Button 
            variant="outline" 
            className="text-[#007BFF] border-[#007BFF]"
            onClick={handlePaymentSuccess}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Já paguei
          </Button>
        </div>
      </div>
    );
  }

  // Caso padrão (não deveria chegar aqui)
  return <p>Método de pagamento não suportado</p>;
}