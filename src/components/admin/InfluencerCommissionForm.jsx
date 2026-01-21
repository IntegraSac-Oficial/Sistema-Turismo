import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/api/entities";
import { Influencer } from "@/api/entities";
import { InfluencerCommission } from "@/api/entities";
import { CommissionRate } from "@/api/entities";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, DollarSign, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function InfluencerCommissionForm({ onSuccess }) {
  const [users, setUsers] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    user_id: "",
    plan_type: "",
    plan_name: "",
    plan_amount: "",
    payment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar usuários que possuem referral_source
        const allUsers = await User.list();
        const usersWithReferral = allUsers.filter(user => user.referral_source);
        setUsers(usersWithReferral);
        
        // Carregar influenciadores
        const allInfluencers = await Influencer.list();
        setInfluencers(allInfluencers);
        
        // Carregar taxas de comissão
        const allRates = await CommissionRate.list();
        setRates(allRates);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };
  
  const calculateCommission = () => {
    const amount = parseFloat(formData.plan_amount);
    if (isNaN(amount) || amount <= 0) return 0;
    
    const rate = rates.find(r => r.plan_type === formData.plan_type && r.is_active);
    if (!rate) return 0;
    
    return (amount * rate.commission_percentage / 100).toFixed(2);
  };
  
  const findInfluencerByReferralCode = (code) => {
    return influencers.find(influencer => influencer.code === code);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    try {
      setIsSubmitting(true);
      
      // Validações
      if (!formData.user_id) {
        throw new Error("Selecione um usuário");
      }
      
      if (!formData.plan_type) {
        throw new Error("Selecione o tipo de plano");
      }
      
      if (!formData.plan_name) {
        throw new Error("Informe o nome do plano");
      }
      
      const planAmount = parseFloat(formData.plan_amount);
      if (isNaN(planAmount) || planAmount <= 0) {
        throw new Error("Informe um valor válido para o plano");
      }
      
      // Buscar o usuário selecionado
      const selectedUser = users.find(user => user.id === formData.user_id);
      if (!selectedUser || !selectedUser.referral_source) {
        throw new Error("Usuário não possui referência de influenciador");
      }
      
      // Buscar o influenciador pelo código de referência
      const influencer = findInfluencerByReferralCode(selectedUser.referral_source);
      if (!influencer) {
        throw new Error("Influenciador não encontrado para este código de referência");
      }
      
      // Buscar a taxa de comissão para este tipo de plano
      const rate = rates.find(r => r.plan_type === formData.plan_type && r.is_active);
      if (!rate) {
        throw new Error("Taxa de comissão não configurada para este tipo de plano");
      }
      
      // Calcular a comissão
      const commissionAmount = planAmount * rate.commission_percentage / 100;
      
      // Criar a comissão
      const commissionData = {
        influencer_id: influencer.id,
        user_id: selectedUser.id,
        plan_type: formData.plan_type,
        plan_name: formData.plan_name,
        plan_amount: planAmount,
        commission_amount: commissionAmount,
        commission_percentage: rate.commission_percentage,
        payment_date: formData.payment_date,
        status: "pending" // status inicial
      };
      
      const commission = await InfluencerCommission.create(commissionData);
      
      // Atualizar o saldo do influenciador
      const updatedBalance = (influencer.balance || 0) + commissionAmount;
      await Influencer.update(influencer.id, { 
        balance: updatedBalance,
        total_earned: (influencer.total_earned || 0) + commissionAmount
      });
      
      // Atualizar o status da comissão para "credited"
      await InfluencerCommission.update(commission.id, { status: "credited" });
      
      setSuccess(true);
      
      // Limpar o formulário
      setFormData({
        user_id: "",
        plan_type: "",
        plan_name: "",
        plan_amount: "",
        payment_date: new Date().toISOString().split('T')[0]
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Erro ao registrar comissão:", error);
      setError(error.message || "Erro ao registrar comissão. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Carregando formulário...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Registrar Comissão de Influenciador
        </CardTitle>
        <CardDescription>
          Registre uma comissão para um influenciador quando um usuário indicado realiza uma compra.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="bg-green-50 p-4 rounded-md flex items-start text-green-800 mb-4">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Comissão registrada com sucesso!</p>
              <p className="text-sm mt-1">
                A comissão foi registrada e o saldo do influenciador foi atualizado.
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-green-800 font-medium"
                onClick={() => setSuccess(false)}
              >
                Registrar outra comissão
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user_id">Usuário Indicado</Label>
                <Select 
                  value={formData.user_id} 
                  onValueChange={(value) => handleSelectChange("user_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.user_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Código de referência: {users.find(u => u.id === formData.user_id)?.referral_source}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="plan_type">Tipo de Plano</Label>
                <Select 
                  value={formData.plan_type} 
                  onValueChange={(value) => handleSelectChange("plan_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Plano Comercial</SelectItem>
                    <SelectItem value="providers">Plano Prestador</SelectItem>
                    <SelectItem value="club">Clube Assinante</SelectItem>
                    <SelectItem value="properties">Imóveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="plan_name">Nome do Plano</Label>
                <Input
                  id="plan_name"
                  name="plan_name"
                  value={formData.plan_name}
                  onChange={handleChange}
                  placeholder="Ex: Plano Premium Anual"
                />
              </div>
              
              <div>
                <Label htmlFor="plan_amount">Valor do Plano (R$)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="plan_amount"
                    name="plan_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.plan_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="payment_date">Data do Pagamento</Label>
                <Input
                  id="payment_date"
                  name="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label>Comissão Calculada</Label>
                <div className="p-2.5 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Comissão:</span>
                    <span className="font-medium text-green-700">
                      R$ {calculateCommission()}
                    </span>
                  </div>
                  {formData.plan_type && (
                    <div className="text-xs text-gray-500 mt-1">
                      Taxa de {rates.find(r => r.plan_type === formData.plan_type)?.commission_percentage || 0}%
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-center text-red-800">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Registrar Comissão"
              )}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 text-sm text-gray-500 flex justify-between border-t">
        <p>
          As comissões são creditadas imediatamente na carteira dos influenciadores.
        </p>
      </CardFooter>
    </Card>
  );
}