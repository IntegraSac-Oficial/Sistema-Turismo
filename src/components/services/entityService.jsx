/**
 * Serviço otimizado para gerenciamento de entidades
 */
import entityCache from "@/components/cache/entityCache";
import requestQueue from "@/components/services/requestQueue";

// Configurações
const CACHE_EXPIRY = {
  SHORT: 'short',   // 30 segundos
  MEDIUM: 'medium', // 5 minutos
  LONG: 'long'      // 1 hora
};

const PRIORITY = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3
};

// Mapear prioridades por tipo de entidade
const entityPriorities = {
  // Entidades críticas para o funcionamento do app
  SiteConfig: PRIORITY.CRITICAL,
  PropertyCategory: PRIORITY.HIGH,
  City: PRIORITY.HIGH,
  
  // Entidades de dados principais
  Property: PRIORITY.NORMAL,
  Realtor: PRIORITY.NORMAL,
  Beach: PRIORITY.NORMAL,
  Business: PRIORITY.NORMAL,
  
  // Entidades secundárias
  Review: PRIORITY.LOW,
  Post: PRIORITY.LOW,
  Comment: PRIORITY.LOW
};

/**
 * Carrega dados de uma entidade com cache e controle de concorrência
 * @param {Object} Entity - Classe da entidade do Base44
 * @param {string} entityName - Nome da entidade
 * @param {Function} filterFn - Função opcional para filtrar dados após carregados
 * @param {Object} options - Opções adicionais
 */
export async function loadEntityData(Entity, entityName, filterFn = null, options = {}) {
  const {
    forceRefresh = false,
    expiry = CACHE_EXPIRY.MEDIUM,
    priority = entityPriorities[entityName] || PRIORITY.NORMAL,
    fallbackToExpired = true,
    errorHandler = null
  } = options;
  
  try {
    // Se não foi forçado refresh e temos cache válido
    if (!forceRefresh && entityCache.has(entityName, expiry)) {
      const cachedData = entityCache.get(entityName, expiry);
      return filterFn ? cachedData.filter(filterFn) : cachedData;
    }
    
    // Colocar requisição na fila com prioridade específica
    return await requestQueue.enqueue(entityName, async () => {
      // Verificar novamente o cache para caso outra requisição tenha atualizado
      if (!forceRefresh && entityCache.has(entityName, expiry)) {
        const cachedData = entityCache.get(entityName, expiry);
        return filterFn ? cachedData.filter(filterFn) : cachedData;
      }
      
      // Fazer requisição à API
      const data = await Entity.list();
      
      // Salvar no cache
      entityCache.set(entityName, data || []);
      
      // Retornar dados filtrados se necessário
      return filterFn ? (data || []).filter(filterFn) : (data || []);
    }, priority);
  } catch (error) {
    // Registrar erro
    console.error(`Erro ao carregar dados de ${entityName}:`, error);
    
    // Tratar erro com handler personalizado
    if (errorHandler) {
      return errorHandler(error);
    }
    
    // Fallback para cache expirado se permitido
    if (fallbackToExpired) {
      const expiredData = entityCache.getExpired(entityName);
      if (expiredData) {
        console.warn(`Usando cache expirado para ${entityName} devido a erro:`, error);
        return filterFn ? expiredData.filter(filterFn) : expiredData;
      }
    }
    
    // Repassar erro
    throw error;
  }
}

/**
 * Versão otimizada do carregamento de múltiplas entidades
 * @param {Array} requests - Array de objetos {Entity, entityName, filterFn, options}
 */
export async function loadMultipleEntities(requests) {
  // Carregar primeiro entidades críticas, depois as outras em paralelo
  const criticalRequests = requests.filter(req => 
    (entityPriorities[req.entityName] === PRIORITY.CRITICAL || entityPriorities[req.entityName] === PRIORITY.HIGH)
  );
  
  const normalRequests = requests.filter(req => 
    (entityPriorities[req.entityName] !== PRIORITY.CRITICAL && entityPriorities[req.entityName] !== PRIORITY.HIGH)
  );
  
  // Processar requisições críticas em série
  const criticalResults = [];
  for (const req of criticalRequests) {
    try {
      const data = await loadEntityData(
        req.Entity, 
        req.entityName, 
        req.filterFn, 
        req.options
      );
      criticalResults.push({status: 'fulfilled', value: data});
    } catch (error) {
      criticalResults.push({status: 'rejected', reason: error});
    }
  }
  
  // Processar requisições normais em paralelo com Promise.allSettled
  const normalPromises = normalRequests.map(req => 
    loadEntityData(req.Entity, req.entityName, req.filterFn, req.options)
      .then(data => ({status: 'fulfilled', value: data}))
      .catch(error => ({status: 'rejected', reason: error}))
  );
  
  const normalResults = await Promise.all(normalPromises);
  
  // Combinar resultados na mesma ordem das requisições
  return requests.map(req => {
    const isRequestCritical = 
      entityPriorities[req.entityName] === PRIORITY.CRITICAL || 
      entityPriorities[req.entityName] === PRIORITY.HIGH;
    
    if (isRequestCritical) {
      const index = criticalRequests.findIndex(r => r.entityName === req.entityName);
      return criticalResults[index];
    } else {
      const index = normalRequests.findIndex(r => r.entityName === req.entityName);
      return normalResults[index];
    }
  });
}

export { CACHE_EXPIRY, PRIORITY };