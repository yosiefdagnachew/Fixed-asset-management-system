import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // ✅ Use the one from react-hot-toast
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Fixed Asset Management System",
  description: "Zemen Bank Fixed Asset Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>
        <SessionProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster position="top-right" />
            </QueryProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
