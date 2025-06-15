import React from "react";
import { Modal, Button } from "flowbite-react";
import { Icon } from "@iconify/react";

interface ConfirmModalProps {
  show: boolean;
  title?: string;
  description: React.ReactNode; // Mudança aqui: Element -> React.ReactNode
  confirmText?: string;
  isProcessing?: boolean;
  confirmButtonColor?: "red" | "blue" | "green" | "yellow";
  isLoading?: boolean;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  title = "Você tem certeza?",
  description,
  confirmText = "Sim, continuar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isProcessing,
  confirmButtonColor = "blue",
}) => {
  return (
    <Modal show={show} size="md" onClose={onCancel} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <Icon
            icon="line-md:alert-loop"
            width="48"
            height="48"
            className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200"
          />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <div className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              color={confirmButtonColor} 
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Processando..." : confirmText}
            </Button>
            <Button color="gray" onClick={onCancel} disabled={isProcessing}>
              {cancelText}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};