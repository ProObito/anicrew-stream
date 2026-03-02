import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Restore saved theme
const savedTheme = JSON.parse(localStorage.getItem("anicrew-theme") || "{}");
if (savedTheme?.state?.theme) {
  document.documentElement.setAttribute("data-theme", savedTheme.state.theme);
}

createRoot(document.getElementById("root")!).render(<App />);
