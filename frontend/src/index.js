import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastContextProvider } from "./components/provider/ToastProvider";
import "./index.css";
import 'primeicons/primeicons.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <ToastContextProvider>
      <App />
    </ToastContextProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
