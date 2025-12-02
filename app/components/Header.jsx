"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import EmailVerifySignupModal from "./EmailVerifySignupModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [loginOpen, setLoginOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false); // 🔥 SignupModal 대신

  const { search, setSearch } = useSearch();

  const [clubs, setClubs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();
  const inputRef = useRef(null);

  // 🔥 동아리 목록 가져오기
  useEffect(() => {
    const fetchClubs = async () => {
      const snapshot = await getDocs(collection(db, "clubs"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClubs(list);
    };

    fetchClubs();
  }, []);

  // 🔥 로그인 상태 감지
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 🔥 페이지 이동 시 햄버거 메뉴 닫기
  const pathname = usePathname();
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  const movePage = (path) => {
    setMenuOpen(false);
    router.push(path);
  };

  // 🔥 검색 자동완성
  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = clubs.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase())
    );
    setSuggestions(filtered);
  }, [search, clubs]);

  // 🔥 자동완성 키보드 이동
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        const club = suggestions[selectedIndex];
        router.push(`/clubs/${club.id}`);
        setShowSuggestions(false);
      }
    }
  };

  // 🔥 자동완성 외부 클릭 → 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <h1
            className="text-xl font-bold cursor-pointer"
            onClick={() => movePage("/")}
          >
            SHINGU UNIVERSITY
          </h1>

          {/* 검색창 */}
          <div className="relative flex-1 px-10" ref={inputRef}>
            <input
              type="text"
              placeholder="동아리 이름 검색"
              className="w-full border rounded-lg px-4 py-2 shadow-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
            />

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-10 right-10 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                {suggestions.map((club, idx) => (
                  <li
                    key={club.id}
                    className={`px-4 py-2 cursor-pointer 
                      ${selectedIndex === idx ? "bg-blue-100" : "hover:bg-gray-100"}
                    `}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      setSearch(club.name);
                      router.push(`/clubs/${club.id}`);
                      setShowSuggestions(false);
                    }}
                  >
                    {club.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 오른쪽 버튼들 */}
          <div className="flex items-center gap-4">
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
                  onClick={() => setVerifyOpen(true)} // 🔥 변경됨
                >
                  회원가입
                </button>
              </>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl px-3"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-6 top-16 w-52 bg-white border rounded-lg shadow-lg py-2 animate-fadeIn">
                {!user ? (
                  <p className="text-center py-3 text-gray-500">
                    로그인이 되어있지 않습니다
                  </p>
                ) : (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => movePage("/profile")}
                    >
                      내 정보
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => movePage("/profile/edit")}
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

      {/* 로그인 모달 */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => console.log("로그인 성공")}
      />

      {/* 🔥 이메일 인증 방식 회원가입 모달 */}
      <EmailVerifySignupModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onSuccess={() => console.log("인증메일 발송")}
      />
    </>
  );
}
