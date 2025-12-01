import "./globals.css";
import HeaderWrapper from "./components/HeaderWrapper";

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

        <HeaderWrapper />

        <main className="pt-20 px-4">{children}</main>

      </body>
    </html>
  );
}
