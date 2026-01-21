import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Realtor } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { Property } from "@/api/entities";
import { City } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Crown,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Home,
  Loader2
} from "lucide-react";

export default function RealtorDetail() {
  const [realtor, setRealtor] = useState(null);
  const [properties, setProperties] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [city, setCity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const realtorId = urlParams.get('id');
      
      if (!realtorId) {
        toast({
          title: "Erro",
          description: "ID da imobiliária não encontrado",
          variant: "destructive"
        });
        navigate(createPageUrl("Realtors"));
        return;
      }

      const realtorData = await Realtor.get(realtorId);
      setRealtor(realtorData);
      
      if (realtorData.city_id) {
        try {
          const cityData = await City.get(realtorData.city_id);
          setCity(cityData);
        } catch (err) {
          console.error("Erro ao carregar cidade:", err);
        }
      }

      const plansData = await SubscriptionPlan.list();
      const realtorPlans = plansData.filter(plan => plan.plan_type === "realtor" && plan.is_active);
      setPlans(realtorPlans);

      const propertiesData = await Property.filter({ realtor_id: realtorId });
      setProperties(propertiesData || []);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Erro",
        description: "Selecione um plano",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      if (!selectedPlan) {
        toast({ title: "Erro", description: "Plano selecionado não encontrado.", variant: "destructive" });
        return;
      }
      
      const updateData = {
        subscription_plan_id: selectedPlanId,
        subscription_status: "active", // Ao vincular um plano, ele se torna ativo
        max_active_listings: selectedPlan.max_listings || realtor.max_active_listings || 0,
        featured_listings_available: selectedPlan.featured_listings || realtor.featured_listings_available || 0,
        status: "approved" // Aprova automaticamente ao vincular um plano
      };
      
      await Realtor.update(realtor.id, updateData);

      toast({
        title: "Sucesso",
        description: `Plano "${selectedPlan.name}" vinculado e imobiliária ativada com sucesso.`,
      });

      setShowPlanDialog(false);
      loadData(); // Recarrega os dados para refletir a mudança
    } catch (error) {
      console.error("Erro ao vincular plano:", error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o plano",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = realtor.status === "approved" ? "pending" : "approved";
      const newSubscriptionStatus = newStatus === "approved" ? (realtor.subscription_plan_id ? "active" : "trial") : "pending";

      await Realtor.update(realtor.id, {
        status: newStatus,
        subscription_status: newSubscriptionStatus
      });

      toast({
        title: "Sucesso",
        description: `Status da imobiliária alterado para ${newStatus === "approved" ? "Aprovado" : "Pendente"}.`,
      });

      loadData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao alterar status da imobiliária:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da imobiliária",
        variant: "destructive"
      });
    }
  };
  
  const handleExtendPeriod = async () => {
    try {
      const currentDate = new Date();
      const extendedDate = new Date();
      extendedDate.setMonth(currentDate.getMonth() + 3);
      
      await Realtor.update(realtor.id, {
        subscription_status: "active", // Garante que o status da assinatura seja ativo
        status: "approved", // Garante que o status do perfil seja aprovado
        subscription_end_date: extendedDate.toISOString().split('T')[0]
      });

      toast({
        title: "Sucesso",
        description: "Período estendido por mais 3 meses e status atualizado para ativo/aprovado.",
      });

      loadData();
    } catch (error) {
      console.error("Erro ao estender período:", error);
      toast({
        title: "Erro",
        description: "Não foi possível estender o período",
        variant: "destructive"
      });
    }
  };

  const getSubscriptionPlanName = (planId) => {
    if (!planId || plans.length === 0) return "Nenhum plano";
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : "Plano não encontrado";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <p>Carregando dados da imobiliária...</p>
      </div>
    );
  }

  if (!realtor) {
    return (
      <div className="p-6">
        <BackButton />
        <div className="text-center py-8">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Imobiliária não encontrada</h2>
          <p className="text-gray-500 mb-4">Não foi possível encontrar esta imobiliária.</p>
          <Button onClick={() => navigate(createPageUrl("Realtors"))}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }
  
  const currentPlanName = realtor.subscription_plan_id ? getSubscriptionPlanName(realtor.subscription_plan_id) : (realtor.subscription_status === 'trial' ? 'Período de Teste' : 'Sem plano');
  const badgeClass = realtor.status === "approved" ? "bg-green-600" : realtor.status === "pending" ? "bg-yellow-600" : "bg-red-600";
  const statusText = realtor.status === "approved" ? "Aprovado" : realtor.status === "pending" ? "Pendente" : "Rejeitado";
  const subscriptionBadgeClass = realtor.subscription_status === "active" ? "bg-green-600" : realtor.subscription_status === "pending" || realtor.subscription_status === "trial" ? "bg-yellow-600" : "bg-red-500";
  const subscriptionStatusText = realtor.subscription_status === "active" ? "Ativa" : realtor.subscription_status === "pending" ? "Pendente" : realtor.subscription_status === "expired" ? "Expirada" : realtor.subscription_status === "trial" ? "Teste" : "Inativa";


  return (
    <div className="p-6">
      <BackButton />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{realtor.company_name}</h1>
            <p className="text-gray-500 flex items-center mt-1">
              <Mail className="w-4 h-4 mr-1" /> {realtor.email}
            </p>
            <p className="text-gray-500 flex items-center mt-1">
              <Phone className="w-4 h-4 mr-1" /> {realtor.phone}
            </p>
            {city && (
              <p className="text-gray-500 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" /> {city.name}
              </p>
            )}
             {realtor.creci && (
              <p className="text-gray-500 flex items-center mt-1">
                CRECI: {realtor.creci}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge className={badgeClass}>
              Perfil: {statusText}
            </Badge>
             <Badge className={subscriptionBadgeClass}>
              Assinatura: {subscriptionStatusText}
            </Badge>
          </div>
        </div>
        
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Status e Plano</span>
                 <Button onClick={handleToggleStatus} variant={realtor.status === "approved" ? "destructive" : "default"}>
                  {realtor.status === "approved" ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {realtor.status === "approved" ? "Desativar" : "Ativar"} Imobiliária
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Status do Perfil:</span>
                    <Badge className={badgeClass}>{statusText}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Status da Assinatura:</span>
                     <Badge className={subscriptionBadgeClass}>{subscriptionStatusText}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Plano Atual:</span>
                    <span>{currentPlanName}</span>
                  </div>
                   {realtor.subscription_end_date && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4"/>
                        <span>Válido até: {new Date(realtor.subscription_end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    )}
                </div>
                <div className="space-y-2">
                  <Button onClick={() => setShowPlanDialog(true)} className="w-full">
                    <Crown className="w-4 h-4 mr-2" />
                    {realtor.subscription_plan_id ? "Alterar Plano" : "Vincular Plano"}
                  </Button>
                  
                  <Button onClick={handleExtendPeriod} variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Estender Período (3 meses)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Imóveis ({properties.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Esta imobiliária ainda não possui imóveis cadastrados.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {properties.map(property => (
                    <div key={property.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{property.title}</h3>
                        <p className="text-sm text-gray-500">{property.property_type === 'sale' ? 'Venda' : property.property_type === 'rent' ? 'Aluguel' : 'Temporada'} - R$ {property.price?.toLocaleString('pt-BR')}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(createPageUrl(`PropertyDetail?id=${property.id}`))}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Plano à Imobiliária</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.length > 0 ? plans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - R$ {plan.price} ({plan.period}) - {plan.max_listings} anúncios
                  </SelectItem>
                )) : (
                  <div className="p-4 text-center text-gray-500">Nenhum plano de imobiliária ativo encontrado.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={plans.length === 0 || !selectedPlanId}>
              Vincular Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}