import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "67cdc2dae19d3e85f6c3a4b4", 
  requiresAuth: false // Temporarily disabled to view the interface
});
