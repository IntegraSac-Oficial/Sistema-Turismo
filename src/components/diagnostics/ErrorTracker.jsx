import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Componente para rastrear, monitorar e diagnosticar erros na aplicação
 */
export default function ErrorTracker() {
  const [errors, setErrors] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState({
    apiCalls: {},
    cacheMisses: {},
    cacheSizes: {},
    responseTime: {}
  });
  
  useEffect(() => {
    // Configurar o monitoramento de erros
    const originalFetch = window.fetch;
    let errorCount = 0;
    
    // Substituir fetch para monitoramento
    window.fetch = async (...args) => {
      const url = args[0];
      const start = Date.now();
      const entityMatch = url.match(/\/entities\/([^/?]+)/);
      const entityName = entityMatch ? entityMatch[1] : 'unknown';
      
      // Incrementar contagem de chamadas
      setMetrics(prev => ({
        ...prev,
        apiCalls: {
          ...prev.apiCalls,
          [entityName]: (prev.apiCalls[entityName] || 0) + 1
        }
      }));
      
      try {
        const response = await originalFetch(...args);
        
        // Registrar tempo de resposta
        const responseTime = Date.now() - start;
        setMetrics(prev => ({
          ...prev,
          responseTime: {
            ...prev.responseTime,
            [entityName]: [...(prev.responseTime[entityName] || []), responseTime].slice(-5)
          }
        }));
        
        // Se houver erro na resposta
        if (!response.ok) {
          const responseClone = response.clone();
          let errorText = '';
          let errorObj = {};
          
          try {
            errorObj = await responseClone.json();
            errorText = JSON.stringify(errorObj);
          } catch (e) {
            errorText = await responseClone.text();
          }
          
          const newError = {
            id: ++errorCount,
            url,
            status: response.status,
            statusText: response.statusText,
            entity: entityName,
            timestamp: new Date(),
            details: errorText
          };
          
          setErrors(prev => [newError, ...prev]);
        }
        
        return response;
      } catch (error) {
        // Erro de rede ou outro tipo de falha
        const newError = {
          id: ++errorCount,
          url,
          entity: entityName,
          timestamp: new Date(),
          error: error.toString(),
          details: error.stack
        };
        
        setErrors(prev => [newError, ...prev]);
        throw error;
      }
    };
    
    // Monitorar cache
    const monitorCache = () => {
      try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith('entity_cache_'));
        const entitiesSet = new Set();
        let totalCacheSize = 0;
        
        for (const key of cacheKeys) {
          if (!key.includes('timestamp')) {
            const entity = key.replace('entity_cache_', '');
            entitiesSet.add(entity);
            
            // Calcular tamanho aproximado em bytes
            const value = localStorage.getItem(key);
            totalCacheSize += value ? value.length * 2 : 0;
          }
        }
        
        setMetrics(prev => ({
          ...prev,
          cacheSizes: {
            total: `${(totalCacheSize / 1024).toFixed(2)} KB`,
            entities: [...entitiesSet]
          }
        }));
      } catch (e) {
        console.error('Erro ao monitorar cache:', e);
      }
    };
    
    monitorCache();
    const cacheInterval = setInterval(monitorCache, 30000); // verificar a cada 30s
    
    // Limpar
    return () => {
      window.fetch = originalFetch;
      clearInterval(cacheInterval);
    };
  }, []);
  
  // Exportar relatório de diagnóstico
  const exportDiagnostics = () => {
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      errors,
      metrics,
      localStorage: getLocalStorageSnapshot(),
      userAgent: navigator.userAgent
    };
    
    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const getLocalStorageSnapshot = () => {
    try {
      const snapshot = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('entity_cache_') && !key.includes('timestamp')) {
          const entity = key.replace('entity_cache_', '');
          try {
            const data = JSON.parse(localStorage.getItem(key));
            snapshot[entity] = {
              count: Array.isArray(data) ? data.length : 'not array',
              timestamp: localStorage.getItem(`entity_cache_timestamp_${entity}`)
            };
          } catch (e) {
            snapshot[entity] = { error: 'parse error' };
          }
        }
      }
      return snapshot;
    } catch (e) {
      return { error: e.toString() };
    }
  };
  
  // Limpar cache forçadamente
  const clearAllCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('entity_cache_')) {
          localStorage.removeItem(key);
        }
      });
      setErrors([]);
      setMetrics(prev => ({...prev, cacheSizes: { total: '0 KB', entities: [] }}));
      alert('Cache limpo com sucesso! A página será recarregada.');
      window.location.reload();
    } catch (e) {
      console.error('Erro ao limpar cache:', e);
      alert('Erro ao limpar cache: ' + e.toString());
    }
  };
  
  if (errors.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button 
          onClick={() => setIsExpanded(true)}
          className="bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          {errors.length} {errors.length === 1 ? 'erro' : 'erros'} detectados
        </Button>
      ) : (
        <Card className="w-[400px] max-h-[500px] overflow-auto shadow-xl">
          <CardHeader className="bg-amber-50 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <CardTitle className="text-amber-800 flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Diagnóstico de Erros ({errors.length})
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={clearAllCache}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Limpar Cache
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={exportDiagnostics}
              >
                <Download className="h-3 w-3 mr-1" />
                Exportar Diagnóstico
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Estatísticas de API</h3>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(metrics.apiCalls).map(([entity, count]) => (
                    <div key={entity} className="flex justify-between">
                      <span>{entity}:</span>
                      <Badge variant={count > 10 ? "destructive" : "outline"}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Erros Recentes</h3>
                <div className="space-y-2">
                  {errors.slice(0, 5).map(error => (
                    <div 
                      key={error.id} 
                      className="text-xs p-2 bg-red-50 border border-red-200 rounded"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{error.entity || 'Desconhecido'}</span>
                        <Badge variant="destructive">{error.status || 'Erro'}</Badge>
                      </div>
                      <div className="text-gray-600 truncate">{error.url}</div>
                      <div className="text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Cache</h3>
                <div className="text-xs">
                  <div>Tamanho total: {metrics.cacheSizes.total || '0 KB'}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {metrics.cacheSizes.entities?.map(entity => (
                      <Badge key={entity} variant="secondary" className="text-[10px]">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}