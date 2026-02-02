import { Modal } from "../ui/Modal";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function BookingModal({ isOpen, onClose, children, title }: ModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Zarezerwuj wizytę"}
    >
      {children}
    </Modal>
  );
}
