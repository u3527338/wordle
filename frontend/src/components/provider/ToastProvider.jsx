import { Toast } from "primereact/toast";
import { createContext, useContext, useRef } from "react";

const ToastContext = createContext(undefined);

export const ToastContextProvider = ({ children }) => {
  const toastRef = useRef(null);

  const showToast = ({ status = "success", detail }) => {
    if (!toastRef.current) return;
    const severity =
      status === "success" ? "success" : "failed" ? "error" : "info";
    toastRef.current.show({ severity, detail });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast ref={toastRef} position="bottom-left" />
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToastContext have to be used within ToastContextProvider"
    );
  }

  return context;
};
