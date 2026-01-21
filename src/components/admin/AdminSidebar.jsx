import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building2,
  Waves,
  Store,
  Wrench,
  Users,
  Star,
  Calendar,
  Settings,
  Shield,
  CreditCard,
  Home,
  List
} from 'lucide-react';

export default function AdminSidebar({ activePath }) {
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "Dashboard"
    },
    {
      title: "Admin Dashboard",
      icon: <Shield className="w-5 h-5" />,
      path: "AdminDashboard"
    },
    {
      title: "Cidades",
      icon: <Building2 className="w-5 h-5" />,
      path: "Cities"
    },
    {
      title: "Praias",
      icon: <Waves className="w-5 h-5" />,
      path: "Beaches"
    },
    {
      title: "Comércios",
      icon: <Store className="w-5 h-5" />,
      path: "Businesses"
    },
    {
      title: "Prestadores",
      icon: <Wrench className="w-5 h-5" />,
      path: "ServiceProviders"
    },
    {
      title: "Turistas",
      icon: <Users className="w-5 h-5" />,
      path: "Tourists"
    },
    {
      title: "Avaliações",
      icon: <Star className="w-5 h-5" />,
      path: "Reviews"
    },
    {
      title: "Eventos",
      icon: <Calendar className="w-5 h-5" />,
      path: "EventsAdmin"
    },
    {
      title: "Cartão Clube",
      icon: <CreditCard className="w-5 h-5" />,
      path: "CardSettings"
    },
    {
      title: "Imóveis",
      icon: <Home className="w-5 h-5" />,
      path: "Properties"
    },
    {
      title: "Categorias",
      icon: <List className="w-5 h-5" />,
      path: "PropertyCategoriesAdmin"
    },
    {
      title: "Configurações",
      icon: <Settings className="w-5 h-5" />,
      path: "SiteConfiguration"
    }
  ];

  return (
    <div className="bg-white w-64 shadow-md h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Administração</h2>
      </div>
      <div className="flex flex-col p-4 gap-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={createPageUrl(item.path)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md ${
              activePath === item.path
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}