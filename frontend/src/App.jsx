import React, { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

function getInitialPath() {
  return window.location.pathname || "/";
}

function normalizePath(pathname) {
  if (pathname === "/login" || pathname === "/register" || pathname === "/analyze") {
    return pathname;
  }
  return "/";
}

export default function App() {
  const [path, setPath] = useState(() => normalizePath(getInitialPath()));
  const [token, setToken] = useState(() => localStorage.getItem("scouter_token") ?? "");
  const [email, setEmail] = useState(() => localStorage.getItem("scouter_email") ?? "");

  const navigate = (nextPath) => {
    const normalized = normalizePath(nextPath);
    window.history.pushState({}, "", normalized);
    setPath(normalized);
  };

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

  const apiFetch = async (route, options = {}) => {
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
      response = await fetch(`${API_BASE}${route}`, {
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
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!response.ok) {
      const detail = typeof data === "string" ? data : data?.detail;
      throw new Error(detail || response.statusText || "Request failed");
    }
    return data;
  };

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (token && (path === "/login" || path === "/register" || path === "/")) {
      navigate("/analyze");
    }
  }, [path, token]);

  const handleLogin = async (userEmail, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, password }),
    });
    storeAuth(data.access_token, userEmail);
    navigate("/analyze");
  };

  const handleRegister = async (userEmail, password) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, password }),
    });
    storeAuth(data.access_token, userEmail);
    navigate("/analyze");
  };

  const handleLogout = () => {
    storeAuth("", "");
    navigate("/login");
  };

  if (path === "/login" || path === "/register") {
    return (
      <AuthPage
        mode={path === "/login" ? "login" : "register"}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onNavigate={navigate}
      />
    );
  }

  if (path === "/analyze") {
    return <DashboardPage email={email} apiFetch={apiFetch} onLogout={handleLogout} />;
  }

  return <LandingPage onNavigate={navigate} />;
}
