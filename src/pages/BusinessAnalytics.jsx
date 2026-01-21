import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { User } from "@/api/entities";
import { Product } from "@/api/entities";
import { Review } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart,
  TrendingUp,
  Users,
  Star,
  Calendar,
  Eye,
  MousePointer,
  ShoppingBag,
  MapPin,
  Download,
  Printer,
  Share2,
  Filter,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BusinessAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [visitsData, setVisitsData] = useState([]);
  const [popularProductsData, setPopularProductsData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [period, setPeriod] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Verificar autenticação
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          navigate(createPageUrl("UserAccount"));
          return;
        }
        
        const userData = JSON.parse(currentUserStr);
        
        if (!userData.business_id) {
          toast({
            title: "Sem negócio associado",
            description: "Você precisa cadastrar seu negócio primeiro",
            variant: "destructive"
          });
          navigate(createPageUrl("EditBusiness"));
          return;
        }
        
        // Carregar dados do negócio
        const businessData = await Business.get(userData.business_id);
        if (!businessData) {
          navigate(createPageUrl("EditBusiness"));
          return;
        }
        
        setBusiness(businessData);
        
        // Gerar dados simulados para o dashboard
        generateMockData(period);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);
  
  useEffect(() => {
    if (business) {
      generateMockData(period);
    }
  }, [period, business]);
  
  const generateMockData = (selectedPeriod) => {
    // Gerar dados simulados para visitantes
    let visitPoints = 0;
    switch (selectedPeriod) {
      case 'day':
        visitPoints = 24; // Horas
        break;
      case 'week':
        visitPoints = 7; // Dias
        break;
      case 'month':
        visitPoints = 30; // Dias
        break;
      case 'year':
        visitPoints = 12; // Meses
        break;
      default:
        visitPoints = 7;
    }
    
    const mockVisits = [];
    for (let i = 0; i < visitPoints; i++) {
      mockVisits.push({
        name: selectedPeriod === 'day' ? `${i}h` : 
              selectedPeriod === 'week' ? `Dia ${i+1}` :
              selectedPeriod === 'month' ? `Dia ${i+1}` : `Mês ${i+1}`,
        visitas: Math.floor(Math.random() * 100) + 10,
        cliques: Math.floor(Math.random() * 30) + 5
      });
    }
    setVisitsData(mockVisits);
    
    // Gerar dados simulados para produtos populares
    const productsNames = [
      'Prato principal', 'Sobremesa', 'Bebida', 'Entrada', 'Porção'
    ];
    const mockProducts = [];
    for (let i = 0; i < 5; i++) {
      mockProducts.push({
        name: productsNames[i],
        value: Math.floor(Math.random() * 50) + 10
      });
    }
    setPopularProductsData(mockProducts);
    
    // Gerar dados simulados para avaliações
    const mockReviews = [];
    const currentDate = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      
      mockReviews.push({
        date: date.toISOString().split('T')[0],
        rating: (Math.random() * 4 + 1).toFixed(1),
        count: Math.floor(Math.random() * 5) + 1
      });
    }
    setReviewsData(mockReviews);
  };

  const getAverageRating = () => {
    if (reviewsData.length === 0) return 0;
    
    const sum = reviewsData.reduce((total, review) => {
      return total + (parseFloat(review.rating) * review.count);
    }, 0);
    
    const count = reviewsData.reduce((total, review) => total + review.count, 0);
    
    return (sum / count).toFixed(1);
  };

  const getTotalVisits = () => {
    return visitsData.reduce((total, item) => total + item.visitas, 0);
  };

  const getTotalClicks = () => {
    return visitsData.reduce((total, item) => total + item.cliques, 0);
  };
  
  const getClickThroughRate = () => {
    const visits = getTotalVisits();
    const clicks = getTotalClicks();
    return visits > 0 ? ((clicks / visits) * 100).toFixed(1) + "%" : "0%";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="text-gray-600 hover:text-gray-900 flex items-center mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics do Negócio</h1>
            <p className="text-gray-600">
              Visualize estatísticas e insights sobre o desempenho de {business.business_name || "seu negócio"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="visitors">Visitantes</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Visitantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{getTotalVisits()}</div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+12%</span>
                    <span className="ml-1">vs. período anterior</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Cliques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{getTotalClicks()}</div>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <MousePointer className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+5%</span>
                    <span className="ml-1">vs. período anterior</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Taxa de Cliques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{getClickThroughRate()}</div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+3%</span>
                    <span className="ml-1">vs. período anterior</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Avaliação Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-2xl font-bold">{getAverageRating()}</div>
                      <div className="ml-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+0.2</span>
                    <span className="ml-1">vs. período anterior</span>
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visitantes ao Longo do Tempo</CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={visitsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="visitas"
                          name="Visitantes"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="cliques"
                          name="Cliques"
                          stroke="#F59E0B"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Produtos Mais Visualizados</CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={popularProductsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {popularProductsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avaliações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewsData.slice(0, 3).map((review, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-4">
                      <div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(review.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-gray-700 font-medium">{review.rating}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Usuário anônimo - {new Date(review.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Novo
                      </Badge>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    Ver todas as avaliações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visitors" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Visitantes Detalhados</CardTitle>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Agrupar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Por Hora</SelectItem>
                      <SelectItem value="daily">Por Dia</SelectItem>
                      <SelectItem value="weekly">Por Semana</SelectItem>
                      <SelectItem value="monthly">Por Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={visitsData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="visitas" name="Visitantes" fill="#3B82F6" />
                      <Bar dataKey="cliques" name="Cliques" fill="#F59E0B" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fonte de Tráfego</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Google', value: 65 },
                            { name: 'Busca no Site', value: 15 },
                            { name: 'Redes Sociais', value: 12 },
                            { name: 'Direto', value: 8 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {popularProductsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dispositivos Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Mobile', value: 72 },
                            { name: 'Desktop', value: 24 },
                            { name: 'Tablet', value: 4 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#3B82F6" />
                          <Cell fill="#10B981" />
                          <Cell fill="#6366F1" />
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Produtos Mais Populares</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={popularProductsData}
                      layout="vertical"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 60,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Visualizações" fill="#3B82F6" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lista de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visualizações
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliques
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CTR
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Conversão
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {popularProductsData.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                <ShoppingBag className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.value}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{Math.floor(product.value * 0.6)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{Math.floor(Math.random() * 30 + 50)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{Math.floor(Math.random() * 15 + 5)}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Classificação Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-3xl font-bold">{getAverageRating()}</div>
                      <div className="ml-2 flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(getAverageRating())
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Baseado em {reviewsData.reduce((total, review) => total + review.count, 0)} avaliações
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">5 Estrelas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {Math.floor(reviewsData.filter(r => parseFloat(r.rating) >= 4.5).reduce((t, r) => t + r.count, 0) / reviewsData.reduce((t, r) => t + r.count, 0) * 100)}%
                    </div>
                    <div className="h-2 flex-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${Math.floor(reviewsData.filter(r => parseFloat(r.rating) >= 4.5).reduce((t, r) => t + r.count, 0) / reviewsData.reduce((t, r) => t + r.count, 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Avaliações Positivas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(reviewsData.filter(r => parseFloat(r.rating) >= 4).reduce((t, r) => t + r.count, 0) / reviewsData.reduce((t, r) => t + r.count, 0) * 100)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    4-5 estrelas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Avaliações Negativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(reviewsData.filter(r => parseFloat(r.rating) < 3).reduce((t, r) => t + r.count, 0) / reviewsData.reduce((t, r) => t + r.count, 0) * 100)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    1-2 estrelas
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Histórico de Avaliações</CardTitle>
                  <Select defaultValue="month">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Semana</SelectItem>
                      <SelectItem value="month">Mês</SelectItem>
                      <SelectItem value="year">Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reviewsData.slice(0, 12).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        name="Avaliação"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Últimas Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviewsData.slice(0, 5).map((review, index) => (
                    <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold mr-3">
                              U
                            </div>
                            <div>
                              <div className="font-medium">Usuário Anônimo</div>
                              <div className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('pt-BR')}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(review.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 text-gray-600">
                        {index % 2 === 0 
                          ? "Ótima experiência! A comida estava deliciosa e o atendimento foi excelente." 
                          : "Gostei muito do ambiente e da localização. Recomendo para quem estiver na região."}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}