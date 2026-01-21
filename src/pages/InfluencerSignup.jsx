
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SiteConfig } from "@/api/entities";
import { Influencer } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, InfoIcon, ArrowLeft } from "lucide-react";

export default function InfluencerSignup() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const navigate = useNavigate();
  
  const [siteConfig, setSiteConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    socialChannelType: "instagram",
    socialChannelUsername: "",
    code: "",
    pixKeyType: "CPF",
    pixKey: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  React.useEffect(() => {
    const loadConfigs = async () => {
      try {
        const configs = await SiteConfig.list();
        if (configs && configs.length > 0) {
          setSiteConfig(configs[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    };
    
    loadConfigs();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.city || 
        !formData.socialChannelUsername || !formData.pixKey) {
      setError("Preencha todos os campos obrigatórios.");
      return false;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido.");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setError("");
      
      try {
        // Gerar IDs únicos
        const timestamp = new Date().getTime();
        const userId = `user-${timestamp}`;
        const influencerId = `influencer-${timestamp}`;
        
        // Criar código único para influenciador
        const code = formData.name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
        
        // Criar objeto usuário
        const userObj = {
          id: userId,
          email: formData.email,
          full_name: formData.name,
          role: 'influencer',
          created_date: new Date().toISOString()
        };
        
        // Obter lista de usuários existentes
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Verificar se o e-mail já existe
        if (existingUsers.some(user => user.email === formData.email)) {
          setError('Este e-mail já está cadastrado');
          return;
        }
        
        // Adicionar novo usuário à lista
        existingUsers.push(userObj);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        // Criar objeto influenciador
        const influencerObj = {
          id: influencerId,
          user_id: userId,
          code: code,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          social_channel: {
            type: formData.socialChannelType,
            username: formData.socialChannelUsername
          },
          pix_key: formData.pixKey,
          pix_key_type: formData.pixKeyType,
          is_active: true,
          balance: 0,
          total_earned: 0,
          created_date: new Date().toISOString()
        };
        
        // Obter lista de influenciadores existentes
        const existingInfluencers = JSON.parse(localStorage.getItem('influencers') || '[]');
        
        // Adicionar novo influenciador
        existingInfluencers.push(influencerObj);
        localStorage.setItem('influencers', JSON.stringify(existingInfluencers));
        
        // Definir usuário atual
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        localStorage.setItem('isLoggedIn', 'true');
        
        setSuccessMessage("Seu cadastro como influenciador foi realizado com sucesso! Nossa equipe irá revisar suas informações e entraremos em contato em breve. Seu código é: " + code);
        
        // Limpar formulário
        setFormData({
          name: "",
          email: "",
          phone: "",
          city: "",
          socialChannelType: "instagram",
          socialChannelUsername: "",
          code: "",
          pixKeyType: "CPF",
          pixKey: ""
        });
        
      } catch (error) {
        console.error("Erro ao cadastrar:", error);
        setError(error.message || "Não foi possível realizar o cadastro. Tente novamente.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader siteConfig={siteConfig} />
      
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            className="mb-6 text-gray-600"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Seja um Influenciador
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Cadastre-se no nosso programa de influenciadores e ganhe comissões divulgando as melhores praias de Santa Catarina.
          </p>
          
          {successMessage ? (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 font-medium">Cadastro realizado com sucesso!</AlertTitle>
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
              <div className="mt-4">
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Voltar para a Home
                </Button>
              </div>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Formulário de Cadastro</CardTitle>
                <CardDescription>
                  Preencha seus dados para se tornar um influenciador parceiro.
                </CardDescription>
              </CardHeader>
              
              {error && (
                <Alert variant="destructive" className="mx-6 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Sua cidade"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="socialChannelType">Canal de Divulgação *</Label>
                      <Select 
                        value={formData.socialChannelType} 
                        onValueChange={(value) => handleSelectChange("socialChannelType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="socialChannelUsername">Nome do Canal/Perfil *</Label>
                      <Input
                        id="socialChannelUsername"
                        name="socialChannelUsername"
                        placeholder="@seuperfil"
                        value={formData.socialChannelUsername}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pixKeyType">Tipo de Chave PIX *</Label>
                      <Select 
                        value={formData.pixKeyType} 
                        onValueChange={(value) => handleSelectChange("pixKeyType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CPF">CPF</SelectItem>
                          <SelectItem value="CNPJ">CNPJ</SelectItem>
                          <SelectItem value="EMAIL">E-mail</SelectItem>
                          <SelectItem value="PHONE">Telefone</SelectItem>
                          <SelectItem value="RANDOM">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pixKey">Chave PIX *</Label>
                      <Input
                        id="pixKey"
                        name="pixKey"
                        placeholder="Sua chave PIX"
                        value={formData.pixKey}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {referralCode && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex items-start">
                        <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Você foi convidado por um influenciador</p>
                          <p className="text-sm text-blue-600">Código de referência: {referralCode}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2">Processando</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                        </>
                      ) : (
                        "Cadastrar como Influenciador"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col items-start text-sm text-gray-500 border-t pt-4">
                <p>• Ao se cadastrar, você concorda com os termos e condições do programa de influenciadores.</p>
                <p>• Suas informações serão revisadas pela nossa equipe e entraremos em contato em breve.</p>
                <p>• Para saques, o valor mínimo é de R$ 50,00 e serão processados em até 48 horas úteis.</p>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      
      <PublicFooter siteConfig={siteConfig} />
    </div>
  );
}
