
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function PixPaymentModal({ 
  isOpen, 
  onClose, 
  pixKey, 
  pixKeyType, 
  amount, 
  businessName,
  onConfirm
}) {
  const [copied, setCopied] = React.useState(false);

  // Log para depuração
  useEffect(() => {
    console.log("PixPaymentModal montado com props:", { isOpen, pixKey, pixKeyType, amount, businessName });
  }, [isOpen, pixKey, pixKeyType, amount, businessName]);

  const handleCopyToClipboard = () => {
    if (!pixKey) {
      console.error("Tentativa de copiar chave PIX inexistente");
      return;
    }
    
    try {
      navigator.clipboard.writeText(pixKey)
        .then(() => {
          setCopied(true);
          toast({
            title: "Copiado!",
            description: "Chave Pix copiada para a área de transferência."
          });
          
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        })
        .catch(err => {
          console.error("Erro ao copiar para o clipboard:", err);
          toast({
            title: "Erro ao copiar",
            description: "Não foi possível copiar a chave. Tente selecionar e copiar manualmente.",
            variant: "destructive"
          });
        });
    } catch (error) {
      console.error("Falha ao interagir com o clipboard:", error);
    }
  };

    // Verificar código de referência ao confirmar pagamento PIX
    const handleConfirm = () => {
      // Adicionar código de referência aos metadados, se existir
      const metadata = {};
      
      // Verificar se existe código de referência válido
      const referralCode = localStorage.getItem('referralCode');
      const referralExpiry = localStorage.getItem('referralExpiry');
      
      if (referralCode && referralExpiry && Date.now() < Number(referralExpiry)) {
        metadata.referralCode = referralCode;
      }
      
      // Chamar onConfirm com metadata incluindo o código de referência
      onConfirm(metadata);
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button 
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800" 
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">Pagamento via PIX</h2>
        
        <p className="text-gray-600 mb-4">
          Copie a chave PIX abaixo e realize o pagamento no seu aplicativo preferido
        </p>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-gray-600">Valor:</div>
            <div className="font-medium">R$ {amount?.toFixed(2) || "0.00"}</div>
            
            <div className="text-gray-600">Beneficiário:</div>
            <div className="font-medium">{businessName || "Nome não disponível"}</div>
          </div>

          {pixKey ? (
            <div>
              <h3 className="font-medium mb-2">Chave PIX:</h3>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-3 rounded-l flex-1 font-mono text-sm overflow-x-auto break-all">
                  {pixKey}
                </div>
                <Button 
                  onClick={handleCopyToClipboard}
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {pixKeyType && (
                <div className="mt-2 text-sm text-gray-500">
                  Tipo de chave: {pixKeyType}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-yellow-700 font-medium">Chave PIX não configurada</p>
                  <p className="text-yellow-600 text-sm">
                    Este estabelecimento ainda não configurou uma chave PIX. 
                    Por favor, escolha outro método de pagamento.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800">Instruções:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Copie a chave PIX acima</li>
            <li>Abra o aplicativo do seu banco</li>
            <li>Escolha a opção PIX</li>
            <li>Cole a chave</li>
            <li>Digite o valor exato: R$ {amount?.toFixed(2)}</li>
            <li>Após pagar, clique em "Confirmar Pagamento"</li>
            <li>Aguarde a ativação do plano (1-2 dias úteis)</li>
          </ol>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!pixKey}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Confirmar Pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}
