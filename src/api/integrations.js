import { base44 } from './base44Client';

// Modo mock ativado
const USE_MOCK = true;

// Mock para integrations
const mockIntegration = async (...args) => {
  console.log('Mock integration called with:', args);
  return { success: true, message: 'Mock integration executed' };
};

const mockCore = {
  InvokeLLM: mockIntegration,
  SendEmail: mockIntegration,
  UploadFile: mockIntegration,
  GenerateImage: mockIntegration,
  ExtractDataFromUploadedFile: mockIntegration
};

export const Core = USE_MOCK ? mockCore : base44.integrations?.Core;
export const InvokeLLM = USE_MOCK ? mockIntegration : base44.integrations?.Core?.InvokeLLM;
export const SendEmail = USE_MOCK ? mockIntegration : base44.integrations?.Core?.SendEmail;
export const UploadFile = USE_MOCK ? mockIntegration : base44.integrations?.Core?.UploadFile;
export const GenerateImage = USE_MOCK ? mockIntegration : base44.integrations?.Core?.GenerateImage;
export const ExtractDataFromUploadedFile = USE_MOCK ? mockIntegration : base44.integrations?.Core?.ExtractDataFromUploadedFile;
