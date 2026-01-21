import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share, Mail, ExternalLink, Check, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InfluencerReferralLink({ code }) {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const qrCanvasRef = useRef(null);
  
  // Criar o link de referência completo
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/SubscriptionPlans?ref=${code}`;
  
  // Gerar QR Code usando API externa
  useEffect(() => {
    // Usando a API do QRServer para gerar o QR code
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(referralLink)}&size=200x200&margin=10`;
    setQrCodeDataURL(qrCodeURL);
  }, [referralLink]);

  // Download QR Code
  const downloadQRCode = () => {
    // Cria um link temporário para download
    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = `qrcode-${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Versão ultra simplificada do método de cópia
  const copyToClipboard = () => {
    try {
      // Cria um elemento de input temporário
      const tempInput = document.createElement("input");
      tempInput.value = referralLink;
      document.body.appendChild(tempInput);
      
      // Seleciona e copia
      tempInput.select();
      document.execCommand('copy');
      
      // Remove o elemento temporário
      document.body.removeChild(tempInput);
      
      // Atualiza estados
      setIsCopied(true);
      setCopyError(null);
      
      // Limpa o estado após 2 segundos
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      setCopyError("Não foi possível copiar o link. Por favor, copie manualmente.");
    }
  };
  
  // Compartilhar via WhatsApp
  const shareOnWhatsApp = () => {
    try {
      const text = `Confira os melhores planos para aproveitar as Praias Catarinenses: ${referralLink}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } catch (error) {
      console.error("Erro ao compartilhar no WhatsApp:", error);
    }
  };
  
  // Compartilhar via Email
  const shareViaEmail = () => {
    try {
      const subject = encodeURIComponent("Conheça os planos das Praias Catarinenses");
      const body = encodeURIComponent(`Olá,\n\nConfira os melhores planos para aproveitar as Praias Catarinenses: ${referralLink}\n\nAbraços!`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    } catch (error) {
      console.error("Erro ao compartilhar via email:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Seu Link de Afiliado</CardTitle>
        <CardDescription>
          Compartilhe este link ou QR Code para ganhar comissões em novos cadastros
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            value={referralLink}
            readOnly
            className="font-mono text-sm bg-gray-50"
            onClick={(e) => e.target.select()}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(referralLink, '_blank')}
            className="flex-shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* QR Code Section */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex flex-col items-center gap-4">
            {qrCodeDataURL && (
              <img 
                src={qrCodeDataURL} 
                alt="QR Code para link de referência" 
                className="w-[200px] h-[200px]"
              />
            )}
            <Button 
              variant="outline" 
              onClick={downloadQRCode}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar QR Code
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={isCopied ? "success" : "default"} 
            className={`flex items-center justify-center ${isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-900"}`}
            onClick={copyToClipboard}
          >
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareOnWhatsApp}
            className="flex items-center justify-center"
          >
            <Share className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareViaEmail}
            className="flex items-center justify-center"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
        
        {copyError && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>
              {copyError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
          <p className="text-blue-700">
            <strong>Dica:</strong> Se o botão de copiar não funcionar, você pode selecionar todo o link acima e usar Ctrl+C (ou Cmd+C no Mac) para copiar manualmente.
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">
            Sempre que alguém se cadastrar através deste link e se tornar um assinante, você receberá uma comissão sobre o valor da assinatura.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}