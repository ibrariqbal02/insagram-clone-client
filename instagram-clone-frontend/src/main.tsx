import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { setSharedQueryClient } from "./api/axios";
import "./index.css";

const queryClient = new QueryClient();

// Give the axios interceptor access to the query client so it can
// clear the cache when a token refresh fails (prevents stale auth state).
setSharedQueryClient(queryClient);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
