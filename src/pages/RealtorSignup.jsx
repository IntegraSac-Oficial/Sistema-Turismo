
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Realtor } from "@/api/entities";
import { User } from "@/api/entities";
import { City } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Building2, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function RealtorSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    phone: "",
    city_id: "",
    creci: "" // opcional
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Carregar cidades
      const citiesData = await City.list();
      setCities(citiesData || []);
      
      // Verificar se já está logado
      const storedUser = localStorage.getItem('currentUser');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (storedUser && isLoggedIn) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome da imobiliária/corretor",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o email",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, crie uma senha",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o telefone",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.city_id) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione a cidade",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Salvar dados do formulário no localStorage como backup
      const tempRealtorData = {
        ...formData,
        temp_id: Date.now().toString(),
        created_date: new Date().toISOString()
      };
      
      localStorage.setItem('pendingRealtor', JSON.stringify(tempRealtorData));
      
      // 1. Primeiro criar um usuário temporário
      let userId = `temp_${Date.now()}`;
      
      // Verificar se já existe um corretor com este email
      const existingRealtors = await Realtor.filter({
        email: formData.email
      });

      if (existingRealtors && existingRealtors.length > 0) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está registrado no sistema.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // 2. Criar novo corretor - AGORA COM STATUS "APPROVED" POR PADRÃO
      const newRealtor = await Realtor.create({
        user_id: userId,
        company_name: formData.company_name,
        email: formData.email,
        phone: formData.phone,
        city_id: formData.city_id,
        creci: formData.creci || "",
        status: "approved", // MUDANÇA AQUI: Status approved em vez de pending
        subscription_status: "trial",
        max_active_listings: 15 // Aumentamos o limite para trial
      });

      // 3. Configurar informações no localStorage
      const realtorUser = {
        id: userId,
        email: formData.email,
        full_name: formData.company_name,
        role: 'realtor',
        realtor_id: newRealtor.id,
        password: formData.password // Importante: salvar senha para autenticação local
      };
      
      // Salvar em localStorage para persistir a autenticação
      localStorage.setItem('currentUser', JSON.stringify(realtorUser));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('realtorPassword_' + formData.email, formData.password); // Salvar senha separadamente
      sessionStorage.setItem('currentUser', JSON.stringify(realtorUser));
      sessionStorage.setItem('isLoggedIn', 'true');
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Seu perfil de corretor foi criado. Você já pode começar a cadastrar imóveis!",
      });
      
      // Redirecionar para o dashboard de corretor
      navigate(createPageUrl("RealtorDashboard"));
      
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast({
        title: "Erro no cadastro",
        description: `Não foi possível completar o cadastro: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} currentUser={currentUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Cadastro de Imobiliária/Corretor</CardTitle>
              <CardDescription>
                Crie sua conta para anunciar imóveis e alcançar mais clientes.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Imobiliária/Corretor</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <Input
                      id="company_name"
                      name="company_name"
                      placeholder="Nome da sua imobiliária ou seu nome"
                      className="pl-10"
                      value={formData.company_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Crie uma senha"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <Select
                      value={formData.city_id}
                      onValueChange={(value) => handleSelectChange("city_id", value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creci">CRECI (Opcional)</Label>
                  <Input
                    id="creci"
                    name="creci"
                    placeholder="Número do seu CRECI"
                    value={formData.creci}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Cadastrar Imobiliária'
                    )}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  Ao se cadastrar, você concorda com nossos termos de serviço e política de privacidade.
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
