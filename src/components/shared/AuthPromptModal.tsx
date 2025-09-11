import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthPromptModal = ({ isOpen, onClose }: AuthPromptModalProps) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Esc key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 transition-opacity duration-200 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      tabIndex={-1}
      ref={modalRef}
    >
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-sm animate-fade-in">
        <h2 id="auth-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Please log in or sign up
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          You need to log in to request a service.
        </p>
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/login?type=customer");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition w-full"
          >
            Login as Customer
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/login?type=vendor");
            }}
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded transition w-full"
          >
            Login as Vendor
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthPromptModal;
