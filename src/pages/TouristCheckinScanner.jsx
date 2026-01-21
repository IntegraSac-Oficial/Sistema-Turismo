import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import QrReader from 'react-qr-reader'; // Exemplo, se for usar uma lib específica
// Para PWAs, podemos tentar usar a API MediaDevices diretamente
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { QrCode, ArrowLeft, Video, VideoOff, CheckCircle, XCircle } from 'lucide-react';
import { Tourist } from '@/api/entities';
import { BusinessTransaction } from '@/api/entities';
import { LoyaltyRule } from '@/api/entities';
import BackButton from '@/components/ui/BackButton';

export default function TouristCheckinScanner() {
  const navigate = useNavigate();
  const [tourist, setTourist] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showScanner, setShowScanner] = useState(false); // Controla visibilidade do scanner
  let stream = null; // Para guardar a stream da câmera

  useEffect(() => {
    const fetchTouristData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.tourist_id) {
          const touristData = await Tourist.get(user.tourist_id);
          setTourist(touristData);
        } else {
          toast({ title: "Erro", description: "Perfil de turista não encontrado.", variant: "destructive" });
          navigate(-1);
        }
      } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar seus dados.", variant: "destructive" });
        navigate(-1);
      }
    };
    fetchTouristData();
    
    // Limpar stream da câmera ao desmontar o componente
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate]);

  const handleScanSuccess = async (data) => {
    if (data && !processing) {
      setProcessing(true);
      setShowScanner(false); // Ocultar scanner após leitura
      if (stream) { // Parar a câmera
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }

      try {
        const qrData = JSON.parse(data);
        if (qrData.type === "check-in" && qrData.business_id) {
          setScanResult(`Check-in em ${qrData.name || 'estabelecimento'} (ID: ${qrData.business_id}). Processando...`);

          // Verificar se já fez check-in recentemente neste local (evitar spam)
          const recentCheckins = await BusinessTransaction.filter({
            tourist_id: tourist.id,
            business_id: qrData.business_id,
            transaction_type: { $in: ["check_in_bonus_points", "check_in_bonus_cashback"] }
          }, '-created_date', 1);

          if (recentCheckins.length > 0) {
            const lastCheckinTime = new Date(recentCheckins[0].created_date).getTime();
            // Permitir checkin a cada 1 hora, por exemplo
            if (Date.now() - lastCheckinTime < 60 * 60 * 1000) { 
              toast({ title: "Check-in Recente", description: `Você já fez check-in em ${qrData.name || 'este local'} recentemente. Tente mais tarde.`, variant: "default" });
              setProcessing(false);
              return;
            }
          }
          
          // Aplicar regras de bônus de check-in
          const rules = await LoyaltyRule.filter({ 
            business_id: qrData.business_id, 
            is_active: true,
            rule_type: { $in: ["fixed_points_on_check_in", "fixed_cashback_on_check_in"] }
          });

          let pointsEarned = 0;
          let cashbackEarned = 0;
          let description = `Check-in em ${qrData.name || 'ID ' + qrData.business_id}`;

          rules.forEach(rule => {
            if (rule.rule_type === "fixed_points_on_check_in") pointsEarned += rule.value;
            if (rule.rule_type === "fixed_cashback_on_check_in") cashbackEarned += rule.value;
          });

          if (pointsEarned > 0) {
            await BusinessTransaction.create({
              business_id: qrData.business_id,
              tourist_id: tourist.id,
              transaction_type: 'check_in_bonus_points',
              points_amount: pointsEarned,
              description: `Bônus de Check-in (Pontos) em ${qrData.name || 'ID ' + qrData.business_id}`,
            });
            await Tourist.update(tourist.id, { points_balance: (tourist.points_balance || 0) + pointsEarned });
            description += ` (+${pointsEarned} pts)`;
          }

          if (cashbackEarned > 0) {
            await BusinessTransaction.create({
              business_id: qrData.business_id,
              tourist_id: tourist.id,
              transaction_type: 'check_in_bonus_cashback',
              cashback_amount: cashbackEarned,
              description: `Bônus de Check-in (Cashback) em ${qrData.name || 'ID ' + qrData.business_id}`,
            });
            await Tourist.update(tourist.id, { cashback_balance: (tourist.cashback_balance || 0) + cashbackEarned });
             description += ` (+R$${cashbackEarned.toFixed(2)} cashback)`;
          }
          
          setScanResult(description);
          toast({ title: "Check-in Realizado!", description: `Você fez check-in em ${qrData.name}! Benefícios aplicados.`, variant: "success" });
          
        } else {
          setScanResult("QR Code inválido para check-in.");
          toast({ title: "QR Inválido", description: "Este QR Code não parece ser para check-in.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        setScanResult("Erro ao processar o QR Code.");
        toast({ title: "Erro", description: "Não foi possível processar o check-in.", variant: "destructive" });
      }
      setProcessing(false);
    }
  };

  // Função para iniciar a câmera usando MediaDevices API
  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowScanner(true);
      setCameraError(null);
      setScanResult(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const videoElement = document.getElementById('qr-video-scanner');
        if (videoElement) {
          videoElement.srcObject = stream;
          // Aqui você precisaria integrar uma biblioteca de leitura de QR Code que funcione com um stream de vídeo
          // Ex: jsQR, zxing-js/browser. Por simplicidade, vamos simular uma leitura.
          // Em um cenário real, a biblioteca de QR Code chamaria handleScanSuccess(decodedText).
          console.log("Câmera iniciada. Integre uma lib de QR code reader aqui.");
           toast({ title: "Câmera Ativada", description: "Aponte para o QR Code do estabelecimento."});

        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
        setShowScanner(false);
      }
    } else {
      setCameraError("Seu navegador não suporta acesso à câmera.");
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    setShowScanner(false);
  }

  return (
    <div className="p-4 md:p-6">
      <BackButton />
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <QrCode className="mx-auto h-10 w-10 text-blue-600 mb-2" />
          <CardTitle className="text-2xl">Fazer Check-in</CardTitle>
          <CardDescription>Escaneie o QR Code do estabelecimento para registrar seu check-in e ganhar benefícios!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showScanner ? (
            <Button onClick={startCamera} className="w-full" disabled={processing}>
              <Video className="mr-2 h-5 w-5" /> Abrir Câmera para Escanear
            </Button>
          ) : (
            <Button onClick={stopCamera} className="w-full" variant="outline">
              <VideoOff className="mr-2 h-5 w-5" /> Fechar Câmera
            </Button>
          )}

          {showScanner && (
            <div className="border rounded-md overflow-hidden aspect-square bg-gray-900">
              {/* O elemento de vídeo para o scanner */}
              <video id="qr-video-scanner" playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
              {/* Se usar react-qr-reader:
              <QrReader
                delay={300}
                onError={(err) => { console.error(err); toast({ title: "Erro", description: "Falha ao ler QR Code.", variant:"destructive" });}}
                onScan={handleScanSuccess} // A lib chama isso quando um QR é lido
                style={{ width: '100%' }}
              /> 
              */}
            </div>
          )}
          
          {cameraError && (
            <p className="text-sm text-red-600 text-center p-3 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="inline mr-1 h-4 w-4" /> {cameraError}
            </p>
          )}

          {scanResult && (
            <div className={`p-4 rounded-md text-sm ${scanResult.includes("Erro") || scanResult.includes("inválido") ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              <p className="font-medium">Resultado:</p>
              <p>{scanResult}</p>
            </div>
          )}
          
          {processing && <p className="text-center text-blue-600">Processando check-in...</p>}

           <div className="mt-6 p-3 bg-gray-50 border rounded-md text-xs text-gray-600">
            <p><span className="font-semibold">Como funciona:</span> Aponte a câmera para o QR Code fornecido pelo comércio. Após a leitura, seu check-in será registrado e os benefícios aplicados automaticamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}