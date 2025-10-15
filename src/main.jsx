import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from "./App";
import { AuthContextProvider } from "./context/Authcontext";
import { ToastProvider } from "./hooks/use-toast.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
    <BrowserRouter>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
