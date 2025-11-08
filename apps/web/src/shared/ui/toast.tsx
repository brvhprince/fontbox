"use client";

import { createContext, useContext, useState } from "react";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider as UiToastProvider,
  ToastTitle,
  ToastViewport
} from "@fontbox/ui";

type ToastVariant = "default" | "destructive";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: ToastVariant;
}

interface ToastContextValue {
  notify: (message: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = (message: Omit<ToastMessage, "id">) => {
    const id = Date.now();
    setToasts((items) => [...items, { id, ...message }]);
  };

  const dismiss = (id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      <UiToastProvider swipeDirection="right" duration={4000}>
        {children}
        <ToastViewport />
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            onOpenChange={(open) => {
              if (!open) dismiss(toast.id);
            }}
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </div>
            {toast.actionLabel && toast.onAction && (
              <ToastAction altText={toast.actionLabel} onClick={toast.onAction}>
                {toast.actionLabel}
              </ToastAction>
            )}
            <ToastClose onClick={() => dismiss(toast.id)} />
          </Toast>
        ))}
      </UiToastProvider>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context.notify;
};
