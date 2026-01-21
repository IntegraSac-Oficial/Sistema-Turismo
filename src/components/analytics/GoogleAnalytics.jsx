import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TRACKING_ID = 'G-2MST69PQ4L'; // ID de rastreamento do Google Analytics

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Carrega o script do Google Analytics
    const loadGoogleAnalytics = () => {
      // Verifica se o script já existe para não adicionar duplicados
      if (document.getElementById('google-analytics')) return;
      
      // Cria o script do Google Tag Manager
      const script = document.createElement('script');
      script.id = 'google-analytics';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
      document.head.appendChild(script);
      
      // Configura o gtag
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', TRACKING_ID, {
        send_page_view: false // Não enviar visualização de página agora, faremos isso manualmente
      });
      
      // Disponibiliza o gtag globalmente
      window.gtag = gtag;
    };
    
    loadGoogleAnalytics();
    
    // Função para enviar visualização de página
    const sendPageView = () => {
      if (!window.gtag) return;
      
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      });
      
      console.log('Analytics: Página visualizada:', location.pathname + location.search);
    };
    
    // Enviar visualização de página cada vez que a rota mudar
    sendPageView();
    
  }, [location]);
  
  return null; // Este componente não renderiza nada visível
}