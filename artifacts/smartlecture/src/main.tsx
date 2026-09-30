import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Auth uses Supabase directly; this base URL remains for the app data API.
setBaseUrl(import.meta.env.VITE_API_BASE_URL || null);

createRoot(document.getElementById("root")!).render(<App />);
