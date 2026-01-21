import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  ChartBarIcon, 
  BarChart4, 
  TrendingUp, 
  MousePointerClick, 
  Users, 
  Eye, 
  ArrowUpRight, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Map, 
  Clock, 
  Calendar, 
  Download, 
  Share2, 
  Maximize2, 
  Info, 
  RefreshCw, 
  Loader2, 
  ChevronRight,
  ChevronLeft,
  PieChart as PieChartIcon
} from "lucide-react";
import { Advertiser } from "@/api/entities";
import { Advertisement } from "@/api/entities";
import { City } from "@/api/entities";
import { Beach } from "@/api/entities";
import { User } from "@/api/entities";
import BackButton from "@/components/ui/BackButton";

export default function AdvertiserAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [advertiser, setAdvertiser] = useState(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [cities, setCities] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [timeRange, setTimeRange] = useState("last30days");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [adsPerPage] = useState(5);

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    total_impressions: 0,
    total_clicks: 0,
    click_rate: 0,
    ad_performance: [],
    daily_stats: [],
    device_breakdown: [],
    location_stats: [],
    time_of_day: []
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (advertisements.length > 0 && !selectedAdId) {
      setSelectedAdId(advertisements[0].id);
    }
  }, [advertisements, selectedAdId]);

  useEffect(() => {
    if (selectedAdId && advertisements.length > 0) {
      generateAnalyticsData();
    }
  }, [selectedAdId, timeRange, advertisements]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      
      // Load advertiser data
      const advertisers = await Advertiser.filter({ user_id: user.id });
      const advertiserData = advertisers.length > 0 ? advertisers[0] : null;
      setAdvertiser(advertiserData);
      
      if (advertiserData) {
        // Load advertisements
        const ads = await Advertisement.filter({ advertiser_id: advertiserData.id });
        setAdvertisements(ads);
        
        // Load cities and beaches for reference
        const [citiesData, beachesData] = await Promise.all([
          City.list(),
          Beach.list()
        ]);
        
        setCities(citiesData);
        setBeaches(beachesData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const generateAnalyticsData = () => {
    // This would normally come from a backend with real analytics
    // For demo, we'll generate random data
    setRefreshing(true);
    
    const selectedAd = advertisements.find(ad => ad.id === selectedAdId);
    if (!selectedAd) return;
    
    // Generate more or less data based on time range
    let days = 30;
    switch (timeRange) {
      case "last7days":
        days = 7;
        break;
      case "last30days":
        days = 30;
        break;
      case "last90days":
        days = 90;
        break;
      case "lastYear":
        days = 365;
        break;
    }
    
    // Base metrics - varies by ad type
    let baseDailyImpressions;
    let baseDailyClicks;
    
    switch (selectedAd.type) {
      case "banner":
        baseDailyImpressions = 500;
        baseDailyClicks = 25;
        break;
      case "destaque":
        baseDailyImpressions = 800;
        baseDailyClicks = 40;
        break;
      case "card":
        baseDailyImpressions = 300;
        baseDailyClicks = 15;
        break;
      case "popup":
        baseDailyImpressions = 1000;
        baseDailyClicks = 30;
        break;
      case "newsletter":
        baseDailyImpressions = 2000;
        baseDailyClicks = 100;
        break;
      default:
        baseDailyImpressions = 400;
        baseDailyClicks = 20;
    }
    
    // Daily stats
    const today = new Date();
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - i - 1));
      
      // Add some randomness and trends
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 1.4 : 1;
      
      // More recent days have more activity
      const recencyMultiplier = 0.8 + (0.4 * (i / days));
      
      // Add some randomness
      const randomFactor = 0.8 + (Math.random() * 0.4);
      
      const impressions = Math.floor(
        baseDailyImpressions * weekendMultiplier * recencyMultiplier * randomFactor
      );
      
      const clicks = Math.floor(
        baseDailyClicks * weekendMultiplier * recencyMultiplier * randomFactor
      );
      
      return {
        date: date.toISOString().split('T')[0],
        impressions,
        clicks,
        ctr: ((clicks / impressions) * 100).toFixed(2)
      };
    });
    
    // Calculate totals
    const totalImpressions = dailyStats.reduce((sum, day) => sum + day.impressions, 0);
    const totalClicks = dailyStats.reduce((sum, day) => sum + day.clicks, 0);
    const clickRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    // Device breakdown
    const deviceBreakdown = [
      { name: "Desktop", value: Math.floor(totalImpressions * (0.35 + Math.random() * 0.1)) },
      { name: "Mobile", value: Math.floor(totalImpressions * (0.55 + Math.random() * 0.1)) },
      { name: "Tablet", value: Math.floor(totalImpressions * (0.1 + Math.random() * 0.05)) }
    ];
    
    // Adjust the values to ensure they sum to totalImpressions
    const deviceSum = deviceBreakdown.reduce((sum, device) => sum + device.value, 0);
    if (deviceSum !== totalImpressions) {
      const diff = totalImpressions - deviceSum;
      deviceBreakdown[0].value += diff;
    }
    
    // Time of day breakdown
    const timeOfDay = [
      { name: "Manhã (6-12h)", value: Math.floor(totalImpressions * 0.25) },
      { name: "Tarde (12-18h)", value: Math.floor(totalImpressions * 0.35) },
      { name: "Noite (18-24h)", value: Math.floor(totalImpressions * 0.3) },
      { name: "Madrugada (0-6h)", value: Math.floor(totalImpressions * 0.1) }
    ];
    
    // Location stats - if ad targets specific locations
    let locationStats = [];
    
    if (selectedAd.city_id) {
      const targetCity = cities.find(city => city.id === selectedAd.city_id);
      if (targetCity) {
        locationStats.push({
          name: targetCity.name,
          impressions: Math.floor(totalImpressions * 0.8),
          clicks: Math.floor(totalClicks * 0.8)
        });
        
        // Add some impressions from other cities
        const otherCities = cities
          .filter(city => city.id !== selectedAd.city_id)
          .slice(0, 3);
          
        otherCities.forEach((city, index) => {
          const factor = 0.2 * (1 / (index + 1));
          locationStats.push({
            name: city.name,
            impressions: Math.floor(totalImpressions * factor),
            clicks: Math.floor(totalClicks * factor)
          });
        });
      }
    } else if (selectedAd.beach_id) {
      const targetBeach = beaches.find(beach => beach.id === selectedAd.beach_id);
      if (targetBeach) {
        const beachCity = cities.find(city => city.id === targetBeach.city_id);
        
        locationStats.push({
          name: `${targetBeach.name} (${beachCity ? beachCity.name : 'Desconhecido'})`,
          impressions: Math.floor(totalImpressions * 0.75),
          clicks: Math.floor(totalClicks * 0.75)
        });
        
        // Add other beaches in the same city
        const otherBeaches = beaches
          .filter(beach => beach.id !== selectedAd.beach_id && beach.city_id === targetBeach.city_id)
          .slice(0, 3);
          
        otherBeaches.forEach((beach, index) => {
          const factor = 0.25 * (1 / (index + 1));
          locationStats.push({
            name: beach.name,
            impressions: Math.floor(totalImpressions * factor),
            clicks: Math.floor(totalClicks * factor)
          });
        });
      }
    } else {
      // General ad without specific location targeting
      locationStats = cities
        .slice(0, 5)
        .map((city, index) => {
          const factor = 1 / (index + 1) / 2.5;
          return {
            name: city.name,
            impressions: Math.floor(totalImpressions * factor),
            clicks: Math.floor(totalClicks * factor)
          };
        });
    }
    
    // Ensure locations add up to totals
    const locationImpSum = locationStats.reduce((sum, loc) => sum + loc.impressions, 0);
    const locationClickSum = locationStats.reduce((sum, loc) => sum + loc.clicks, 0);
    
    if (locationImpSum !== totalImpressions) {
      locationStats[0].impressions += (totalImpressions - locationImpSum);
    }
    
    if (locationClickSum !== totalClicks) {
      locationStats[0].clicks += (totalClicks - locationClickSum);
    }
    
    // Performance of multiple ads
    const adPerformance = advertisements.map(ad => {
      const performance = Math.random();
      const impressions = Math.floor(
        baseDailyImpressions * days * (0.5 + performance * 0.5)
      );
      const clicks = Math.floor(
        impressions * (0.02 + performance * 0.08)
      );
      
      return {
        id: ad.id,
        name: ad.title,
        type: ad.type,
        impressions,
        clicks,
        ctr: ((clicks / impressions) * 100).toFixed(2)
      };
    });
    
    setAnalyticsData({
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      click_rate: clickRate.toFixed(2),
      ad_performance: adPerformance,
      daily_stats: dailyStats,
      device_breakdown: deviceBreakdown,
      location_stats: locationStats,
      time_of_day: timeOfDay
    });
    
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const refreshData = () => {
    generateAnalyticsData();
  };

  const formatAdType = (type) => {
    const typeNames = {
      'banner': 'Banner',
      'destaque': 'Destaque',
      'card': 'Card',
      'popup': 'Pop-up',
      'newsletter': 'Newsletter'
    };
    
    return typeNames[type] || type;
  };

  const formatAdPlacement = (placement) => {
    const placementNames = {
      'home': 'Página Inicial',
      'city': 'Página de Cidade',
      'beach': 'Página de Praia',
      'listing': 'Listagem',
      'community': 'Comunidade',
      'search': 'Busca',
      'multiple': 'Múltiplas Páginas'
    };
    
    return placementNames[placement] || placement;
  };

  const formatTimestamp = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Pagination controls
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = advertisements.slice(indexOfFirstAd, indexOfLastAd);
  const totalPages = Math.ceil(advertisements.length / adsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-700">Carregando dados de anúncios...</p>
          <p className="text-gray-500">Isso pode levar alguns instantes</p>
        </div>
      </div>
    );
  }

  if (!advertiser) {
    return (
      <div className="p-6">
        <BackButton />
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="bg-yellow-50 p-8 rounded-lg">
            <Info className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Perfil de Anunciante não Encontrado</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Não encontramos um perfil de anunciante vinculado à sua conta. Para acessar as métricas de desempenho de anúncios, 
              você precisa criar um perfil de anunciante primeiro.
            </p>
            <Button>Criar Perfil de Anunciante</Button>
          </div>
        </div>
      </div>
    );
  }

  if (advertisements.length === 0) {
    return (
      <div className="p-6">
        <BackButton />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics de Anúncios</h1>
          <div className="bg-blue-50 p-8 rounded-lg">
            <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Nenhum Anúncio Encontrado</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Não encontramos anúncios ativos para sua conta. Para acessar métricas de desempenho, 
              você precisa criar pelo menos um anúncio.
            </p>
            <Button>Criar Novo Anúncio</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BackButton />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics de Anúncios</h1>
            <p className="text-gray-600">
              Monitore o desempenho dos seus anúncios e otimize suas campanhas
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                <SelectItem value="last90days">Últimos 90 dias</SelectItem>
                <SelectItem value="lastYear">Último ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Impressões Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">{analyticsData.total_impressions.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">visualizações dos seus anúncios</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Cliques Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">{analyticsData.total_clicks.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">interações com seus anúncios</p>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <MousePointerClick className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Taxa de Cliques (CTR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold">{analyticsData.click_rate}%</div>
                  <p className="text-sm text-gray-500">conversão de visualizações em cliques</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-100">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="w-5 h-5 text-blue-600" />
                  <span>Desempenho ao Longo do Tempo</span>
                </CardTitle>
                <CardDescription>
                  Impressões e cliques nos seus anúncios ao longo do período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.daily_stats}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="impressions"
                        name="Impressões"
                        stroke="#0ea5e9"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="clicks"
                        name="Cliques"
                        stroke="#22c55e"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-600" />
                <span>Dispositivos</span>
              </CardTitle>
              <CardDescription>
                Distribuição de impressões por tipo de dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.device_breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.device_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-blue-100 mb-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Mobile</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-green-100 mb-2">
                    <Monitor className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Desktop</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-yellow-100 mb-2">
                    <Tablet className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium">Tablet</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="adPerformance" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="adPerformance" className="flex items-center gap-2">
              <BarChart4 className="w-4 h-4" />
              Desempenho por Anúncio
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Localidades
            </TabsTrigger>
            <TabsTrigger value="timeDistribution" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Distribuição por Horário
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="adPerformance">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Anúncio</CardTitle>
                <CardDescription>
                  Compare o desempenho entre seus diferentes anúncios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Anúncio</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Impressões</TableHead>
                        <TableHead className="text-right">Cliques</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.ad_performance.map((ad) => (
                        <TableRow key={ad.id} className={selectedAdId === ad.id ? "bg-blue-50" : ""}>
                          <TableCell className="font-medium">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => setSelectedAdId(ad.id)}
                            >
                              {ad.name}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatAdType(ad.type)}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{ad.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{ad.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={
                              parseFloat(ad.ctr) > 5 ? "bg-green-100 text-green-800" :
                              parseFloat(ad.ctr) > 2 ? "bg-amber-100 text-amber-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {ad.ctr}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="h-72 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.ad_performance}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impressions" name="Impressões" fill="#0ea5e9" />
                      <Bar dataKey="clicks" name="Cliques" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Localidade</CardTitle>
                <CardDescription>
                  Veja como seu anúncio está performando em diferentes localidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Localidade</TableHead>
                        <TableHead className="text-right">Impressões</TableHead>
                        <TableHead className="text-right">Cliques</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.location_stats.map((location, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell className="text-right">{location.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{location.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={
                              (location.clicks / location.impressions * 100) > 5 ? "bg-green-100 text-green-800" :
                              (location.clicks / location.impressions * 100) > 2 ? "bg-amber-100 text-amber-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {(location.clicks / location.impressions * 100).toFixed(2)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="h-72 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.location_stats}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impressions" name="Impressões" fill="#0ea5e9" />
                      <Bar dataKey="clicks" name="Cliques" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeDistribution">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Horário</CardTitle>
                <CardDescription>
                  Veja em quais horários seu anúncio tem melhor desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.time_of_day}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.time_of_day.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {analyticsData.time_of_day.map((timeSlot, index) => (
                    <Card key={index} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className={`p-2 rounded-full mb-2 ${
                            index === 0 ? "bg-blue-100" :
                            index === 1 ? "bg-green-100" :
                            index === 2 ? "bg-yellow-100" :
                            "bg-purple-100"
                          }`}>
                            <Clock className={`w-5 h-5 ${
                              index === 0 ? "text-blue-600" :
                              index === 1 ? "text-green-600" :
                              index === 2 ? "text-yellow-600" :
                              "text-purple-600"
                            }`} />
                          </div>
                          <span className="text-sm font-medium">{timeSlot.name}</span>
                          <span className="text-lg font-bold mt-1">
                            {((timeSlot.value / analyticsData.total_impressions) * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {timeSlot.value.toLocaleString()} impressões
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Seus Anúncios</CardTitle>
                <CardDescription>Lista de todos seus anúncios ativos e inativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Período</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAds.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell className="font-medium">{ad.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatAdType(ad.type)}</Badge>
                          </TableCell>
                          <TableCell>{formatAdPlacement(ad.placement)}</TableCell>
                          <TableCell>
                            <Badge className={
                              ad.status === 'active' ? "bg-green-100 text-green-800" :
                              ad.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                              ad.status === 'paused' ? "bg-orange-100 text-orange-800" :
                              ad.status === 'completed' ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {ad.status === 'active' ? "Ativo" :
                               ad.status === 'pending' ? "Pendente" :
                               ad.status === 'paused' ? "Pausado" :
                               ad.status === 'completed' ? "Concluído" :
                               "Rejeitado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatTimestamp(ad.start_date)}</div>
                              <div className="text-gray-500">até {formatTimestamp(ad.end_date)}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-sm text-gray-500">
                      Página {currentPage} de {totalPages}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Dicas de Otimização</CardTitle>
                <CardDescription>
                  Sugestões para melhorar o desempenho dos seus anúncios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Melhore seu CTR
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Teste imagens diferentes para aumentar a taxa de cliques. Adicione uma chamada para ação clara.
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg bg-green-50">
                  <h3 className="font-medium text-green-800 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Público-alvo
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Seus anúncios têm melhor desempenho em dispositivos móveis. Otimize o conteúdo para visualização mobile.
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg bg-amber-50">
                  <h3 className="font-medium text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Melhor Horário
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Considere aumentar seu investimento no período da tarde (12-18h), quando seu anúncio tem mais impressões.
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg bg-purple-50">
                  <h3 className="font-medium text-purple-800 flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Localização
                  </h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Seus anúncios têm bom desempenho em {analyticsData.location_stats[0]?.name}. Considere criar uma campanha específica para essa cidade.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Exportar Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar como PDF
                </Button>
                
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar como CSV
                </Button>
                
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartilhar Relatório
                </Button>
                
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Visualização Completa
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}