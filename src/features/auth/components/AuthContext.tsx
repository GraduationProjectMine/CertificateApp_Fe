"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

export type UserRole = "issuer" | "student" | "employer" | "sysadmin";

export interface User {
  email: string;
  name: string;
  role: UserRole;
  orgName?: string;
  walletAddress?: string;
  loginType?: "credentials" | "metamask";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  loginWithMetaMask: (preferredRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const mockUsers: Record<UserRole, User> = {
  issuer: {
    email: "admin@hust.edu.vn",
    name: "Nguyễn Văn A (HUST Admin)",
    role: "issuer",
    orgName: "Đại học Bách Khoa Hà Nội",
  },
  student: {
    email: "student@student.edu.vn",
    name: "Trần Thị B (Sinh viên)",
    role: "student",
    orgName: "Đại học Bách Khoa Hà Nội",
  },
  employer: {
    email: "hr@company.com",
    name: "Phạm Minh C (HR Manager)",
    role: "employer",
    orgName: "Vingroup",
  },
  sysadmin: {
    email: "sysadmin@blockchain.org",
    name: "Lê Hoàng D (System Admin)",
    role: "sysadmin",
    orgName: "Blockchain Certification Network",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user session from localStorage
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const selectedUser = mockUsers[role];
    if (selectedUser) {
      const loggedUser: User = { 
        ...selectedUser, 
        email, 
        loginType: "credentials" 
      };
      setUser(loggedUser);
      localStorage.setItem("auth_user", JSON.stringify(loggedUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const loginWithMetaMask = async (preferredRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setIsLoading(false);
        return { success: false, error: "MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask Extension để tiếp tục." };
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        setIsLoading(false);
        return { success: false, error: "Không tìm thấy tài khoản ví nào được kết nối." };
      }

      const walletAddress = accounts[0];
      
      // Auto-assign roles or fallback to preferredRole (default is employer)
      let role: UserRole = preferredRole || "employer";
      
      // Dev friendly check for Hardhat Account #0
      const isDevAdmin = walletAddress.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase();
      if (isDevAdmin) {
        role = "issuer";
      }

      const mockData = mockUsers[role];
      const displayName = isDevAdmin 
        ? `HUST Admin (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`
        : mockData.role === "employer"
        ? `Nhà tuyển dụng (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`
        : `Sinh viên (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`;

      const loggedUser: User = {
        email: isDevAdmin ? "admin@hust.edu.vn" : mockData.email,
        name: displayName,
        role: role,
        orgName: mockData.orgName,
        walletAddress: walletAddress,
        loginType: "metamask"
      };

      setUser(loggedUser);
      localStorage.setItem("auth_user", JSON.stringify(loggedUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error("MetaMask login error", err);
      setIsLoading(false);
      return { 
        success: false, 
        error: err.code === 4001 
          ? "Bạn đã từ chối kết nối ví trong MetaMask." 
          : err.message || "Lỗi khi kết nối ví MetaMask." 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithMetaMask, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

