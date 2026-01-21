/**
 * Utilitários para rastreamento de eventos no Google Analytics
 */

/**
 * Envia um evento personalizado para o Google Analytics
 * @param {string} eventName - Nome do evento
 * @param {Object} eventParams - Parâmetros do evento
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, eventParams);
  console.log('Analytics: Evento enviado:', eventName, eventParams);
};

/**
 * Rastreia uma visualização de página específica
 * @param {string} pagePath - Caminho da página
 * @param {string} pageTitle - Título da página
 */
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_title: pageTitle || document.title,
    page_location: window.location.origin + pagePath,
    page_path: pagePath
  });
  
  console.log('Analytics: Visualização de página manual:', pagePath);
};

/**
 * Rastreia um evento de clique em um recurso
 * @param {string} itemId - ID do item clicado
 * @param {string} itemName - Nome do item
 * @param {string} itemCategory - Categoria do item (ex: 'property', 'city', etc)
 */
export const trackClick = (itemId, itemName, itemCategory) => {
  trackEvent('item_click', {
    item_id: itemId,
    item_name: itemName,
    item_category: itemCategory
  });
};

/**
 * Rastreia um evento de busca
 * @param {string} searchTerm - Termo buscado
 * @param {number} resultsCount - Quantidade de resultados encontrados
 * @param {string} category - Categoria da busca (ex: 'properties', 'cities')
 */
export const trackSearch = (searchTerm, resultsCount, category) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    category: category || 'all'
  });
};

/**
 * Rastreia uma conversão (ex: contato com corretor, visualização de telefone)
 * @param {string} conversionType - Tipo de conversão
 * @param {string} itemId - ID do item relacionado
 * @param {string} value - Valor da conversão (opcional)
 */
export const trackConversion = (conversionType, itemId, value) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    item_id: itemId,
    value: value
  });
};

/**
 * Rastreia tempo de permanência em uma página
 * @param {string} pagePath - Caminho da página
 * @param {number} timeSpentSeconds - Tempo gasto em segundos
 */
export const trackTimeSpent = (pagePath, timeSpentSeconds) => {
  if (timeSpentSeconds < 1) return;
  
  trackEvent('time_spent', {
    page_path: pagePath,
    seconds: timeSpentSeconds
  });
};

/**
 * Configura rastreamento de tempo de permanência para a página atual
 * Retorna uma função para parar o rastreamento
 */
export const setupTimeTracking = (pagePath) => {
  const startTime = Date.now();
  const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');
  
  return () => {
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    trackTimeSpent(path, timeSpentSeconds);
  };
};