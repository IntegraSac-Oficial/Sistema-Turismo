/**
 * Serviço para gerenciamento de requisições simultâneas
 * Controla o número de requisições e implementa fila
 */

// Fila de requisições pendentes
class RequestQueue {
  constructor(maxConcurrent = 2) {
    this.queue = []; // Fila de requisições pendentes
    this.running = 0; // Requisições em andamento
    this.maxConcurrent = maxConcurrent; // Limite máximo de requisições simultâneas
    this.entityQueues = new Map(); // Filas por entidade, para priorização
  }

  /**
   * Adiciona uma requisição à fila e executa quando possível
   * @param {string} entityName - Nome da entidade para agrupamento
   * @param {Function} requestFn - Função que faz a requisição
   * @param {number} priority - Prioridade da requisição (número maior = maior prioridade)
   * @returns {Promise} - Resultado da requisição
   */
  enqueue(entityName, requestFn, priority = 1) {
    return new Promise((resolve, reject) => {
      const request = { entityName, requestFn, priority, resolve, reject };
      
      // Verificar se já existe outra requisição para a mesma entidade
      if (this.entityQueues.has(entityName)) {
        this.entityQueues.get(entityName).push(request);
      } else {
        this.entityQueues.set(entityName, [request]);
      }
      
      this.queue.push(request);
      
      // Ordenar fila por prioridade
      this.queue.sort((a, b) => b.priority - a.priority);
      
      // Tentar executar
      this.processQueue();
    });
  }

  /**
   * Processa a fila de requisições, respeitando o limite de simultâneas
   */
  processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Obter próxima requisição da fila
    const request = this.queue.shift();
    const { entityName, requestFn, resolve, reject } = request;
    
    // Atualizar contagem de requisições em andamento
    this.running++;
    
    // Executar a requisição
    requestFn()
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {
        // Atualizar contagem ao concluir
        this.running--;
        
        // Remover da fila da entidade
        if (this.entityQueues.has(entityName)) {
          const entityQueue = this.entityQueues.get(entityName);
          const index = entityQueue.findIndex(r => r === request);
          if (index >= 0) {
            entityQueue.splice(index, 1);
          }
          
          if (entityQueue.length === 0) {
            this.entityQueues.delete(entityName);
          }
        }
        
        // Continuar processamento
        setTimeout(() => this.processQueue(), 100);
      });
  }
}

// Exportar instância singleton
const requestQueue = new RequestQueue(3); // Limitar a 3 requisições simultâneas

export default requestQueue;