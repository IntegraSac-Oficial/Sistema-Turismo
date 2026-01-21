import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function PixQRCode({ pixKey, amount, businessName }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyToClipboard = () => {
    if (!pixKey) return;
    
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência."
    });

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Pagamento PIX</h3>
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-gray-600">Valor:</div>
          <div className="font-medium">R$ {amount?.toFixed(2) || "0.00"}</div>
          
          <div className="text-gray-600">Beneficiário:</div>
          <div className="font-medium">{businessName || "Nome não disponível"}</div>
        </div>

        {pixKey ? (
          <div>
            <h4 className="font-medium mb-2 text-center">Chave PIX:</h4>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-3 rounded-l flex-1 font-mono text-break overflow-x-auto">
                {pixKey}
              </div>
              <Button 
                onClick={handleCopyToClipboard}
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-600">
            Chave PIX não disponível
          </div>
        )}
      </div>
      
      <p className="text-center text-sm text-gray-600 mb-4">
        Copie a chave PIX acima e use no aplicativo do seu banco para realizar o pagamento
      </p>
    </div>
  );
}