import { ClerkProvider } from "@clerk/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ApiAuthBridge from "./components/ApiAuthBridge.jsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY in env");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/#/?signed_out=1">
        <ApiAuthBridge>
          <App />
        </ApiAuthBridge>
      </ClerkProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
