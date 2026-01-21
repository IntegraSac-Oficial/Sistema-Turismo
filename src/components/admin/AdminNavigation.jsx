import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  Shield,
  Building2,
  Waves,
  Store,
  Wrench,
  Users,
  Star,
  Calendar,
  Settings,
  CreditCard,
  Home,
  List,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNavigation({ className }) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "Dashboard",
      description: "Métricas e relatórios"
    },
    {
      title: "Painel Admin",
      icon: <Shield className="w-5 h-5" />,
      path: "AdminDashboard",
      description: "Visão geral administrativa"
    },
    {
      title: "Cidades",
      icon: <Building2 className="w-5 h-5" />,
      path: "Cities",
      description: "Gerenciar cidades"
    },
    {
      title: "Praias",
      icon: <Waves className="w-5 h-5" />,
      path: "Beaches",
      description: "Gerenciar praias"
    },
    {
      title: "Comércios",
      icon: <Store className="w-5 h-5" />,
      path: "Businesses",
      description: "Gerenciar comércios"
    },
    {
      title: "Prestadores",
      icon: <Wrench className="w-5 h-5" />,
      path: "ServiceProviders",
      description: "Gerenciar prestadores"
    }
    // Adicione outros itens conforme necessário
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {menuItems.map((item, index) => {
        const isActive = currentPath === `/${item.path}`;
        return (
          <Link key={index} to={createPageUrl(item.path)} className="inline-block">
            <Button 
              variant={isActive ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                isActive ? "bg-blue-600" : "border-gray-300"
              }`}
              size="sm"
            >
              {item.icon}
              <span>{item.title}</span>
              {item.hasSubmenu && <ChevronRight className="w-4 h-4" />}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}