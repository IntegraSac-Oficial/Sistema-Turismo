import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Tag, Percent, DollarSign } from "lucide-react";

const SERVICE_TYPES = [
  { value: "pintor", label: "Pintor" },
  { value: "diarista", label: "Diarista" },
  { value: "eletricista", label: "Eletricista" },
  { value: "pedreiro", label: "Pedreiro" },
  { value: "outros", label: "Outros" }
];

const DISCOUNT_TYPES = [
  { value: "percentual", label: "Desconto Percentual (%)" },
  { value: "fixo", label: "Valor Fixo (R$)" }
];

export default function ServiceProviderForm({ provider, cities, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: provider?.name || "",
    service_type: provider?.service_type || "",
    city_id: provider?.city_id || "",
    phone: provider?.phone || "",
    description: provider?.description || "",
    available: provider?.available !== undefined ? provider.available : true,
    is_club_member: provider?.is_club_member || false,
    discount_type: provider?.discount_type || "percentual",
    discount_value: provider?.discount_value || ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Se não for membro do clube, remover campos de desconto
    const dataToSubmit = { ...formData };
    if (!dataToSubmit.is_club_member) {
      delete dataToSubmit.discount_type;
      delete dataToSubmit.discount_value;
    }
    
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{provider ? "Editar Prestador" : "Novo Prestador"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="club" disabled={!formData.is_club_member}>
                Clube de Assinantes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Prestador</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_type">Tipo de Serviço</Label>
                  <Select 
                    value={formData.service_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city_id">Cidade</Label>
                  <Select 
                    value={formData.city_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição dos Serviços</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva os serviços oferecidos, experiência, etc."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
                />
                <Label htmlFor="available">Disponível para Trabalhar</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_club_member"
                  checked={formData.is_club_member}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_club_member: checked }))}
                />
                <Label htmlFor="is_club_member">Membro do Clube de Assinantes</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="club" className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <h3 className="text-orange-800 font-medium flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Configuração de Descontos para Membros
                </h3>
                <p className="text-orange-700 text-sm mt-1">
                  Como membro do Clube Praias Catarinenses, você precisa oferecer algum desconto ou benefício aos assinantes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Tipo de Desconto</Label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
                    required={formData.is_club_member}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de desconto" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCOUNT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.discount_type === "percentual" && (
                  <div className="space-y-2">
                    <Label htmlFor="discount_value" className="flex items-center">
                      <Percent className="w-4 h-4 mr-2" /> 
                      Percentual de Desconto
                    </Label>
                    <div className="relative">
                      <Input
                        id="discount_value"
                        name="discount_value"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.discount_value}
                        onChange={handleInputChange}
                        placeholder="Ex: 10"
                        required={formData.is_club_member}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Informe o percentual de desconto que será oferecido aos assinantes</p>
                  </div>
                )}

                {formData.discount_type === "fixo" && (
                  <div className="space-y-2">
                    <Label htmlFor="discount_value" className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" /> 
                      Valor Fixo de Desconto
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">R$</span>
                      </div>
                      <Input
                        id="discount_value"
                        name="discount_value"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.discount_value}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Ex: 25.90"
                        required={formData.is_club_member}
                      />
                    </div>
                    <p className="text-sm text-gray-500">Informe o valor fixo de desconto que será oferecido aos assinantes</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {provider ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}