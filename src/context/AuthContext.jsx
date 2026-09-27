import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, setAuthToken, getAuthToken } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("econexis_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    return null;
  });

  const [role, setRole] = useState(() => {
    return (user?.role || "USER").toUpperCase();
  });

  const [loading, setLoading] = useState(true);

  // Synchronize authenticated user with backend on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res && res.success && res.user) {
            const roleFormatted = (res.user.role || "USER").toUpperCase();
            const userData = {
              ...res.user,
              id: res.user.id || res.user._id,
              role: roleFormatted,
            };
            setUser(userData);
            setRole(roleFormatted);
            localStorage.setItem("econexis_user", JSON.stringify(userData));
          }
        } catch (err) {
          console.warn("[AuthContext] Session verification failed, clearing token:", err.message);
          logout();
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      const roleUpper = (user.role || "USER").toUpperCase();
      localStorage.setItem("econexis_user", JSON.stringify(user));
      setRole(roleUpper);
    } else {
      localStorage.removeItem("econexis_user");
      setAuthToken(null);
      setRole(null);
    }
  }, [user]);

  // Real Express + MongoDB + JWT Login
  const login = async (email, password) => {
    // Clear any previous authentication state
    localStorage.removeItem("econexis_user");
    localStorage.removeItem("econexis_jwt_token");
    setAuthToken(null);

    const res = await authApi.login({ email, password });
    if (res && res.success && res.token) {
      setAuthToken(res.token);
      const roleFormatted = (res.user.role || "USER").toUpperCase();
      const loggedInUser = {
        ...res.user,
        id: res.user.id || res.user._id,
        role: roleFormatted,
      };
      setUser(loggedInUser);
      setRole(roleFormatted);
      localStorage.setItem("econexis_user", JSON.stringify(loggedInUser));
      return loggedInUser;
    } else {
      throw new Error(res?.message || "Login failed. Please check your credentials.");
    }
  };

  // Real Express + MongoDB + JWT Register
  const register = async (formData) => {
    // Clear any previous authentication state
    localStorage.removeItem("econexis_user");
    localStorage.removeItem("econexis_jwt_token");
    setAuthToken(null);

    const res = await authApi.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || "+91 98765 00000",
      college: formData.college || "National Institute of Technology",
      address: formData.address || "Campus Residence",
    });

    if (res && res.success && res.token) {
      setAuthToken(res.token);
      const newUser = {
        ...res.user,
        id: res.user.id || res.user._id,
        role: "USER",
      };
      setUser(newUser);
      setRole("USER");
      localStorage.setItem("econexis_user", JSON.stringify(newUser));
      return newUser;
    } else {
      throw new Error(res?.message || "Registration failed. Please try again.");
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setRole(null);
    setAuthToken(null);
    localStorage.removeItem("econexis_user");
    localStorage.removeItem("econexis_jwt_token");
  };

  // Update user profile
  const updateUser = async (updatedData) => {
    try {
      if (getAuthToken()) {
        const res = await authApi.updateProfile(updatedData);
        if (res && res.success && res.user) {
          const updated = {
            ...res.user,
            id: res.user.id || res.user._id,
          };
          setUser(updated);
          return updated;
        }
      }
    } catch (err) {
      console.warn("[AuthContext] Profile update error:", err.message);
    }

    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem("econexis_user", JSON.stringify(updated));
      return updated;
    });
  };

  const addEcoPoints = (points) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newPoints = (prev.ecoPoints || 0) + Number(points);
      const updated = { ...prev, ecoPoints: newPoints };
      localStorage.setItem("econexis_user", JSON.stringify(updated));
      return updated;
    });
  };

  const deductEcoPoints = (points) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newPoints = Math.max(0, (prev.ecoPoints || 0) - Number(points));
      const updated = { ...prev, ecoPoints: newPoints };
      localStorage.setItem("econexis_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        addEcoPoints,
        deductEcoPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
