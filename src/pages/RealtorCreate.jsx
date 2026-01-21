import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Realtor } from "@/api/entities";
import { City } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function RealtorCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    user_id: `temp_${Date.now()}`,
    company_name: "",
    email: "",
    phone: "",
    city_id: "",
    creci: "",
    status: "pending",
    subscription_status: "trial",
    max_active_listings: 3
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const citiesData = await City.list();
      setCities(citiesData || []);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de cidades",
        variant: "destructive"
      });
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

      // Criar novo corretor
      const newRealtor = await Realtor.create(formData);

      toast({
        title: "Sucesso",
        description: "Imobiliária cadastrada com sucesso",
      });
      
      navigate(createPageUrl(`RealtorDetail?id=${newRealtor.id}`));
      
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível completar o cadastro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <BackButton />
      
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Building2 className="h-6 w-6 text-blue-600" />
        Nova Imobiliária
      </h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informações da Imobiliária</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Nome da Imobiliária*</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="Nome da imobiliária"
                    className="pl-10"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email*</Label>
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
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone*</Label>
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
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="city_id">Cidade*</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <Select
                    value={formData.city_id}
                    onValueChange={(value) => handleSelectChange("city_id", value)}
                    required
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
              
              <div>
                <Label htmlFor="creci">CRECI (Opcional)</Label>
                <Input
                  id="creci"
                  name="creci"
                  placeholder="Número do CRECI"
                  value={formData.creci}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(createPageUrl("Realtors"))}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Imobiliária'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}