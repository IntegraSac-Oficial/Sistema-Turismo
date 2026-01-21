
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderStatus, setOrderStatus] = useState("success");
  const [orderId, setOrderId] = useState("");
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const success = urlParams.get("success") === "true";
    const sessionId = urlParams.get("session_id");
    
    setOrderStatus(success ? "success" : "error");
    
    // Gerar ID do pedido aleatório
    if (success) {
      const randomId = sessionId || Math.random().toString(36).substring(2, 10).toUpperCase();
      setOrderId(randomId);
    }
    
    // Adicionar código de referência aos metadados de pagamento, se existir
    const loadCheckoutSession = async () => {
      try {
        // Verificar e incluir código de referência
        const referralCode = localStorage.getItem('referralCode');
        const referralExpiry = localStorage.getItem('referralExpiry');
        
        if (referralCode && referralExpiry && Date.now() < Number(referralExpiry)) {
          // Adicionar código de referência aos metadados do checkout
          // You would typically send this data to your backend to associate the purchase with the referral code.
          console.log("Referral Code:", referralCode);
        }
        
      } catch (error) {
        console.error("Erro ao carregar sessão de checkout:", error);
      }
    };
    
    loadCheckoutSession();
  }, [location]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-lg w-full">
          {orderStatus === "success" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido realizado com sucesso!</h1>
              <p className="text-gray-600 mb-6">
                Seu pedido foi registrado e será processado em breve. Agradecemos sua compra!
              </p>
              
              <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-6">
                <p className="text-gray-700 font-medium">Número do pedido:</p>
                <p className="font-mono text-gray-800">{orderId}</p>
              </div>
              
              <Button 
                onClick={() => navigate(createPageUrl("PublicBusinesses"))}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Voltar para comércios
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Houve um problema com seu pedido</h1>
              <p className="text-gray-600 mb-6">
                Não foi possível concluir o seu pedido. Por favor, tente novamente ou entre em contato conosco.
              </p>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(createPageUrl("PublicBusinesses"))}
                >
                  Ir para comércios
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <PublicFooter />
    </div>
  );
}
