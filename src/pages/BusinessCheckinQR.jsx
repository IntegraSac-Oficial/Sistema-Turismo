import React, { useState, useEffect } from 'react';
import { Business } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Download, Info, Copy, Loader2, Share2 } from 'lucide-react'; // Adicionar Share2 de volta e garantir Loader2
import BackButton from '@/components/ui/BackButton';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function BusinessCheckinQR() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkinCode, setCheckinCode] = useState('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState(''); // Estado para a URL da imagem do QR Code

  useEffect(() => {
    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          toast({ title: "Erro", description: "Usuário não logado.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const currentUser = JSON.parse(currentUserStr);
        
        if (currentUser.business_id) {
          const currentBusiness = await Business.get(currentUser.business_id);
          if (currentBusiness) {
            setBusiness(currentBusiness);
            const code = `CHECKIN_BIZ_${currentBusiness.id}`;
            setCheckinCode(code);
            // Gerar URL do QR Code usando a API externa
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(code)}&size=256x256&margin=10`;
            setQrCodeDataURL(qrApiUrl);
          } else {
            toast({ title: "Erro", description: "Comércio não encontrado.", variant: "destructive" });
          }
        } else {
           toast({ title: "Erro", description: "Nenhum comércio associado a este usuário.", variant: "destructive" });
        }

      } catch (error) {
        console.error("Erro ao buscar dados do comércio:", error);
        toast({ title: "Erro", description: "Não foi possível carregar dados do seu comércio.", variant: "destructive" });
      }
      setLoading(false);
    };
    fetchBusinessData();
  }, []);

  const handleCopyCode = () => {
    if (checkinCode) {
      navigator.clipboard.writeText(checkinCode)
        .then(() => {
          toast({ title: "Copiado!", description: "O código de check-in foi copiado para a área de transferência." });
        })
        .catch(err => {
          console.error('Erro ao copiar código:', err);
          toast({ title: "Erro", description: "Não foi possível copiar o código.", variant: "destructive" });
        });
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      // Para forçar o download como PNG e evitar abrir em nova aba (o próprio QRServer já entrega como PNG)
      link.setAttribute('download', `qrcode-checkin-${business?.business_name || 'comercio'}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({ title: "Erro", description: "QR Code ainda não carregado.", variant: "destructive" });
    }
  };

  const handleShareQR = async () => {
    if (navigator.share && qrCodeDataURL) {
      try {
        // A API navigator.share geralmente espera um título, texto e URL.
        // Para compartilhar a imagem do QR Code diretamente, precisaríamos convertê-la para um Blob/File,
        // o que pode ser complexo sem libs adicionais e com a imagem vindo de uma API externa.
        // Uma alternativa mais simples é compartilhar o CÓDIGO de check-in.
        await navigator.share({
          title: `Código de Check-in para ${business?.business_name || 'Comércio'}`,
          text: `Use este código para fazer check-in: ${checkinCode}`,
          // url: window.location.href // Ou uma URL específica para o check-in, se existir
        });
        toast({ title: "Compartilhado!", description: "O código de check-in foi compartilhado."});
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        toast({ title: "Erro", description: "Não foi possível compartilhar o código.", variant: "destructive" });
      }
    } else {
      // Fallback para copiar o código se a API de compartilhamento não estiver disponível
      handleCopyCode();
      toast({ title: "Copiado!", description: "API de compartilhamento não disponível. O código foi copiado."});
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-700">Carregando Código de Check-in...</p>
      </div>
    );
  }

  if (!business || !checkinCode) {
    return (
      <div className="p-6 text-center">
         <BackButton />
        <p className="mt-4">Não foi possível gerar o código para check-in.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-lg">
        <BackButton />
        <Card className="shadow-xl mt-4">
          <CardHeader className="text-center">
            <QrCode className="mx-auto h-12 w-12 text-green-600 mb-2" />
            <CardTitle className="text-2xl">QR Code para Check-in</CardTitle>
            <CardDescription>
              Seus clientes podem escanear este QR Code ou informar o código abaixo para fazer check-in em <span className="font-semibold">{business.business_name}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {qrCodeDataURL ? (
              <div className="p-4 bg-white border rounded-lg inline-block shadow-md">
                <img 
                  src={qrCodeDataURL} 
                  alt={`QR Code para ${business.business_name}`} 
                  className="w-64 h-64" // Ajustar tamanho conforme necessidade
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
                <p className="ml-2 text-gray-500">Gerando QR Code...</p>
              </div>
            )}
            
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center w-full">
              <p className="text-sm text-gray-600 mb-1">Ou informe este código:</p>
              <p className="text-2xl font-bold text-green-700 tracking-wider break-all">{checkinCode}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <Button onClick={handleCopyCode} className="w-full">
                <Copy className="mr-2 h-4 w-4" /> Copiar Código
              </Button>
              <Button onClick={handleDownloadQR} disabled={!qrCodeDataURL} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Baixar QR Code
              </Button>
              <Button onClick={handleShareQR} variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
              </Button>
            </div>

            <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Instruções para seus clientes:</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                    <li>Abra o aplicativo Praias Catarinenses.</li>
                    <li>Vá para a seção "Check-in" no seu perfil.</li>
                    <li>Escaneiem este QR Code ou insiram o código acima.</li>
                    <li>Confirmem o check-in para ganhar benefícios!</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}