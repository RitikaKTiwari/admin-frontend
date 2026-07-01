"use client";

import { createContext, useContext, useState, useCallback } from "react";

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState(null);

  const showPopup = useCallback((message, { type = "info" } = {}) => {
    return new Promise((resolve) => {
      setPopup({ type: "alert", message, variant: type, resolve });
    });
  }, []);

  const showConfirm = useCallback((message, { type = "warning" } = {}) => {
    return new Promise((resolve) => {
      setPopup({ type: "confirm", message, variant: type, resolve });
    });
  }, []);

  const handleClose = (result) => {
    if (popup?.resolve) popup.resolve(result);
    setPopup(null);
  };

  return (
    <PopupContext.Provider value={{ showPopup, showConfirm }}>
      {children}
      {popup && <PopupModal popup={popup} onClose={handleClose} />}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used within PopupProvider");
  return ctx;
}

function PopupModal({ popup, onClose }) {
  const { type, message, variant } = popup;

  const icons = {
    success: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    info: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const colorMap = {
    success: {
      icon: "bg-green-100 text-green-600",
      btn: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },
    error: {
      icon: "bg-red-100 text-red-600",
      btn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: "bg-amber-100 text-amber-600",
      btn: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
    },
    info: {
      icon: "bg-indigo-100 text-indigo-600",
      btn: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    },
  };

  const colors = colorMap[variant] || colorMap.info;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => type === "alert" && onClose(true)}
      />

      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 flex flex-col items-center gap-4 popup-anim">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colors.icon}`}>
          {icons[variant] || icons.info}
        </div>

        {/* Message */}
        <p className="text-center text-gray-800 dark:text-gray-100 text-base font-medium leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        {type === "alert" ? (
          <button
            autoFocus
            onClick={() => onClose(true)}
            className={`w-full py-2.5 rounded-xl text-white font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.btn}`}
          >
            OK
          </button>
        ) : (
          <div className="flex gap-3 w-full">
            <button
              onClick={() => onClose(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              autoFocus
              onClick={() => onClose(true)}
              className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.btn}`}
            >
              Confirm
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .popup-anim { animation: popIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
