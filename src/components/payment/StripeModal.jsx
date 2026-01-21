
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ExternalLink, Copy, AlertCircle } from "lucide-react";
import { stripeIntegration } from "@/api/functions";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/api/entities";

// Este componente usa o redirecionamento para o Stripe Checkout
export default function StripeModal({ 
  isOpen, 
  onClose, 
  planName, 
  planId, 
  planPrice,
  paymentMethod = "card",
  onSuccess 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [pixDetails, setPixDetails] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 minutos
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    const initializePayment = async () => {
      if (isOpen && planId && planPrice) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Verificar autenticação usando localStorage primeiro
          const storedUser = localStorage.getItem('currentUser');
          if (!storedUser) {
            setError("Por favor, faça login para continuar com o pagamento");
            setIsLoading(false);
            return;
          }
          
          if (paymentMethod === 'card') {
            await createCardCheckout();
          } else if (paymentMethod === 'pix') {
            await createPixCheckout();
          }
        } catch (error) {
          console.error("Erro ao inicializar pagamento:", error);
          setError("Erro ao verificar sua sessão. Por favor, tente novamente.");
          setIsLoading(false);
        }
      }
    };

    initializePayment();
  }, [isOpen, planId, planPrice, paymentMethod]);
  
  useEffect(() => {
    let timer;
    if (isOpen && pixDetails && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, pixDetails, countdown]);
  
  const createCardCheckout = async () => {
    try {
      console.log("Iniciando criação de checkout com cartão...");
      console.log("Dados enviados:", { planId, paymentMethod: 'card', price: planPrice, planName });
      
      const response = await stripeIntegration({
        planId,
        paymentMethod: 'card',
        price: planPrice,
        planName: planName || "Plano de Assinatura"
      });
      
      console.log("Resposta completa do stripeIntegration:", JSON.stringify(response, null, 2));
      
      // Aqui está o problema - vamos verificar a estrutura da resposta
      if (response.data && response.data.url) {
        console.log("URL de checkout encontrada em response.data:", response.data.url);
        setCheckoutUrl(response.data.url);
      } else if (response.url) {
        console.log("URL de checkout encontrada diretamente:", response.url);
        setCheckoutUrl(response.url);
      } else {
        console.error("Resposta sem URL:", JSON.stringify(response));
        throw new Error("URL de checkout não recebida");
      }
    } catch (err) {
      console.error("Erro detalhado ao criar checkout:", err);
      setError(err.message || "Erro ao criar sessão de pagamento");
      toast({
        title: "Erro de pagamento",
        description: err.message || "Não foi possível criar a sessão de pagamento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const createPixCheckout = async () => {
    try {
      const response = await stripeIntegration({
        planId,
        paymentMethod: 'pix',
        price: planPrice,
        planName: planName || "Plano de Assinatura"
      });
      
      console.log("Resposta PIX:", JSON.stringify(response, null, 2));
      
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      } else if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data && response.data.pixDetails) {
        setPixDetails(response.data.pixDetails);
      } else if (response.pixDetails) {
        setPixDetails(response.pixDetails);
      } else {
        throw new Error("Dados de PIX não recebidos");
      }
    } catch (err) {
      console.error("Erro ao criar checkout PIX:", err);
      setError(err.message || "Erro ao criar pagamento PIX");
      toast({
        title: "Erro de pagamento PIX",
        description: err.message || "Não foi possível criar o pagamento PIX",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyPixCode = () => {
    if (!pixDetails || !pixDetails.pix_code) return;
    
    navigator.clipboard.writeText(pixDetails.pix_code)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error("Erro ao copiar:", err);
      });
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleClose = () => {
    setCheckoutUrl('');
    setPixDetails(null);
    setError(null);
    setIsLoading(false);
    setCountdown(900);
    onClose();
  };
  
  // Modificação no goToCheckout para garantir que temos uma URL
  const goToCheckout = () => {
    if (!checkoutUrl) {
      toast({
        title: "Erro",
        description: "URL de checkout não disponível. Tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    // Abre o checkout do Stripe em uma nova janela/aba
    window.open(checkoutUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentMethod === 'card' ? 'Pagamento com Cartão' : 'Pagamento com PIX'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p>Preparando pagamento...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Erro no pagamento</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button 
              onClick={handleClose} 
              className="mt-4 w-full"
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="py-4">
            {/* Informações do plano */}
            <div className="mb-6 p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{planName}</p>
              <p className="text-2xl font-bold mt-1">R$ {planPrice.toFixed(2)}</p>
            </div>
            
            {paymentMethod === 'card' && checkoutUrl ? (
              <div className="flex flex-col items-center">
                <p className="text-center mb-4">
                  Você será redirecionado para o ambiente seguro do Stripe para finalizar seu pagamento.
                </p>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 w-full flex items-center justify-center"
                  onClick={goToCheckout}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continuar para pagamento
                </Button>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Processamento seguro por Stripe
                </p>
              </div>
            ) : paymentMethod === 'pix' && pixDetails ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg w-64 h-64 flex items-center justify-center">
                  {pixDetails.qr_code ? (
                    <img 
                      src={`data:image/png;base64,${pixDetails.qr_code}`} 
                      alt="QR Code PIX" 
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      QR Code não disponível
                    </div>
                  )}
                </div>
                
                {pixDetails.pix_code && (
                  <div className="w-full">
                    <p className="text-sm text-gray-500 mb-1">Código PIX:</p>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200 relative">
                      <p className="text-xs font-mono break-all pr-10">
                        {pixDetails.pix_code}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-6 p-1"
                        onClick={handleCopyPixCode}
                      >
                        {copySuccess ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    O QR Code expira em: <span className="text-red-600">{formatTime(countdown)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Abra o app do seu banco, escaneie o QR code ou copie e cole o código PIX
                  </p>
                </div>
                
                <Button 
                  onClick={onSuccess} 
                  className="bg-green-600 hover:bg-green-700 mt-4"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Já realizei o pagamento
                </Button>
              </div>
            ) : null}
          </div>
        )}
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
