import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Realtor } from "@/api/entities";
import { City } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { Building2, PlusCircle, Search, Trash2, Edit, User, CheckCircle2, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import BackButton from "@/components/ui/BackButton";

export default function Realtors() {
  const [realtors, setRealtors] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
    isOpen: false,
    realtorId: null
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  // Aqui está o problema potencial - vamos verificar e corrigir a função loadData
  const loadData = async () => {
    setIsLoading(true);
    try {
      // DEBUG: Adicionar log para verificar se esta função está sendo chamada
      console.log("Carregando dados de imobiliárias...");
      
      // Fazendo todas as chamadas em paralelo
      const [realtorsData, citiesData, plansData] = await Promise.all([
        Realtor.list(), // Correção 1: Verificar se o método está correto
        City.list(),
        SubscriptionPlan.filter({ plan_type: "realtor" }) // Correção 2: Filtrar apenas planos de imobiliárias
      ]);
      
      // DEBUG: Adicionar log para verificar os dados recebidos
      console.log("Dados recebidos:", { realtors: realtorsData, cities: citiesData, plans: plansData });
      
      // Correção 3: Garantir que estamos usando os dados corretos mesmo se a API retornar null
      setRealtors(realtorsData || []);
      setCities(citiesData || []);
      setPlans(plansData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados das imobiliárias.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRealtor = () => {
    navigate(createPageUrl("RealtorCreate"));
  };

  const handleEditRealtor = (id) => {
    navigate(createPageUrl(`RealtorDetail?id=${id}`));
  };

  const handleDeleteRealtor = async (id) => {
    try {
      await Realtor.delete(id);
      setRealtors(realtors.filter(realtor => realtor.id !== id));
      toast({
        title: "Sucesso",
        description: "Imobiliária removida com sucesso."
      });
      setConfirmDeleteDialog({ isOpen: false, realtorId: null });
    } catch (error) {
      console.error("Erro ao excluir imobiliária:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a imobiliária.",
        variant: "destructive"
      });
    }
  };

  const openDeleteConfirm = (id) => {
    setConfirmDeleteDialog({
      isOpen: true,
      realtorId: id
    });
  };

  const filteredRealtors = realtors.filter(realtor => {
    // Filtragem por termo de busca e status
    const matchesSearch = 
      searchTerm.trim() === "" || 
      realtor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      realtor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      realtor.creci?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "all" || 
      realtor.subscription_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Função para pegar o nome da cidade a partir do ID
  const getCityName = (cityId) => {
    const city = cities.find(city => city.id === cityId);
    return city ? city.name : "N/A";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold flex items-center ml-2">
            <Building2 className="mr-2 h-6 w-6 text-blue-600" />
            Gerenciamento de Imobiliárias
          </h1>
        </div>
        <Button onClick={handleAddRealtor} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Imobiliária
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou CRECI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredRealtors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Building2 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">Nenhuma imobiliária encontrada</h3>
            <p className="text-gray-400 text-center max-w-md mt-2">
              {searchTerm || statusFilter !== "all" 
                ? "Tente ajustar os filtros para ver mais resultados" 
                : "Clique em 'Adicionar Imobiliária' para criar seu primeiro registro"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome da Imobiliária</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CRECI</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRealtors.map((realtor) => (
                  <tr key={realtor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {realtor.logo_url ? (
                            <img src={realtor.logo_url} alt={realtor.company_name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <Building2 className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{realtor.company_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{realtor.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{realtor.phone}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{getCityName(realtor.city_id)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{realtor.creci || "—"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        realtor.subscription_status === "active" ? "bg-green-100 text-green-800" :
                        realtor.subscription_status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {realtor.subscription_status === "active" ? "Ativo" :
                         realtor.subscription_status === "pending" ? "Pendente" : 
                         "Expirado"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditRealtor(realtor.id)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDeleteConfirm(realtor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={confirmDeleteDialog.isOpen} onOpenChange={(open) => setConfirmDeleteDialog({...confirmDeleteDialog, isOpen: open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta imobiliária? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialog({isOpen: false, realtorId: null})}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteRealtor(confirmDeleteDialog.realtorId)}>
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}