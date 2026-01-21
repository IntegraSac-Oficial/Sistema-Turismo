
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  QrCode,
  Wallet,
  Building2,
  Save,
  CheckCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BackButton from "@/components/ui/BackButton";

export default function BusinessPayments() {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState({
    credit_card: false,
    pix: false,
    cash: false
  });
  const [bankInfo, setBankInfo] = useState({
    bank_name: "",
    account_type: "",
    account_number: "",
    agency: "",
    pix_key: "",
    pix_key_type: "CPF"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState("methods");

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.business_id) {
        navigate(createPageUrl("EditBusiness"));
        return;
      }

      const businessData = await Business.get(currentUser.business_id);
      setBusiness(businessData);

      // Carregar configurações de pagamento
      if (businessData?.payment_settings) {
        if (businessData.payment_settings.payment_methods) {
          setPaymentMethods(businessData.payment_settings.payment_methods);
        }
        
        if (businessData.payment_settings.bank_info) {
          setBankInfo(businessData.payment_settings.bank_info);
        }
      }

    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodToggle = async (method) => {
    try {
      const newMethods = {
        ...paymentMethods,
        [method]: !paymentMethods[method]
      };

      // Atualizar localmente primeiro
      setPaymentMethods(newMethods);

      // Atualizar no servidor
      await Business.update(business.id, {
        payment_settings: {
          ...business.payment_settings,
          payment_methods: newMethods
        }
      });

      toast({
        title: "Sucesso",
        description: "Métodos de pagamento atualizados"
      });
    } catch (error) {
      // Reverter mudança local em caso de erro
      setPaymentMethods(prevMethods => ({
        ...prevMethods,
        [method]: !prevMethods[method]
      }));

      toast({
        title: "Erro",
        description: "Não foi possível atualizar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleBankInfoChange = (field, value) => {
    setBankInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveBankInfo = async () => {
    try {
      setSaving(true);

      await Business.update(business.id, {
        payment_settings: {
          ...business.payment_settings,
          bank_info: bankInfo
        }
      });

      toast({
        title: "Dados salvos",
        description: "Informações bancárias atualizadas com sucesso",
        variant: "success"
      });
    } catch (error) {
      console.error("Erro ao salvar dados bancários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as informações bancárias",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <BackButton />
      <Tabs defaultValue="methods" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="methods">
            <CreditCard className="w-4 h-4 mr-2" />
            Métodos de Pagamento
          </TabsTrigger>
          <TabsTrigger value="bank">
            <Building2 className="w-4 h-4 mr-2" />
            Dados Bancários
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">Cartão de Crédito</h3>
                      <p className="text-sm text-gray-500">Aceitar pagamentos com cartão</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.credit_card}
                    onCheckedChange={() => handlePaymentMethodToggle('credit_card')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">PIX</h3>
                      <p className="text-sm text-gray-500">Pagamentos instantâneos via PIX</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.pix}
                    onCheckedChange={() => handlePaymentMethodToggle('pix')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">Dinheiro</h3>
                      <p className="text-sm text-gray-500">Aceitar pagamentos em espécie</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.cash}
                    onCheckedChange={() => handlePaymentMethodToggle('cash')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Nome do Banco</Label>
                  <Input
                    id="bank_name"
                    value={bankInfo.bank_name}
                    onChange={(e) => handleBankInfoChange('bank_name', e.target.value)}
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                
                <div>
                  <Label htmlFor="account_type">Tipo de Conta</Label>
                  <Input
                    id="account_type"
                    value={bankInfo.account_type}
                    onChange={(e) => handleBankInfoChange('account_type', e.target.value)}
                    placeholder="Ex: Corrente, Poupança"
                  />
                </div>
                
                <div>
                  <Label htmlFor="agency">Agência</Label>
                  <Input
                    id="agency"
                    value={bankInfo.agency}
                    onChange={(e) => handleBankInfoChange('agency', e.target.value)}
                    placeholder="0000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="account_number">Número da Conta</Label>
                  <Input
                    id="account_number"
                    value={bankInfo.account_number}
                    onChange={(e) => handleBankInfoChange('account_number', e.target.value)}
                    placeholder="00000-0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pix_key_type">Tipo de Chave PIX</Label>
                  <Select
                    value={bankInfo.pix_key_type || "CPF"}
                    onValueChange={(value) => handleBankInfoChange('pix_key_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                      <SelectItem value="EMAIL">E-mail</SelectItem>
                      <SelectItem value="TELEFONE">Telefone</SelectItem>
                      <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pix_key">Chave PIX</Label>
                  <Input
                    id="pix_key"
                    value={bankInfo.pix_key}
                    onChange={(e) => handleBankInfoChange('pix_key', e.target.value)}
                    placeholder="Informe sua chave PIX"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={saveBankInfo} 
                  disabled={saving}
                  className="flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Dados Bancários
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
