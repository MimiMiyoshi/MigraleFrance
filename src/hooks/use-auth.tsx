import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";

type AuthContextType = {
  user: Omit<SelectUser, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<
    Omit<SelectUser, "password">,
    Error,
    LoginData
  >;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<
    Omit<SelectUser, "password">,
    Error,
    RegisterData
  >;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 開発用モックユーザー（一時的な対応）
  const mockUser: Omit<SelectUser, "password"> = {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 本番環境では以下のコードを使用
  // const {
  //   data: user,
  //   error,
  //   isLoading,
  // } = useQuery<Omit<SelectUser, "password"> | undefined, Error>({
  //   queryKey: ["/api/user"],
  //   queryFn: getQueryFn({ on401: "returnNull" }),
  // });

  // 開発環境用：モックユーザーを使用
  const user = mockUser;
  const error = null;
  const isLoading = false;

  // 開発用ログイン処理（一時的な対応）
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // 本番環境では以下を使用
      // const res = await apiRequest("POST", "/api/login", credentials);
      // return await res.json();

      // 開発環境用：モックレスポンスを返す
      console.log("Login attempt with:", credentials);
      return mockUser;
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      console.error("Login error:", error.message);
    },
  });

  // 開発用登録処理（一時的な対応）
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      // 本番環境では以下を使用
      // const res = await apiRequest("POST", "/api/register", userData);
      // return await res.json();

      // 開発環境用：モックレスポンスを返す
      console.log("Registration attempt with:", userData);
      return {
        ...mockUser,
        username: userData.username,
        email: userData.email,
      };
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      console.error("Registration error:", error.message);
    },
  });

  // 開発用ログアウト処理（一時的な対応）
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // 本番環境では以下を使用
      // await apiRequest("POST", "/api/logout");

      // 開発環境用：何もしない
      console.log("Logout attempt");
    },
    onSuccess: () => {
      // 開発環境では実際にはログアウトしない
      // queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      console.error("Logout error:", error.message);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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
