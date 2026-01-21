import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Layout({ children, currentPageName }) {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Define quais caminhos são públicos e administrativos
  const publicPaths = ['/Public', '/PublicBusinesses', '/PublicBeaches', '/PublicCities', '/SubscriptionPlans', '/Cadastro'];
  const adminPaths = ['/Dashboard', '/AdminDashboard', '/Businesses', '/Cities', '/Beaches'];
  
  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          if (!isPublicPath) {
            window.location.href = '/UserAccount';
          }
          return;
        }

        const user = JSON.parse(storedUser);
        
        // Se for o admin master, permitir acesso a todas as páginas
        if (user.email === 'contato.jrsn@gmail.com') {
          setIsLoading(false);
          return;
        }

        // Para outros usuários, verificar restrições
        if (isAdminPath && user.email !== 'contato.jrsn@gmail.com') {
          window.location.href = '/UserAccount';
          return;
        }

      } catch (error) {
        console.error("Erro de autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [location.pathname, isPublicPath, isAdminPath]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return <>{children}</>;
}