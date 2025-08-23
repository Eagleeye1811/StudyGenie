import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 4000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message, duration) =>
    addToast(message, "success", duration);
  const showError = (message, duration) => addToast(message, "error", duration);
  const showInfo = (message, duration) => addToast(message, "info", duration);

  return (
    <ToastContext.Provider
      value={{ addToast, showSuccess, showError, showInfo }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const getToastStyles = () => {
    const baseStyles =
      "px-6 py-4 rounded-lg shadow-lg text-white font-medium min-w-[300px] transform transition-all duration-300 ease-in-out";

    switch (toast.type) {
      case "success":
        return `${baseStyles} bg-green-500`;
      case "error":
        return `${baseStyles} bg-red-500`;
      case "info":
        return `${baseStyles} bg-blue-500`;
      default:
        return `${baseStyles} bg-gray-500`;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <span>{toast.message}</span>
        <button
          onClick={onRemove}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
