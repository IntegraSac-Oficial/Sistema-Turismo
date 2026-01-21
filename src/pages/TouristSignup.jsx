import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tourist } from "@/api/entities";
import { City } from "@/api/entities";
import { SiteConfig } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { User as UserIcon, Mail, Phone, MapPin, Loader2, Heart, Lock } from "lucide-react"; // Adicionar Lock
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

// Função para gerar um user_code simples
const generateUserCode = () => {
  return `TRST-${Date.now().toString().slice(-6)}`;
};

export default function TouristSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [siteConfig, setSiteConfig] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "", // Senha coletada mas não usada diretamente na entidade Tourist ainda
    city_id: "",
    interests: []
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
        const citiesData = await City.list();
        setCities(citiesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    loadInitialData();
  }, []);

  const interestOptions = [
    { value: "praias", label: "Praias" },
    { value: "gastronomia", label: "Gastronomia" },
    { value: "aventura", label: "Aventura" },
    { value: "natureza", label: "Natureza" },
    { value: "cultura", label: "Cultura" },
    { value: "eventos", label: "Eventos" },
    { value: "compras", label: "Compras" }
  ];

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

  const handleInterestChange = (interest, checked) => {
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      } else {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      }
    });
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu nome completo",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe um email válido",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.password.trim() || formData.password.trim().length < 6) {
      toast({
        title: "Campo obrigatório",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return false;
    }

    if (!acceptedTerms) {
      toast({
        title: "Termos não aceitos",
        description: "É necessário aceitar os termos para continuar",
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
      // Verificar se o email já existe na entidade Tourist
      const existingTouristsByEmail = await Tourist.filter({ email: formData.email.trim().toLowerCase() });
      if (existingTouristsByEmail && existingTouristsByEmail.length > 0) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está registrado no sistema. Tente fazer login.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Criar usuário temporário (simular criação de conta)
      // O user_id idealmente viria da entidade User após um cadastro real.
      // Por enquanto, vamos manter a simulação ou usar um ID único.
      const tempUserId = `temp_user_${Date.now()}`; // Simulação de ID de usuário
      const newUserCode = generateUserCode();

      // Criar o registro de Turista
      const newTouristData = {
        user_id: tempUserId, // Este campo precisa ser bem definido no futuro
        name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        is_club_member: false,
        user_code: newUserCode,
        // password_hash: // Aqui seria o hash da formData.password, se fôssemos implementar auth completo
        points_balance: 0,
        cashback_balance: 0
      };
      
      const createdTourist = await Tourist.create(newTouristData);
      
      // Simular login do usuário (em produção seria feito pelo auth system)
      const userDataForStorage = {
        id: createdTourist.id, // Usar o ID retornado pela criação do Tourist
        full_name: createdTourist.name,
        email: createdTourist.email,
        role: 'tourist',
        tourist_id: createdTourist.id,
        user_code: createdTourist.user_code,
        points_balance: createdTourist.points_balance,
        cashback_balance: createdTourist.cashback_balance
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userDataForStorage));
      localStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('currentUser', JSON.stringify(userDataForStorage)); // Consistência
      sessionStorage.setItem('isLoggedIn', 'true');
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Praias Catarinenses!"
      });
      
      navigate(createPageUrl("UserProfile")); // Redirecionar para o perfil do turista
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      const errorMessage = error.response?.data?.message || error.message || "Não foi possível completar seu cadastro.";
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader siteConfig={siteConfig} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Cadastro de Turista</CardTitle>
              <CardDescription>
                Crie sua conta para acessar benefícios exclusivos, favoritar locais e receber recomendações personalizadas.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Seu nome completo"
                      className="pl-10"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Crie uma senha (mín. 6 caracteres)"
                      className="pl-10"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (Opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                  <Label htmlFor="city">Cidade de Residência (Opcional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Select
                      value={formData.city_id}
                      onValueChange={(value) => handleSelectChange("city_id", value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Selecione sua cidade" />
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
                  <Label>Interesses (Opcional)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <div key={interest.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${interest.value}`}
                          checked={formData.interests.includes(interest.value)}
                          onCheckedChange={(checked) => handleInterestChange(interest.value, checked)}
                        />
                        <Label htmlFor={`interest-${interest.value}`} className="font-normal text-sm">
                          {interest.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    Concordo com os <a href="#" className="text-blue-600 hover:underline">termos de uso</a> e <a href="#" className="text-blue-600 hover:underline">política de privacidade</a>.
                  </Label>
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
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Criar Minha Conta de Turista
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  Já tem uma conta? <Link to={createPageUrl("UserAccount")} className="text-blue-600 hover:underline font-medium">Faça login</Link>
                </div>
                <div className="text-center text-xs text-gray-400 mt-2">
                    Ou cadastre seu <Link to={createPageUrl("Cadastro")} className="text-blue-500 hover:underline">Comércio</Link> ou <Link to={createPageUrl("RealtorSignup")} className="text-blue-500 hover:underline">Imobiliária</Link>.
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