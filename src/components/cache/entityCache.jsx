/**
 * Sistema avançado de cache para entidades
 * Implementa vários níveis de cache e estratégias para evitar rate limits
 */

class EntityCache {
  constructor() {
    this.memoryCache = {}; // Cache em memória (mais rápido, não persiste entre recargas)
    this.timestamps = {};  // Timestamps para controle de expiração
    this.expiry = {
      short: 30 * 1000,      // 30 segundos
      medium: 5 * 60 * 1000, // 5 minutos
      long: 60 * 60 * 1000   // 1 hora
    };
    
    // Estatísticas para diagnóstico
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      entityStats: {}
    };
    
    // Fila de atualizações pendentes para evitar perder dados durante rate limits
    this.pendingUpdates = {};
    
    // Inicializar estatísticas para cada entidade no localStorage
    this._initializeStats();
  }
  
  _initializeStats() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('entity_cache_') && !key.includes('timestamp')) {
          const entity = key.replace('entity_cache_', '');
          this._initEntityStats(entity);
        }
      });
    } catch (e) {
      console.warn('Erro ao inicializar estatísticas de cache:', e);
    }
  }
  
  _initEntityStats(entity) {
    if (!this.stats.entityStats[entity]) {
      this.stats.entityStats[entity] = {
        hits: 0,
        misses: 0,
        writes: 0,
        lastAccess: null,
        lastWrite: null
      };
    }
  }
  
  // Salva dados no cache com estratégia multi-nível
  set(entityName, data) {
    this._initEntityStats(entityName);
    this.stats.writes++;
    this.stats.entityStats[entityName].writes++;
    this.stats.entityStats[entityName].lastWrite = new Date();
    
    // Cache em memória
    this.memoryCache[entityName] = data;
    this.timestamps[entityName] = Date.now();
    
    // Sempre salvar no localStorage, mas com uma pequena janela de debounce
    if (this.pendingUpdates[entityName]) {
      clearTimeout(this.pendingUpdates[entityName]);
    }
    
    this.pendingUpdates[entityName] = setTimeout(() => {
      try {
        localStorage.setItem(`entity_cache_${entityName}`, JSON.stringify(data));
        localStorage.setItem(`entity_cache_timestamp_${entityName}`, Date.now().toString());
      } catch (error) {
        console.warn(`Erro ao salvar cache de ${entityName} no localStorage:`, error);
        this._cleanupStorage(); // Tentar limpar armazenamento antigo
      } finally {
        delete this.pendingUpdates[entityName];
      }
    }, 100);
    
    return data;
  }
  
  // Obtém dados do cache com estratégia de fallback
  get(entityName, expiryType = 'medium') {
    this._initEntityStats(entityName);
    this.stats.entityStats[entityName].lastAccess = new Date();
    
    const expiry = this.expiry[expiryType] || this.expiry.medium;
    
    // 1. Tentar cache em memória primeiro (mais rápido)
    const memData = this.memoryCache[entityName];
    const memTimestamp = this.timestamps[entityName] || 0;
    const memIsExpired = Date.now() - memTimestamp > expiry;
    
    if (memData && !memIsExpired) {
      this.stats.hits++;
      this.stats.entityStats[entityName].hits++;
      return memData;
    }
    
    // 2. Tentar localStorage
    try {
      const storedData = localStorage.getItem(`entity_cache_${entityName}`);
      const storedTimestamp = localStorage.getItem(`entity_cache_timestamp_${entityName}`);
      
      if (storedData && storedTimestamp) {
        const data = JSON.parse(storedData);
        const isExpired = Date.now() - parseInt(storedTimestamp) > expiry;
        
        // Se não expirou, sincronizar com cache em memória e retornar
        if (!isExpired) {
          this.memoryCache[entityName] = data;
          this.timestamps[entityName] = parseInt(storedTimestamp);
          this.stats.hits++;
          this.stats.entityStats[entityName].hits++;
          return data;
        }
        
        // Se expirou mas estamos aceitando dados expirados
        if (expiryType === 'long') {
          this.stats.hits++;
          this.stats.entityStats[entityName].hits++;
          return data;
        }
        
        // Se expirou, atualizar estatísticas e usar fallback
        this.stats.misses++;
        this.stats.entityStats[entityName].misses++;
        return null;
      }
    } catch (error) {
      console.warn(`Erro ao ler cache de ${entityName}:`, error);
    }
    
    this.stats.misses++;
    this.stats.entityStats[entityName].misses++;
    return null;
  }
  
  // Verifica se um cache válido existe (não expirado)
  has(entityName, expiryType = 'medium') {
    return this.get(entityName, expiryType) !== null;
  }
  
  // Obtém dados expirados do cache (útil para fallbacks em caso de erro)
  getExpired(entityName) {
    return this.get(entityName, 'long');
  }
  
  // Limpa cache específico
  clear(entityName) {
    delete this.memoryCache[entityName];
    delete this.timestamps[entityName];
    
    try {
      localStorage.removeItem(`entity_cache_${entityName}`);
      localStorage.removeItem(`entity_cache_timestamp_${entityName}`);
    } catch (error) {
      console.warn(`Erro ao remover cache de ${entityName}:`, error);
    }
  }
  
  // Limpa todos os caches
  clearAll() {
    this.memoryCache = {};
    this.timestamps = {};
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('entity_cache_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Resetar estatísticas
      this.stats = {
        hits: 0,
        misses: 0,
        writes: 0,
        entityStats: {}
      };
      
    } catch (error) {
      console.warn('Erro ao limpar todos os caches:', error);
    }
  }
  
  // Tenta liberar espaço no localStorage removendo itens antigos
  _cleanupStorage() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(k => k.startsWith('entity_cache_') && !k.includes('timestamp'));
      
      if (cacheKeys.length > 0) {
        // Remover pelo menos um cache para liberar espaço
        const randomKey = cacheKeys[Math.floor(Math.random() * cacheKeys.length)];
        localStorage.removeItem(randomKey);
        localStorage.removeItem(randomKey.replace('entity_cache_', 'entity_cache_timestamp_'));
        console.log(`Storage cleanup: removido ${randomKey}`);
      }
    } catch (e) {
      console.error('Erro durante limpeza de storage:', e);
    }
  }
  
  // Obter estatísticas de cache
  getStats() {
    return {
      ...this.stats,
      cacheSize: this._calculateCacheSize()
    };
  }
  
  _calculateCacheSize() {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(k => k.startsWith('entity_cache_'));
      
      for (const key of cacheKeys) {
        const value = localStorage.getItem(key);
        totalSize += value ? value.length * 2 : 0; // Aproximação em bytes (2 bytes por caractere)
      }
      
      return {
        bytes: totalSize,
        kilobytes: (totalSize / 1024).toFixed(2) + ' KB'
      };
    } catch (e) {
      return { error: e.toString() };
    }
  }
}

// Exportar uma única instância do cache
export default new EntityCache();