"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AlertModal } from "@/components/modals/AlertModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

type ModalType = "alert" | "confirm" | null;

interface ModalData {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: "default" | "warning" | "error" | "success";
}

interface ModalContextType {
  showAlert: (data: Omit<ModalData, "onConfirm" | "cancelText">) => void;
  showConfirm: (data: ModalData) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<ModalType>(null);
  const [data, setData] = useState<ModalData | null>(null);
  const [loading, setLoading] = useState(false);

  const showAlert = useCallback(
    (modalData: Omit<ModalData, "onConfirm" | "cancelText">) => {
      setData(modalData);
      setType("alert");
    },
    [],
  );

  const showConfirm = useCallback((modalData: ModalData) => {
    setData(modalData);
    setType("confirm");
  }, []);

  const hideModal = useCallback(() => {
    setType(null);
    setData(null);
    setLoading(false);
  }, []);

  const handleConfirm = async () => {
    if (data?.onConfirm) {
      try {
        setLoading(true);
        await data.onConfirm();
      } catch (error) {
        console.error("Modal confirm error:", error);
      } finally {
        setLoading(false);
        hideModal();
      }
    } else {
      hideModal();
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, hideModal }}>
      {children}
      {type === "alert" && data && (
        <AlertModal
          isOpen={true}
          onClose={hideModal}
          title={data.title}
          description={data.description}
          variant={data.variant}
        />
      )}
      {type === "confirm" && data && (
        <ConfirmModal
          isOpen={true}
          onClose={hideModal}
          onConfirm={handleConfirm}
          title={data.title}
          description={data.description}
          confirmText={data.confirmText}
          cancelText={data.cancelText}
          loading={loading}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
