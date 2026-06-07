import React, { useCallback, useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("scouter_token") ?? "");
  const [email, setEmail] = useState(() => localStorage.getItem("scouter_email") ?? "");
  const [page, setPage] = useState(() => (localStorage.getItem("scouter_token") ? "dashboard" : "login"));
  const [apiStatus, setApiStatus] = useState("checking");

  const storeAuth = (accessToken, userEmail) => {
    setToken(accessToken);
    setEmail(userEmail);
    if (accessToken) {
      localStorage.setItem("scouter_token", accessToken);
      localStorage.setItem("scouter_email", userEmail);
    } else {
      localStorage.removeItem("scouter_token");
      localStorage.removeItem("scouter_email");
    }
  };

  const apiFetch = useCallback(
    async (path, options = {}) => {
      const { timeoutMs = 15000, ...rest } = options;
      const isFormData = rest.body instanceof FormData;
      const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(rest.headers || {}),
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response;
      try {
        response = await fetch(`${API_BASE}${path}`, {
          ...rest,
          headers,
          signal: controller.signal,
        });
      } catch (error) {
        if (error?.name === "AbortError") {
          throw new Error("Request timed out. Check the backend and try again.");
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }

      const text = await response.text();
      let data = null;
      if (text) {
        try { data = JSON.parse(text); } catch { data = text; }
      }
      if (!response.ok) {
        const detail = typeof data === "string" ? data : data?.detail;
        throw new Error(detail || response.statusText || "Request failed");
      }
      return data;
    },
    [token]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
        if (!cancelled) setApiStatus("ok");
      } catch {
        if (!cancelled) setApiStatus("unreachable");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (userEmail, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, password }),
    });
    storeAuth(data.access_token, userEmail);
    setPage("dashboard");
  };

  const handleRegister = async (userEmail, password) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, password }),
    });
    storeAuth(data.access_token, userEmail);
    setPage("dashboard");
  };

  const handleLogout = () => {
    storeAuth("", "");
    setPage("login");
  };

  if (page === "login") {
    return (
      <LoginPage
        apiStatus={apiStatus}
        onLogin={handleLogin}
        onGoRegister={() => setPage("register")}
      />
    );
  }
  if (page === "register") {
    return (
      <RegisterPage
        apiStatus={apiStatus}
        onRegister={handleRegister}
        onGoLogin={() => setPage("login")}
      />
    );
  }
  return (
    <DashboardPage
      email={email}
      apiFetch={apiFetch}
      onLogout={handleLogout}
    />
  );
}
