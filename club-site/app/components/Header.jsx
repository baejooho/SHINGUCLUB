"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ⭐ 모달 상태
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const router = useRouter();

  // 로그인 상태 감지
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 로그아웃
  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="flex items-center justify-between px-6 py-4">

          {/* 로고 */}
          <h1
            className="text-xl font-bold cursor-pointer"
            onClick={() => router.push("/")}
          >
            SHINGU UNIVERSITY
          </h1>

          {/* 검색창 */}
          <div className="flex-1 px-10">
            <input
              type="text"
              placeholder="동아리 이름 검색"
              className="w-full border rounded-lg px-4 py-2 shadow-sm"
            />
          </div>

          {/* 오른쪽 버튼들 */}
          <div className="flex items-center gap-4">

            {/* 로그인 전 → 로그인/회원가입 버튼 보임 */}
            {!user && (
              <>
                <button
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                  onClick={() => setLoginOpen(true)}
                >
                  로그인
                </button>

                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => setSignupOpen(true)}
                >
                  회원가입
                </button>
              </>
            )}

            {/* 햄버거 버튼 */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl px-3"
            >
              ☰
            </button>

            {/* 햄버거 메뉴 */}
            {menuOpen && (
              <div className="absolute right-6 top-16 w-52 bg-white border rounded-lg shadow-lg py-2 animate-fadeIn">

                {/* 로그인 안 됨 */}
                {!user ? (
                  <p className="text-center py-3 text-gray-500">
                    로그인이 되어있지 않습니다
                  </p>
                ) : (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => router.push("/profile")}
                    >
                      내 정보
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => router.push("/profile/edit")}
                    >
                      정보 수정
                    </button>

                    <hr />

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                  </>
                )}

              </div>
            )}
          </div>
        </div>
      </header>

      {/* ⭐ 로그인 모달 */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => console.log("로그인 성공")}
      />

      {/* ⭐ 회원가입 모달 */}
      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSuccess={() => console.log("회원가입 완료")}
        openLogin={() => setLoginOpen(true)} 
      />
    </>
  );
}
