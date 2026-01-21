import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = (options) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || "default",
      duration: options.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  };

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div 
        data-toast-provider="true"
        className="fixed bottom-0 right-0 z-50 p-4 flex flex-col items-end space-y-4 max-w-[420px]"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ id, title, description, variant = "default", onDismiss }) {
  const getIconByVariant = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColorByVariant = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200";
      case "destructive":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <div
      className={`rounded-lg border shadow-sm p-4 w-full flex items-start gap-3 ${getBackgroundColorByVariant()}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIconByVariant()}
      </div>
      <div className="flex-1">
        {title && <h3 className="font-medium text-gray-900">{title}</h3>}
        {description && <div className="text-sm text-gray-600 mt-1">{description}</div>}
      </div>
      <button 
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        onClick={onDismiss}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export const toast = (options) => {
  // Verificar se o provedor de toast está disponível no DOM
  const toastContainer = document.querySelector('[data-toast-provider="true"]');
  
  if (!toastContainer) {
    // Se o provedor não estiver disponível, use alert como fallback
    if (options.description) {
      alert(`${options.title || ''}\n${options.description}`);
    } else {
      alert(options.title || '');
    }
    return;
  }
  
  // Se o provedor estiver disponível, use o contexto
  try {
    const context = useContext(ToastContext);
    if (context?.toast) {
      return context.toast(options);
    } else {
      console.error("Toast context not available");
      alert(`${options.title || ''}\n${options.description || ''}`);
    }
  } catch (error) {
    console.error("Error using toast context:", error);
    alert(`${options.title || ''}\n${options.description || ''}`);
  }
}