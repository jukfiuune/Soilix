import React, { createContext, useContext, useState } from "react";

type User = {
  email: string;
  id: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setUser({ email, id: "1" });
  };

  const signup = async (email: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    await new Promise((resolve) => setTimeout(resolve, 450));
    setUser({ email, id: "1" });
  };

  const logout = () => {
    setUser(null);
  };

  const deleteAccount = async () => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
