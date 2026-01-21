import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { Product } from "@/api/entities";
import { Review } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportTasks } from "@/api/functions/exportTasks";
import {
  ArrowLeft,
  DownloadCloud,
  BarChart2,
  ShoppingBag,
  TrendingUp,
  Star,
  Calendar,
  Layers,
  DollarSign,
  PieChart,
  Printer,
  Clock,
  Filter,
  ChevronDown
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell
} from "recharts";

export default function BusinessReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("sales");
  const [reportPeriod, setReportPeriod] = useState("month");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [productPerformanceData, setProductPerformanceData] = useState([]);
  const [categoryDistributionData, setCategoryDistributionData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [exportingReport, setExportingReport] = useState(false);

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        navigate(createPageUrl("UserAccount"));
        return;
      }
      
      const currentUser = JSON.parse(currentUserStr);
      
      // Verificar se existe negócio associado
      if (!currentUser.business_id) {
        toast({
          title: "Sem negócio associado",
          description: "Você precisa cadastrar seu negócio primeiro",
          variant: "destructive"
        });
        navigate(createPageUrl("EditBusiness"));
        return;
      }
      
      // Carregar negócio
      const businessData = await Business.get(currentUser.business_id);
      if (!businessData) {
        toast({
          title: "Erro",
          description: "Negócio não encontrado",
          variant: "destructive"
        });
        navigate(createPageUrl("EditBusiness"));
        return;
      }
      
      setBusiness(businessData);
      
      // Carregar produtos
      try {
        const productsData = await Product.filter({ business_id: currentUser.business_id });
        setProducts(productsData || []);
        
        // Extrair categorias únicas
        const uniqueCategories = [...new Set(productsData.map(product => product.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Gerar dados simulados para relatórios
        generateMockReportData(productsData, reportPeriod);
        
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setProducts([]);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (products.length > 0) {
      generateMockReportData(products, reportPeriod);
    }
  }, [reportPeriod, categoryFilter]);
  
  const generateMockReportData = (productsData, period) => {
    // Filtrar por categoria, se necessário
    const filteredProducts = categoryFilter === "all" 
      ? productsData 
      : productsData.filter(p => p.category === categoryFilter);
    
    // Gerar dados de vendas
    const salesDataPoints = period === "week" ? 7 : period === "month" ? 30 : 12;
    const mockSalesData = [];
    
    for (let i = 0; i < salesDataPoints; i++) {
      mockSalesData.push({
        name: period === "week" ? `Dia ${i + 1}` : 
              period === "month" ? `Dia ${i + 1}` : `Mês ${i + 1}`,
        vendas: Math.floor(Math.random() * 200) + 50,
        receita: Math.floor(Math.random() * 2000) + 500
      });
    }
    setSalesData(mockSalesData);
    
    // Gerar dados de performance de produtos
    const mockPerformanceData = filteredProducts.slice(0, 10).map(product => ({
      name: product.name,
      vendas: Math.floor(Math.random() * 100) + 10,
      receita: Math.floor((product.price || 10) * (Math.random() * 100 + 10))
    }));
    setProductPerformanceData(mockPerformanceData);
    
    // Gerar dados de distribuição por categoria
    const categoryCounts = {};
    filteredProducts.forEach(product => {
      const category = product.category || "Sem categoria";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const mockCategoryData = Object.keys(categoryCounts).map(category => ({
      name: category,
      value: categoryCounts[category]
    }));
    setCategoryDistributionData(mockCategoryData);
    
    // Gerar dados de tendência
    const mockTrendData = [];
    for (let i = 0; i < 12; i++) {
      mockTrendData.push({
        name: `Mês ${i + 1}`,
        vendas: Math.floor(Math.random() * 150) + (i * 5),
        clientes: Math.floor(Math.random() * 100) + (i * 3)
      });
    }
    setTrendData(mockTrendData);
  };
  
  const handleExportReport = async () => {
    setExportingReport(true);
    try {
      // Simulação de exportação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Relatório exportado",
        description: "O relatório foi exportado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório",
        variant: "destructive"
      });
    } finally {
      setExportingReport(false);
    }
  };
  
  const handlePrintReport = () => {
    window.print();
  };
  
  // Formatação de valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex items-center mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Relatórios</h1>
            <p className="text-gray-600">
              Acompanhe o desempenho do seu negócio
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportReport}
              disabled={exportingReport}
            >
              {exportingReport ? (
                <>
                  <div className="h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePrintReport}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Select
                value={reportPeriod}
                onValueChange={setReportPeriod}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Última atualização: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="sales" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tendências
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500 font-normal">Total de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-end">
                    {salesData.reduce((sum, item) => sum + item.vendas, 0)} unidades
                    <span className="text-green-500 text-sm ml-2 font-normal">+12% vs. período anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500 font-normal">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-end">
                    {formatCurrency(salesData.reduce((sum, item) => sum + item.receita, 0))}
                    <span className="text-green-500 text-sm ml-2 font-normal">+8.3% vs. período anterior</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500 font-normal">Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-end">
                    {formatCurrency(salesData.reduce((sum, item) => sum + item.receita, 0) / 
                      Math.max(1, salesData.reduce((sum, item) => sum + item.vendas, 0)))}
                    <span className="text-red-500 text-sm ml-2 font-normal">-2.1% vs. período anterior</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Evolução de Vendas e Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => {
                        return name === 'receita' ? formatCurrency(value) : value;
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="vendas" name="Vendas (unidades)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="receita" name="Receita (R$)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Produtos por Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={productPerformanceData.sort((a, b) => b.vendas - a.vendas).slice(0, 5)}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 60,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="vendas" name="Vendas (unidades)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Produtos por Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={productPerformanceData.sort((a, b) => b.receita - a.receita).slice(0, 5)}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 60,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value, name) => {
                          return name === 'receita' ? formatCurrency(value) : value;
                        }} />
                        <Legend />
                        <Bar dataKey="receita" name="Receita (R$)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={categoryDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
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
                      <Line type="monotone" dataKey="vendas" name="Vendas" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="clientes" name="Clientes" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500 font-normal">Previsão próx. mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 flex items-center">
                    +{Math.floor(Math.random() * 20) + 5}%
                    <TrendingUp className="ml-2 h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Expectativa de crescimento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500 font-normal">Categoria em alta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {categories[Math.floor(Math.random() * categories.length)] || "Sem categoria"}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Categoria com mais crescimento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500 font-normal">Produtos em baixa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {Math.floor(Math.random() * 5) + 1}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Produtos com vendas abaixo do esperado</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}