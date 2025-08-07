import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastContextProvider } from "./components/provider/ToastProvider";
import "./index.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    typography: {
        fontFamily: `'Russo One', sans-serif`,
    },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // <React.StrictMode>
    <ThemeProvider theme={theme}>
        <BrowserRouter>
            <ToastContextProvider>
                <App />
            </ToastContextProvider>
        </BrowserRouter>
    </ThemeProvider>
    // </React.StrictMode>
);
