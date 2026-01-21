
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Download, 
  Share2,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, addYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User } from "@/api/entities";
import { Tourist } from "@/api/entities";
import { Influencer } from "@/api/entities";
import { UserSubscription } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { SiteConfig } from "@/api/entities"; // Importar SiteConfig

export default function MembershipCard() {
  const [userData, setUserData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [memberCode, setMemberCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [validityDate, setValidityDate] = useState("Indefinida");
  const [siteName, setSiteName] = useState("Praias Catarinenses");
  const [logoUrl, setLogoUrl] = useState("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/logo-sc.png"); // URL padrão

  useEffect(() => {
    const loadSiteConfiguration = async () => {
      try {
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          const config = configs[0];
          if (config.geral?.site_name) {
            setSiteName(config.geral.site_name);
          }
          if (config.aparencia?.logo_url) {
            setLogoUrl(config.aparencia.logo_url);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do site:", error);
        // Mantém os valores padrão se houver erro
      }
    };
    loadSiteConfiguration();
  }, []);


  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          navigate(createPageUrl("UserAccount"));
          return;
        }

        const user = JSON.parse(storedUser);
        setUserData(user);

        let memberData = null;
        let code = "";
        
        // Baseado no papel do usuário, carrega os dados adequados
        if (user.role === 'tourist') {
          try {
            const tourist = await Tourist.get(user.tourist_id);
            if (tourist) {
              memberData = tourist;
              code = tourist.user_code || `TRST-${Math.floor(100000 + Math.random() * 900000)}`;
              setMemberCode(code);
              setMemberName(tourist.name || user.full_name);
            }
          } catch (err) {
            console.error("Erro ao carregar dados do turista:", err);
          }
        } else if (user.role === 'influencer') {
          try {
            const influencer = await Influencer.get(user.influencer_id);
            if (influencer) {
              memberData = influencer;
              code = influencer.code || `${Math.floor(100000 + Math.random() * 900000)}`;
              setMemberCode(code); 
              setMemberName(influencer.name || user.full_name);
            }
          } catch (err) {
            console.error("Erro ao carregar dados do influenciador:", err);
          }
        }

        // Se não conseguiu carregar os dados específicos, usa os dados do usuário
        if (!memberData) {
          setMemberName(user.full_name || "Membro");
          code = `MBR-${Math.floor(100000 + Math.random() * 900000)}`;
          setMemberCode(code);
        }

        // Busca plano
        const plans = await SubscriptionPlan.list();
        let selectedPlan = null;

        if (user.role === 'influencer') {
          // Para influenciadores, busca plano "Básico"
          selectedPlan = plans.find(p => p.name.toLowerCase().includes('básico'));
        } else {
          // Para turistas, busca plano "Padrão"
          selectedPlan = plans.find(p => p.name.toLowerCase().includes('padrão'));
        }
        
        // Se não encontrar o plano específico, usa o primeiro da lista
        if (!selectedPlan && plans && plans.length > 0) {
          selectedPlan = plans[0];
        }
        setPlan(selectedPlan);
          
        // Define validade para 1 ano para todos
        const oneYearFromNow = addYears(new Date(), 1);
        setValidityDate(format(oneYearFromNow, 'dd/MM/yyyy', { locale: ptBR }));
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Não foi possível carregar seus dados. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Função para compartilhar o cartão
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Cartão TurismoSC',
          text: `Meu código de membro TurismoSC: ${memberCode}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`Meu código de membro TurismoSC: ${memberCode} - ${window.location.href}`);
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.error('Falha ao copiar texto:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Carregando seu cartão de membro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Link 
          to={createPageUrl("UserAccount")}
          className="inline-flex items-center text-blue-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Minha Conta
        </Link>
        
        <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow-md text-center">
          <CreditCard className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Erro ao Carregar Cartão</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link 
        to={createPageUrl("UserAccount")}
        className="inline-flex items-center text-blue-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Minha Conta
      </Link>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Carteirinha de Membro</h1>
        
        {/* Card do usuário */}
        <div className="relative mx-auto mb-8">
          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center">
                <div className="bg-white rounded-full p-1 h-12 w-12 flex items-center justify-center">
                  <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                </div>
                <div className="ml-3">
                  <h2 className="font-bold">{siteName}</h2>
                  <p className="text-sm opacity-90">Cartão de Membro Oficial</p>
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(memberCode)}&size=100x100&margin=0`}
                  alt="QR Code" 
                  className="h-10 w-10"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs uppercase opacity-80">NOME DO MEMBRO</p>
              <p className="font-bold text-xl">{memberName}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="opacity-80 text-xs">Nº DO CARTÃO</p>
                <p className="font-bold">{memberCode}</p>
              </div>
              <div>
                <p className="opacity-80 text-xs">PLANO</p>
                <p className="font-bold">{(plan?.name || "Básico")}</p>
              </div>
              <div>
                <p className="opacity-80 text-xs">VALIDADE</p>
                <p className="font-bold">{validityDate}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mb-8">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Como Usar Seu Cartão
          </h2>
          
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 mr-2">1</span>
              <p>Apresente seu código de membro em estabelecimentos parceiros</p>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 mr-2">2</span>
              <p>Ganhe descontos especiais e acumule pontos em suas compras</p>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 mr-2">3</span>
              <p>Utilize seu cartão em todos os comércios parceiros em Santa Catarina</p>
            </li>
          </ul>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Esta é uma versão digital do seu cartão de membro.<br/>
            Para mais informações, entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}
