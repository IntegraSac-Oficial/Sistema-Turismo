import { base44 } from './base44Client';

// Modo mock ativado
const USE_MOCK = true;

// Funções mock
const mockFunction = async (...args) => {
  console.log('Mock function called with:', args);
  return { success: true, message: 'Mock function executed' };
};

export const stripeIntegration = USE_MOCK ? mockFunction : base44.functions?.stripeIntegration;
export const stripeConfig = USE_MOCK ? mockFunction : base44.functions?.stripeConfig;
export const stripeWebhook = USE_MOCK ? mockFunction : base44.functions?.stripeWebhook;
export const createCheckoutSession = USE_MOCK ? mockFunction : base44.functions?.createCheckoutSession;
export const exportDatabaseData = USE_MOCK ? mockFunction : base44.functions?.exportDatabaseData;
export const trackBannerAnalytics = USE_MOCK ? mockFunction : base44.functions?.trackBannerAnalytics;