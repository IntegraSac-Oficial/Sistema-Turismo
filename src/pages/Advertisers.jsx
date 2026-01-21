import React, { useState, useEffect } from "react";
import { Advertiser, User, City, SubscriptionPlan } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Loader2,
  Search,
  Building,
  MoreHorizontal,
  Check,
  X,
  User as UserIcon,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Calendar,
  Clock,
  BarChart4,
  Package
} from "lucide-react";

export default function Advertisers() {
  const [advertisers, setAdvertisers] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [advertisersData, citiesData, plansData] = await Promise.all([
        Advertiser.list("-created_date"),
        City.list("name"),
        SubscriptionPlan.list("name")
      ]);
      
      // Carregar usuários associados
      const userIds = advertisersData.map(advertiser => advertiser.user_id);
      const uniqueUserIds = [...new Set(userIds)];
      
      const userDataPromises = uniqueUserIds.map(userId => User.filter({ id: userId }));
      const usersResults = await Promise.all(userDataPromises);
      
      // Mapear usuários
      const usersMap = {};
      usersResults.forEach(userResult => {
        if (userResult.length > 0) {
          usersMap[userResult[0].id] = userResult[0];
        }
      });
      
      // Adicionar dados de usuário aos anunciantes
      const enrichedAdvertisers = advertisersData.map(advertiser => ({
        ...advertiser,
        user: usersMap[advertiser.user_id] || null
      }));
      
      setAdvertisers(enrichedAdvertisers);
      setCities(citiesData);
      setPlans(plansData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleViewDetails = (advertiser) => {
    setSelectedAdvertiser(advertiser);
    setIsDetailViewOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspenso</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100">{status}</Badge>;
    }
  };

  const getSegmentLabel = (segment) => {
    const labels = {
      "hospedagem": "Hospedagem",
      "alimentacao": "Alimentação",
      "passeios": "Passeios",
      "esportes": "Esportes",
      "transporte": "Transporte",
      "outros": "Outros"
    };
    return labels[segment] || segment;
  };

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : "Sem plano";
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "Cidade não encontrada";
  };

  const filteredAdvertisers = advertisers.filter(advertiser => {
    // Filtrar por status
    if (activeTab !== "todos" && advertiser.status !== activeTab) {
      return false;
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        advertiser.company_name?.toLowerCase().includes(searchLower) ||
        advertiser.trade_name?.toLowerCase().includes(searchLower) ||
        advertiser.cnpj?.includes(searchLower) ||
        advertiser.user?.full_name?.toLowerCase().includes(searchLower) ||
        advertiser.user?.email?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Anunciantes</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Novo Anunciante
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, CNPJ ou responsável..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os segmentos</SelectItem>
                    <SelectItem value="hospedagem">Hospedagem</SelectItem>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="passeios">Passeios</SelectItem>
                    <SelectItem value="esportes">Esportes</SelectItem>
                    <SelectItem value="transporte">Transporte</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="suspended">Suspensos</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-500">Carregando anunciantes...</p>
                  </div>
                </div>
              ) : filteredAdvertisers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Building className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">Nenhum anunciante encontrado</h3>
                  <p className="text-gray-400">Não há anunciantes com os filtros selecionados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Empresa</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Responsável</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Segmento</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Plano</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Cidade</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdvertisers.map((advertiser) => (
                        <tr key={advertiser.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                {advertiser.logo_url ? (
                                  <img
                                    src={advertiser.logo_url}
                                    alt={advertiser.company_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Building className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{advertiser.company_name}</p>
                                <p className="text-xs text-gray-500">{advertiser.trade_name || advertiser.company_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {advertiser.user?.full_name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm">{advertiser.user?.full_name || "Usuário não encontrado"}</p>
                                <p className="text-xs text-gray-500">{advertiser.user?.email || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">
                              {getSegmentLabel(advertiser.segment)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {advertiser.subscription_plan_id ? (
                              <Badge className="bg-blue-100 text-blue-800">
                                {getPlanName(advertiser.subscription_plan_id)}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm">{getCityName(advertiser.city_id)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(advertiser.status)}
                          </td>
                          <td className="px-4 py-3">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(advertiser)}
                            >
                              Ver detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
        
        {/* Modal de detalhes */}
        {selectedAdvertiser && (
          <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Anunciante</DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden mb-4">
                      {selectedAdvertiser.logo_url ? (
                        <img
                          src={selectedAdvertiser.logo_url}
                          alt={selectedAdvertiser.company_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-16 h-16 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-3 text-gray-700">Dados básicos</h3>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Razão Social</p>
                          <p className="font-medium">{selectedAdvertiser.company_name}</p>
                        </div>
                        
                        {selectedAdvertiser.trade_name && (
                          <div>
                            <p className="text-xs text-gray-500">Nome Fantasia</p>
                            <p>{selectedAdvertiser.trade_name}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-xs text-gray-500">CNPJ</p>
                          <p>{selectedAdvertiser.cnpj}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Segmento</p>
                          <Badge variant="outline" className="mt-1">
                            {getSegmentLabel(selectedAdvertiser.segment)}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          {getStatusBadge(selectedAdvertiser.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 space-y-4">
                    <Card>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base">Informações de Contato</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3 px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Responsável</p>
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{selectedAdvertiser.user?.full_name || "Não informado"}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{selectedAdvertiser.email || selectedAdvertiser.user?.email || "Não informado"}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Telefone</p>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{selectedAdvertiser.phone || "Não informado"}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Website</p>
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 text-gray-400 mr-2" />
                            {selectedAdvertiser.website ? (
                              <a href={selectedAdvertiser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {selectedAdvertiser.website}
                              </a>
                            ) : (
                              <span className="text-gray-500">Não informado</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base">Localização</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3 px-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Endereço</p>
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                            <span>{selectedAdvertiser.address || "Endereço não informado"}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Cidade</p>
                          <span>{getCityName(selectedAdvertiser.city_id)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base">Assinatura</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3 px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Plano</p>
                          {selectedAdvertiser.subscription_plan_id ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              {getPlanName(selectedAdvertiser.subscription_plan_id)}
                            </Badge>
                          ) : (
                            <span className="text-gray-500">Sem plano ativo</span>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Início</p>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span>
                              {selectedAdvertiser.subscription_start_date ? 
                                new Date(selectedAdvertiser.subscription_start_date).toLocaleDateString('pt-BR') : 
                                "-"}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Término</p>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span>
                              {selectedAdvertiser.subscription_end_date ? 
                                new Date(selectedAdvertiser.subscription_end_date).toLocaleDateString('pt-BR') : 
                                "-"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {selectedAdvertiser.description && (
                      <Card>
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-base">Descrição</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 px-4">
                          <p className="text-gray-700">{selectedAdvertiser.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailViewOpen(false)}>
                  Fechar
                </Button>
                
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <BarChart4 className="w-4 h-4 mr-2" />
                  Ver Analytics
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}