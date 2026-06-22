import React, { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

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
  const [email, setEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = (nextPath) => {
    const normalized = normalizePath(nextPath);
    window.history.pushState({}, "", normalized);
    setPath(normalized);
  };

  // Verify the httpOnly session cookie on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.email) {
          setEmail(data.email);
          const current = normalizePath(window.location.pathname);
          if (current !== "/analyze") navigate("/analyze");
        } else {
          const current = normalizePath(window.location.pathname);
          if (current === "/analyze") navigate("/login");
        }
      })
      .catch(() => {
        if (normalizePath(window.location.pathname) === "/analyze") navigate("/login");
      })
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Central fetch helper — cookies are sent automatically via credentials: "include"
  const apiFetch = async (route, options = {}) => {
    const { timeoutMs = 15000, ...rest } = options;
    const isFormData = rest.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(rest.headers || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(`${API_BASE}${route}`, {
        ...rest,
        headers,
        credentials: "include",
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

    // Session expired — redirect, but not for auth endpoints (e.g. wrong password on /login)
    if (response.status === 401 && !route.startsWith("/auth/")) {
      setEmail("");
      navigate("/login");
      throw new Error("Session expired. Please log in again.");
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

  const handleLogin = async (userEmail, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, password }),
    });
    setEmail(data.email);
    navigate("/analyze");
  };

  const handleRegister = async (userEmail, password) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, password }),
    });
    setEmail(data.email);
    navigate("/analyze");
  };

  const handleLogout = () => {
    fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setEmail("");
    navigate("/login");
  };

  // Don't render until the session check completes (prevents flash of wrong page)
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-sm text-on-surface-variant">Loading…</span>
      </div>
    );
  }

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
