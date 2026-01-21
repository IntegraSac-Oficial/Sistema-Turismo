import React, { useState, useEffect, useCallback } from "react";
import { BannerAnalytics } from "@/api/entities";
import { CityBanner } from "@/api/entities";
import { City } from "@/api/entities";
import { BannerCategory } from "@/api/entities";
import { 
  BarChart as BarChartIcon, 
  Users, 
  MapPin, 
  Clock,
  MousePointer,
  Smartphone,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCcw,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BackButton from "@/components/ui/BackButton";
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";

export default function BannerAnalyticsPage() {
  const [analytics, setAnalytics] = useState([]);
  const [banners, setBanners] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [selectedBannerId, setSelectedBannerId] = useState("all");
  const [selectedCityId, setSelectedCityId] = useState("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    to: new Date()
  });
  const [comparisonPeriod, setComparisonPeriod] = useState(false);
  
  // Métricas calculadas
  const [metrics, setMetrics] = useState({
    totalViews: 0,
    totalClicks: 0,
    ctr: 0,
    uniqueUsers: 0,
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0
    },
    demographicBreakdown: {
      male: 0,
      female: 0,
      other: 0
    },
    topLocations: [],
    timeSeriesData: []
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Carregar banners, cidades e categorias
      const [bannersData, citiesData, categoriesData] = await Promise.all([
        CityBanner.list(),
        City.list(),
        BannerCategory.list()
      ]);
      
      setBanners(bannersData || []);
      setCities(citiesData || []);
      setCategories(categoriesData || []);
      
      // Carregar dados de analytics com filtros
      await loadAnalyticsData(bannersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os dados de analytics.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAnalyticsData = async (availableBanners) => {
    try {
      // Aqui usamos a API BannerAnalytics para buscar os dados
      // Implementar filtragem por data, banner, etc.
      
      // Simulação: na implementação real, você usaria filters do BannerAnalytics com base nos filtros selecionados
      const analyticsData = await BannerAnalytics.list("-timestamp", 1000); // Limitando a 1000 registros por performance
      setAnalytics(analyticsData || []);
      
      // Processar dados para as métricas
      processAnalyticsData(analyticsData, availableBanners);
    } catch (error) {
      console.error("Erro ao carregar dados de analytics:", error);
      toast({
        title: "Erro ao carregar analytics",
        description: "Não foi possível buscar os dados de analytics.",
        variant: "destructive",
      });
    }
  };

  const processAnalyticsData = (data, availableBanners) => {
    if (!data || data.length === 0) {
      setMetrics({
        totalViews: 0,
        totalClicks: 0,
        ctr: 0,
        uniqueUsers: 0,
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
        demographicBreakdown: { male: 0, female: 0, other: 0 },
        topLocations: [],
        timeSeriesData: []
      });
      return;
    }

    // Aplicar filtros de data
    const filteredData = data.filter(item => {
      const timestamp = new Date(item.timestamp);
      return timestamp >= dateRange.from && timestamp <= dateRange.to;
    });
    
    // Aplicar filtros de banner, cidade, categoria
    const filteredByBanner = selectedBannerId === "all" 
      ? filteredData 
      : filteredData.filter(item => item.banner_id === selectedBannerId);
    
    // Para cidade e categoria, precisamos cruzar com os dados de banners
    let finalFilteredData = filteredByBanner;
    if (selectedCityId !== "all" || selectedCategoryId !== "all") {
      finalFilteredData = filteredByBanner.filter(item => {
        const relatedBanner = availableBanners.find(banner => banner.id === item.banner_id);
        if (!relatedBanner) return false;
        
        const cityMatch = selectedCityId === "all" || relatedBanner.city_id === selectedCityId;
        const categoryMatch = selectedCategoryId === "all" || relatedBanner.category_id === selectedCategoryId;
        
        return cityMatch && categoryMatch;
      });
    }
    
    // Calcular métricas
    const views = finalFilteredData.filter(item => item.event_type === "view").length;
    const clicks = finalFilteredData.filter(item => item.event_type === "click").length;
    
    // Unique users - usando session_id como identificador
    const uniqueSessions = new Set(finalFilteredData.map(item => item.session_data?.session_id).filter(Boolean)).size;
    
    // Device breakdown
    const deviceCounts = finalFilteredData.reduce((acc, item) => {
      const deviceType = item.user_data?.device_type || "unknown";
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {});
    
    // Demographic breakdown
    const demographicCounts = finalFilteredData.reduce((acc, item) => {
      const gender = item.user_demographics?.gender || "unknown";
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
    
    // Top locations
    const locationCounts = {};
    finalFilteredData.forEach(item => {
      const location = item.location_data?.city || "Unknown";
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Time series data
    const timeSeriesMap = {};
    finalFilteredData.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!timeSeriesMap[date]) {
        timeSeriesMap[date] = { date, views: 0, clicks: 0 };
      }
      
      if (item.event_type === "view") {
        timeSeriesMap[date].views++;
      } else if (item.event_type === "click") {
        timeSeriesMap[date].clicks++;
      }
    });
    
    const timeSeriesData = Object.values(timeSeriesMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Atualizar métricas
    setMetrics({
      totalViews: views,
      totalClicks: clicks,
      ctr: views > 0 ? (clicks / views * 100).toFixed(2) : 0,
      uniqueUsers: uniqueSessions,
      deviceBreakdown: {
        desktop: deviceCounts.desktop || 0,
        mobile: deviceCounts.mobile || 0,
        tablet: deviceCounts.tablet || 0
      },
      demographicBreakdown: {
        male: demographicCounts.male || 0,
        female: demographicCounts.female || 0,
        other: demographicCounts.other || 0
      },
      topLocations,
      timeSeriesData
    });
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reprocessar dados quando os filtros mudam
  useEffect(() => {
    if (!isLoading && analytics.length > 0 && banners.length > 0) {
      processAnalyticsData(analytics, banners);
    }
  }, [selectedBannerId, selectedCityId, selectedCategoryId, dateRange, analytics, banners, isLoading]);

  const handleRefresh = () => {
    loadData();
    toast({
      title: "Dados atualizados",
      description: "Os dados de analytics foram atualizados com sucesso."
    });
  };

  const handleExport = () => {
    // Exportar dados para CSV
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Data,Banner,Tipo de Evento,Dispositivo,Localização\n' +
      analytics
        .filter(item => {
          if (selectedBannerId !== "all" && item.banner_id !== selectedBannerId) return false;
          const timestamp = new Date(item.timestamp);
          return timestamp >= dateRange.from && timestamp <= dateRange.to;
        })
        .map(item => {
          const banner = banners.find(b => b.id === item.banner_id)?.title || 'Desconhecido';
          const date = new Date(item.timestamp).toISOString().slice(0, 10);
          const device = item.user_data?.device_type || 'Desconhecido';
          const location = item.location_data?.city || 'Desconhecido';
          return `${date},${banner},${item.event_type},${device},${location}`;
        })
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `banner_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-3xl font-bold">Analytics de Banners</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button size="sm" onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" /> 
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Período</label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Banner</label>
              <Select value={selectedBannerId} onValueChange={setSelectedBannerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Banners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Banners</SelectItem>
                  {banners.map(banner => (
                    <SelectItem key={banner.id} value={banner.id}>
                      {banner.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes métricas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChartIcon className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="demographics" className="gap-2">
            <Users className="w-4 h-4" />
            Demografia
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-2">
            <MapPin className="w-4 h-4" />
            Localização
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="w-4 h-4" />
            Dispositivos
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das Tabs */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Total de Visualizações" 
              value={metrics.totalViews} 
              icon={<BarChartIcon className="h-5 w-5 text-blue-500" />} 
              description="Número total de exibições" 
            />
            <MetricCard 
              title="Total de Cliques" 
              value={metrics.totalClicks} 
              icon={<MousePointer className="h-5 w-5 text-green-500" />} 
              description="Número total de cliques" 
            />
            <MetricCard 
              title="Taxa de Cliques (CTR)" 
              value={`${metrics.ctr}%`} 
              icon={<TrendingUp className="h-5 w-5 text-purple-500" />} 
              description="Percentual de cliques por visualização" 
            />
            <MetricCard 
              title="Usuários Únicos" 
              value={metrics.uniqueUsers} 
              icon={<Users className="h-5 w-5 text-orange-500" />} 
              description="Visitantes únicos" 
            />
          </div>
          
          {/* Gráfico de Tendência Temporal */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Desempenho</CardTitle>
              <CardDescription>Visualizações e cliques ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#2563eb" name="Visualizações" />
                  <Line type="monotone" dataKey="clicks" stroke="#16a34a" name="Cliques" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Demográfica</CardTitle>
              <CardDescription>Distribuição de usuários por gênero</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Homens', value: metrics.demographicBreakdown.male },
                      { name: 'Mulheres', value: metrics.demographicBreakdown.female },
                      { name: 'Outros', value: metrics.demographicBreakdown.other }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#ec4899" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Principais Localizações</CardTitle>
              <CardDescription>Cidades com mais interações</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topLocations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Interações" fill="#3b82f6">
                    {metrics.topLocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${(index * 50) % 360}, 70%, 50%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Dispositivo</CardTitle>
              <CardDescription>Tipos de dispositivos usados</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Desktop', value: metrics.deviceBreakdown.desktop },
                      { name: 'Mobile', value: metrics.deviceBreakdown.mobile },
                      { name: 'Tablet', value: metrics.deviceBreakdown.tablet }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente de Card para Métricas
function MetricCard({ title, value, icon, description }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}