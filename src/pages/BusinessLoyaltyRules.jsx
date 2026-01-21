
import React, { useState, useEffect } from 'react';
import { LoyaltyRule } from '@/api/entities';
import { Business } from '@/api/entities'; // Para pegar o ID do business logado
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit3, Trash2, ListChecks, Percent, Coins, Loader2 } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

export default function BusinessLoyaltyRules() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentRule, setCurrentRule] = useState(null); // Para edição

  const [formState, setFormState] = useState({ // Renomeado de newRuleData para formState
    rule_type: 'cashback_percentage',
    value: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    const fetchBusinessAndRules = async () => {
      setIsLoading(true);
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          toast({ title: "Erro", description: "Usuário não logado.", variant: "destructive" });
          setIsLoading(false); // Parar loading se não houver usuário
          return;
        }
        const currentUser = JSON.parse(currentUserStr);
        if (!currentUser.business_id) {
          toast({ title: "Erro", description: "Nenhum comércio associado a este usuário.", variant: "destructive" });
          setIsLoading(false); // Parar loading se não houver ID do comércio
          return;
        }
        setBusinessId(currentUser.business_id);

        const fetchedRules = await LoyaltyRule.filter({ business_id: currentUser.business_id });
        setRules(fetchedRules || []);
      } catch (error) {
        console.error("Erro ao buscar regras de fidelidade:", error);
        toast({ title: "Erro ao buscar regras", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessAndRules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormState({
      rule_type: 'cashback_percentage',
      value: '',
      description: '',
      is_active: true,
    });
    setCurrentRule(null); // Limpar currentRule também
  };
  
  const handleAddNewRule = () => {
    setCurrentRule(null); // Garante que não estamos editando
    resetForm(); // Limpa o formulário para uma nova regra
    setShowForm(true);
  };

  const handleEditRule = (rule) => {
    setCurrentRule(rule);
    setFormState({
      rule_type: rule.rule_type,
      value: rule.value.toString(), // Converter para string para o input
      description: rule.description,
      is_active: rule.is_active,
    });
    setShowForm(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta regra?")) return;
    setIsLoading(true);
    try {
      await LoyaltyRule.delete(ruleId);
      setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
      toast({ title: "Sucesso", description: "Regra excluída com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir regra:", error);
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!businessId) {
      toast({ title: "Erro", description: "ID do comércio não encontrado.", variant: "destructive" });
      return;
    }
    if (!formState.description.trim()) {
        toast({ title: "Campo obrigatório", description: "Por favor, adicione uma descrição para a regra.", variant: "destructive" });
        return;
    }
    if (formState.value === '' || isNaN(parseFloat(formState.value))) {
        toast({ title: "Valor inválido", description: "Por favor, insira um valor numérico para a regra.", variant: "destructive" });
        return;
    }


    setIsLoading(true);
    const rulePayload = {
      ...formState,
      business_id: businessId,
      value: parseFloat(formState.value), // Garantir que é float
    };

    try {
      if (currentRule && currentRule.id) { // Editando regra existente
        const updatedRule = await LoyaltyRule.update(currentRule.id, rulePayload);
        setRules(prevRules => prevRules.map(r => r.id === currentRule.id ? updatedRule : r));
        toast({ title: "Sucesso", description: "Regra atualizada com sucesso." });
      } else { // Criando nova regra
        const newRule = await LoyaltyRule.create(rulePayload);
        setRules(prevRules => [...prevRules, newRule]);
        toast({ title: "Sucesso", description: "Nova regra criada com sucesso." });
      }
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar regra:", error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  
  const renderRuleCard = (rule) => (
    <Card key={rule.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {rule.rule_type === 'cashback_percentage' ? 
                <Percent className="mr-2 h-5 w-5 text-green-600" /> : 
                <Coins className="mr-2 h-5 w-5 text-yellow-600" />}
              {rule.rule_type === 'cashback_percentage' ? `${rule.value * 100}% Cashback` : `${rule.value} Ponto(s) por R$1`} 
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">{rule.description}</CardDescription>
          </div>
          <Badge variant={rule.is_active ? "default" : "outline"} className={rule.is_active ? "bg-green-500 text-white" : "border-gray-400 text-gray-500"}>
            {rule.is_active ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
          <Edit3 className="mr-1 h-4 w-4" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>
          <Trash2 className="mr-1 h-4 w-4" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  );


  if (showForm) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">
        <BackButton onClick={() => { setShowForm(false); resetForm(); }} />
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{currentRule ? "Editar Regra de Fidelidade" : "Nova Regra de Fidelidade"}</CardTitle>
            <CardDescription>
              {currentRule ? "Modifique os detalhes da sua regra de fidelidade." : "Defina como seus clientes ganharão pontos ou cashback."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitForm}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Regra</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Ex: Cashback especial de final de semana"
                  value={formState.description}
                  onChange={handleInputChange}
                  required
                />
                 <p className="text-xs text-gray-500">Aparecerá para o cliente no histórico de transações.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rule_type">Tipo da Regra</Label>
                  <Select
                    name="rule_type"
                    value={formState.rule_type}
                    onValueChange={(value) => handleSelectChange("rule_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashback_percentage">Cashback (%)</SelectItem>
                      <SelectItem value="points_per_purchase">Pontos por Compra (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    {formState.rule_type === 'cashback_percentage' ? 'Percentual de Cashback (%)' : 'Pontos por R$ 1,00 Gasto'}
                  </Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    step={formState.rule_type === 'cashback_percentage' ? "0.01" : "0.1"}
                    placeholder={formState.rule_type === 'cashback_percentage' ? "Ex: 0.10 (para 10%)" : "Ex: 1 (1 ponto por R$1)"}
                    value={formState.value}
                    onChange={handleInputChange}
                    required
                  />
                   {formState.rule_type === 'cashback_percentage' && <p className="text-xs text-gray-500">Use decimais: 0.05 para 5%, 0.1 para 10%.</p>}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  checked={formState.is_active}
                  onCheckedChange={(checked) => handleSelectChange("is_active", checked)}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Regra Ativa
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-6">
              <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentRule ? "Salvar Alterações" : "Criar Regra"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <BackButton />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <ListChecks className="mr-3 h-8 w-8 text-blue-600" />
            Minhas Regras de Fidelidade
          </h1>
          <p className="text-gray-600 mt-1">Gerencie como seus clientes acumulam pontos e cashback.</p>
        </div>
        <Button onClick={handleAddNewRule} className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-5 w-5" />
          Nova Regra
        </Button>
      </div>

      {isLoading && rules.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="ml-3 text-gray-600">Carregando regras...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <ListChecks className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma regra de fidelidade encontrada.</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Crie sua primeira regra para começar a recompensar seus clientes e incentivar a fidelidade!
          </p>
          <Button onClick={handleAddNewRule} className="bg-orange-500 hover:bg-orange-600">
            <PlusCircle className="mr-2 h-5 w-5" />
            Criar Minha Primeira Regra
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map(renderRuleCard)}
        </div>
      )}
    </div>
  );
}
