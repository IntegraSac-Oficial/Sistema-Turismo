import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { SubscriptionPlan } from "@/api/entities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function SubscriptionPlanConfig() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState(null);
  const [stripeLink, setStripeLink] = useState("");
  const [formData, setFormData] = useState({
    stripe_price_id: ""
  });

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        navigate(createPageUrl("SubscriptionPlansAdmin"));
        return;
      }

      try {
        const planData = await SubscriptionPlan.get(planId);
        setPlan(planData);
        setFormData({
          stripe_price_id: planData.stripe_price_id || ""
        });
      } catch (error) {
        console.error("Erro ao carregar plano:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do plano",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.stripe_price_id) {
      toast({
        title: "Erro de validação",
        description: "O ID do preço Stripe é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.stripe_price_id.startsWith("price_")) {
      toast({
        title: "Formato inválido",
        description: "O ID do preço Stripe deve começar com 'price_'",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await SubscriptionPlan.update(planId, {
        stripe_price_id: formData.stripe_price_id
      });
      
      toast({
        title: "Sucesso",
        description: "Configuração do Stripe salva com sucesso",
        variant: "success"
      });
      
      navigate(createPageUrl("SubscriptionPlansAdmin"));
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container p-4 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(createPageUrl("SubscriptionPlansAdmin"))}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurar Stripe para "{plan.name}"</CardTitle>
          <CardDescription>
            Configure o ID de preço do Stripe para habilitar pagamentos online neste plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stripe_price_id">ID do Preço no Stripe</Label>
                <a 
                  href="https://dashboard.stripe.com/products" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  Abrir painel Stripe
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
              <Input
                id="stripe_price_id"
                name="stripe_price_id"
                value={formData.stripe_price_id}
                onChange={handleInputChange}
                placeholder="Exemplo: price_1Abc123Def456Ghi789Jkl"
                className="font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                Este ID é gerado automaticamente pelo Stripe ao criar um produto e preço.
                Deve começar com "price_".
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-800 mb-2">Como configurar:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
                <li>Acesse o <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="underline">painel do Stripe</a></li>
                <li>Clique em "Adicionar produto"</li>
                <li>Preencha o nome: "{plan.name}" e definições do produto</li>
                <li>Em "Preço", defina o valor como R$ {plan.price.toFixed(2)}</li>
                <li>Em "Recorrente", selecione a opção "{plan.period}"</li>
                <li>Após salvar, copie o ID do preço que começa com "price_"</li>
                <li>Cole o ID no campo acima</li>
              </ol>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-[#007BFF] hover:bg-blue-700">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configuração
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}