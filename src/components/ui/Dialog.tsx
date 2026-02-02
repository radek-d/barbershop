import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "alert" | "confirm" | "prompt";
  onConfirm?: (value?: string) => void;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  type = "alert",
  onConfirm,
  confirmText = "OK",
  cancelText = "Anuluj",
  placeholder = "",
  defaultValue = "",
}: DialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(type === "prompt" ? inputValue : undefined);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="p-8 space-y-6">
        <p className="text-gray-600 leading-relaxed">{message}</p>

        {type === "prompt" && (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full"
            autoFocus
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          {(type === "confirm" || type === "prompt") && (
            <Button variant="outline" onClick={onClose} className="px-6">
              {cancelText}
            </Button>
          )}
          <Button variant="primary" onClick={handleConfirm} className="px-8">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
