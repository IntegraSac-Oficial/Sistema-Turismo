import React from 'react';

// Este é um arquivo JS que pode ser importado em outros componentes
// para usar as variáveis de estilo

export const colors = {
  primary: "#007BFF",
  primaryDark: "#0069d9",
  primaryLight: "#E1F5FE",
  
  secondary: "#FFC107",
  secondaryDark: "#FFA000",
  secondaryLight: "#FFF8E1",
  
  accent: "#FF5722",
  accentDark: "#E64A19",
  accentLight: "#FFCCBC",
  
  background: "#FFFFFF",
  backgroundAlt: "#F5F7FA",
  
  success: "#4CAF50",
  successLight: "#E8F5E9",
  
  warning: "#FFC107",
  warningLight: "#FFF8E1",
  
  error: "#F44336",
  errorLight: "#FFEBEE",
  
  text: "#1A1A1A",
  textSecondary: "#616161",
  textLight: "#9E9E9E",
};

export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
};

export const shadows = {
  sm: "0 2px 4px rgba(0,0,0,0.1)",
  md: "0 4px 6px rgba(0,0,0,0.1)",
  lg: "0 10px 15px rgba(0,0,0,0.1)",
};

// Componente que pode adicionar as variáveis CSS à raiz do documento
export const StyleProvider = ({ children }) => {
  return (
    <>
      <style jsx global>{`
        :root {
          --color-primary: ${colors.primary};
          --color-primary-dark: ${colors.primaryDark};
          --color-primary-light: ${colors.primaryLight};
          
          --color-secondary: ${colors.secondary};
          --color-secondary-dark: ${colors.secondaryDark};
          --color-secondary-light: ${colors.secondaryLight};
          
          --color-accent: ${colors.accent};
          --color-accent-dark: ${colors.accentDark};
          --color-accent-light: ${colors.accentLight};
          
          --color-background: ${colors.background};
          --color-background-alt: ${colors.backgroundAlt};
          
          --color-success: ${colors.success};
          --color-success-light: ${colors.successLight};
          
          --color-warning: ${colors.warning};
          --color-warning-light: ${colors.warningLight};
          
          --color-error: ${colors.error};
          --color-error-light: ${colors.errorLight};
          
          --color-text: ${colors.text};
          --color-text-secondary: ${colors.textSecondary};
          --color-text-light: ${colors.textLight};
          
          --radius-sm: ${borderRadius.sm};
          --radius-md: ${borderRadius.md};
          --radius-lg: ${borderRadius.lg};
          --radius-xl: ${borderRadius.xl};
          
          --shadow-sm: ${shadows.sm};
          --shadow-md: ${shadows.md};
          --shadow-lg: ${shadows.lg};
        }
      `}</style>
      {children}
    </>
  );
};

export default StyleProvider;