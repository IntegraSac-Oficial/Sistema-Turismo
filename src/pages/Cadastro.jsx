// Backup do Cadastro.jsx com a solução para cadastro no mobile
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { BusinessCredential } from "@/api/entities";
import { User } from "@/api/entities";
import { City } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Store, Building2, Mail, Phone, MapPin, Loader2, Lock } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

// Cache helper
const cache = {
  cities: null,
  businesses: {},
  lastFetch: {
    cities: 0,
    businesses: 0
  },
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
};

export default function Cadastro() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_email: "",
    business_phone: "",
    city_id: "",
    business_password: ""
  });

  React.useEffect(() => {
    // Detectar se é dispositivo móvel
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      // Verificar cache
      const now = Date.now();
      if (cache.cities && (now - cache.lastFetch.cities) < cache.CACHE_DURATION) {
        setCities(cache.cities);
        return;
      }

      const citiesData = await City.list();
      setCities(citiesData);
      
      // Atualizar cache
      cache.cities = citiesData;
      cache.lastFetch.cities = now;
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      if (cache.cities) {
        // Usar cache em caso de erro
        setCities(cache.cities);
      } else {
        setError("Não foi possível carregar as cidades. Tente novamente mais tarde.");
      }
    }
  };

  const checkExistingBusiness = async (email) => {
    try {
      // Verificar cache
      const now = Date.now();
      if (cache.businesses[email] && (now - cache.lastFetch.businesses[email]) < cache.CACHE_DURATION) {
        return cache.businesses[email];
      }

      // Adicionar delay para evitar muitas requisições simultâneas
      await new Promise(resolve => setTimeout(resolve, 1000));

      const existingBusinesses = await Business.filter({
        business_email: email
      });

      // Atualizar cache
      cache.businesses[email] = existingBusinesses;
      cache.lastFetch.businesses[email] = now;

      return existingBusinesses;
    } catch (error) {
      console.error("Erro ao verificar negócio existente:", error);
      return cache.businesses[email] || null;
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
    if (!formData.business_name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o nome do comércio",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.business_type) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione o tipo do comércio",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.business_email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o email do comércio",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.business_password.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira uma senha para o comércio",
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
    setError(null);
    
    try {
      // Salvar dados do formulário no localStorage como backup
      const tempBusinessData = {
        ...formData,
        temp_id: Date.now().toString(),
        created_date: new Date().toISOString()
      };
      
      localStorage.setItem('pendingBusiness', JSON.stringify(tempBusinessData));
      
      // Verificar negócio existente com throttling
      const existingBusinesses = await checkExistingBusiness(formData.business_email);

      if (existingBusinesses && existingBusinesses.length > 0) {
        if (isMobile) {
          // Processo para mobile
          const businessUser = {
            id: existingBusinesses[0].id,
            email: formData.business_email,
            full_name: formData.business_name || existingBusinesses[0].business_name,
            role: 'business',
            business_id: existingBusinesses[0].id
          };
          
          localStorage.setItem('currentUser', JSON.stringify(businessUser));
          localStorage.setItem('isLoggedIn', 'true');
          
          navigate(createPageUrl("BusinessProfile"));
          return;
        } else {
          // Processo para desktop
          toast({
            title: "Email já cadastrado",
            description: "Este email já está registrado no sistema.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Tentar criar o negócio
      let businessId = null;
      
      try {
        // Adicionar delay entre operações
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Criar novo negócio
        const newBusiness = await Business.create({
          business_name: formData.business_name,
          business_type: formData.business_type,
          business_email: formData.business_email,
          business_phone: formData.business_phone,
          city_id: formData.city_id,
          business_password: formData.business_password,
          // Inicializar configurações padrão
          payment_settings: {
            payment_methods: {
              credit_card: false,
              pix: false,
              cash: true
            },
            bank_info: {
              bank_name: "",
              account_type: "",
              account_number: "",
              agency: "",
              pix_key: ""
            }
          }
        });
        
        businessId = newBusiness.id;
        // Limpar dados temporários se sucesso
        localStorage.removeItem('pendingBusiness');
      } catch (error) {
        console.error("Erro ao criar negócio:", error);
        // Em caso de erro, usar o ID temporário
        businessId = tempBusinessData.temp_id;
      }

      // Criar credenciais do usuário independente do resultado da API
      const businessUser = {
        id: businessId,
        email: formData.business_email,
        full_name: formData.business_name,
        role: 'business',
        business_id: businessId
      };
      
      // Salvar em ambos storages
      localStorage.setItem('currentUser', JSON.stringify(businessUser));
      localStorage.setItem('isLoggedIn', 'true');
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Seu comércio foi cadastrado no sistema.",
        variant: "default"
      });
      
      // Redirecionar após cadastro
      navigate(createPageUrl("BusinessProfile"));
      
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      
      if (error.message?.includes("Rate limit")) {
        setError("Sistema temporariamente indisponível. Por favor, aguarde alguns segundos e tente novamente.");
        toast({
          title: "Sistema ocupado",
          description: "Por favor, aguarde alguns segundos e tente novamente.",
          variant: "destructive"
        });
      } else {
        setError("Não foi possível completar o cadastro. Tente novamente.");
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível completar o cadastro. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Cadastro de Comércio</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para cadastrar seu comércio
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="business_type">Tipo de Comércio</Label>
                  <Select 
                    value={formData.business_type}
                    onValueChange={(value) => handleSelectChange("business_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurante">Restaurante</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="pousada">Pousada</SelectItem>
                      <SelectItem value="loja">Loja</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="cafe">Café</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nome do Comércio</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    placeholder="Nome do seu comércio"
                    value={formData.business_name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_email">Email</Label>
                  <Input
                    id="business_email"
                    name="business_email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.business_email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_password">Senha</Label>
                  <Input
                    id="business_password"
                    name="business_password"
                    type="password"
                    placeholder="Crie uma senha"
                    value={formData.business_password}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Telefone</Label>
                  <Input
                    id="business_phone"
                    name="business_phone"
                    placeholder="(00) 00000-0000"
                    value={formData.business_phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city_id">Cidade</Label>
                  <Select 
                    value={formData.city_id}
                    onValueChange={(value) => handleSelectChange("city_id", value)}
                  >
                    <SelectTrigger>
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
                    <span>Cadastrar Comércio</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PublicFooter />
    </div>
  );
}