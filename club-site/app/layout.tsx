import React from "react";
import "./globals.css";
import HeaderWrapper from "./components/HeaderWrapper";
import { SearchProvider } from "./context/SearchContext"; // 🔥 추가

export const metadata = {
  title: "Shingu Club",
  description: "동아리 통합 관리 홈페이지",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {/* 🔥 전역 검색 상태 Provider로 전체 감싸기 */}
        <SearchProvider>
          <HeaderWrapper />
          <main className="pt-20 px-4">{children}</main>
        </SearchProvider>
      </body>
    </html>
  );
}
