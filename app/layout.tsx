import "./globals.css";
import type { ReactNode } from "react";

import { SearchProvider } from "./context/SearchContext";
import Header from "./components/Header";

export const metadata = {
  title: "Shingu Club",
  description: "동아리 통합 관리 홈페이지",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {/* 🔥 전역 상태 Provider */}
        <SearchProvider>
          <Header />
          <main className="pt-20 px-4">
            {children}
          </main>
        </SearchProvider>
      </body>
    </html>
  );
}
