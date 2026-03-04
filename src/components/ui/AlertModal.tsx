"use client";
import { useEffect } from "react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  hideConfirm?: boolean;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  hideConfirm,
}: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-400",
      iconBg: "bg-red-500/10",
      confirmBtn: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
    },
    warning: {
      icon: "text-amber-400",
      iconBg: "bg-amber-500/10",
      confirmBtn: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
    },
    info: {
      icon: "text-sky-400",
      iconBg: "bg-sky-500/10",
      confirmBtn: "bg-sky-500 hover:bg-sky-600 focus:ring-sky-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}
          >
            {variant === "danger" && (
              <svg
                className={`w-6 h-6 ${styles.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {variant === "warning" && (
              <svg
                className={`w-6 h-6 ${styles.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {variant === "info" && (
              <svg
                className={`w-6 h-6 ${styles.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm mb-6">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!hideConfirm && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBtn}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
