
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Users, Settings, LogOut, ChevronLeft, Home as HomeIcon, Waves as BeachIcon, Store as BusinessIcon, List as ListIcon, Wrench as ServiceProviderIcon, CreditCard as SubscriptionIcon, Calendar as EventIcon, MessageSquare as CommunityIcon, BarChart3 as ReportsIcon, Crown as ClubIcon, Star as InfluencerIcon, Building2 as CityIcon, Building2 } from "lucide-react"; // Adicionado Building2
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities"; // Para logout

// Estrutura do Sidebar
const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "AdminDashboard" },
    { title: "Configurações do Site", icon: <Settings className="w-5 h-5" />, path: "SiteConfiguration" },
    { title: "Cidades", icon: <CityIcon className="w-5 h-5" />, path: "Cities" }, // CityIcon já era Building2
    { title: "Praias", icon: <BeachIcon className="w-5 h-5" />, path: "Beaches" },
    { title: "Imóveis", icon: <HomeIcon className="w-5 h-5" />, path: "Properties" },
    { title: "Categorias de Imóveis", icon: <ListIcon className="w-5 h-5" />, path: "PropertyCategoriesAdmin" },
    { title: "Imobiliárias", icon: <Building2 className="w-5 h-5" />, path: "Realtors"}, // Usando Building2 aqui
    { title: "Comércios", icon: <BusinessIcon className="w-5 h-5" />, path: "Businesses" },
    { title: "Prestadores", icon: <ServiceProviderIcon className="w-5 h-5" />, path: "ServiceProviders" },
    { title: "Turistas/Usuários", icon: <Users className="w-5 h-5" />, path: "Tourists" },
    { title: "Planos de Assinatura", icon: <SubscriptionIcon className="w-5 h-5" />, path: "SubscriptionPlansAdmin" },
    { title: "Eventos", icon: <EventIcon className="w-5 h-5" />, path: "EventsAdmin" },
    { title: "Comunidade", icon: <CommunityIcon className="w-5 h-5" />, path: "Community" },
    { title: "Relatórios", icon: <ReportsIcon className="w-5 h-5" />, path: "FinancialDashboard" },
    { title: "Clube (Cartão)", icon: <ClubIcon className="w-5 h-5" />, path: "CardSettings" },
    { title: "Influenciadores", icon: <InfluencerIcon className="w-5 h-5" />, path: "InfluencerDashboard" },
    // Adicione mais itens conforme necessário
  ];

  const handleLogout = async () => {
    try {
      // Se você tiver uma função User.logout(), use-a.
      // Caso contrário, limpe o localStorage e redirecione.
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      navigate(createPageUrl("Public"));
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)}></div>}
      
      <aside className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 p-4 space-y-6 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 shadow-lg`}>
        <div className="flex items-center justify-between">
          <Link to={createPageUrl("AdminDashboard")} className="text-2xl font-semibold flex items-center">
            <LayoutDashboard className="w-7 h-7 mr-2 text-blue-400" />
            Admin
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-gray-700" onClick={() => setIsOpen(false)}>
            <ChevronLeft />
          </Button>
        </div>
        <nav className="flex-grow overflow-y-auto h-[calc(100vh-120px)] pr-2"> {/* Ajuste de altura e padding para scrollbar */}
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.title}>
                <Link
                  to={createPageUrl(item.path)}
                  className="flex items-center py-2.5 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsOpen(false)} // Fecha o menu no mobile ao clicar
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pt-4 border-t border-gray-700">
            <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={handleLogout}
            >
                <LogOut className="w-5 h-5 mr-3" /> Sair
            </Button>
        </div>
      </aside>
    </>
  );
};

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col lg:ml-64"> {/* Adiciona margin-left no desktop */}
        {/* Header simples para mobile */}
        <header className="lg:hidden bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
            <Link to={createPageUrl("AdminDashboard")} className="text-xl font-semibold flex items-center text-gray-800">
                <LayoutDashboard className="w-6 h-6 mr-2 text-blue-600" />
                Admin Panel
            </Link>
            <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <ListIcon className="h-5 w-5" />
            </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
