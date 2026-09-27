import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import Global Design System Styles
import "./styles/global.css";
import "./styles/dashboard.css";
import "./styles/cards.css";
import "./styles/auth.css";
import "./styles/scanner.css";
import "./styles/popup.css";
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
