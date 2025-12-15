"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase/config";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,   // ✅ 추가
  doc       // ✅ 추가
} from "firebase/firestore";

import { useRouter, usePathname } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import LoginModal from "./LoginModal";
import EmailVerifySignupModal from "./EmailVerifySignupModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [loginOpen, setLoginOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const { search, setSearch } = useSearch();

  const [clubs, setClubs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef(null);

  const [myClubStatus, setMyClubStatus] = useState(null);
const [presidentClubId, setPresidentClubId] = useState(null);



// 🔥 회장 관련 상태
  const [isPresident, setIsPresident] = useState(false);
  const [myClubId, setMyClubId] = useState(null);

useEffect(() => {
  if (!user) return;

  getDoc(doc(db, "users", user.uid)).then((snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    // 회장 여부
    if (data.presidentOf) {
      setIsPresident(true);
      setPresidentClubId(data.presidentOf);
    } else {
      setIsPresident(false);
    }

    // 일반 회원용 (이미 만들어둔 거)
    setMyClubStatus(data.myClubStatus || "none");
    setMyClubId(data.myClubId || null);
  });
}, [user]);


  // 🔹 동아리 목록 불러오기
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

  // 🔹 로그인 상태 감지
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsPresident(false);
        setMyClubId(null);
        return;
      }

      // 🔥 users 문서에서 회장 여부 확인
      const userSnap = await getDoc(
        doc(db, "users", currentUser.uid)
      );

      if (userSnap.exists() && userSnap.data().presidentOf) {
        setIsPresident(true);
        setMyClubId(userSnap.data().presidentOf);
      } else {
        setIsPresident(false);
        setMyClubId(null);
      }
    });

    return () => unsub();
  }, []);


  // 🔹 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.replace("/");
  };

  const movePage = (path) => {
    setMenuOpen(false);
    router.push(path);
  };

  // 🔹 검색 자동완성
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = clubs.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase())
    );
    setSuggestions(filtered);
  }, [search, clubs]);

  // 🔹 자동완성 키보드 이동
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
        router.push(`/clubs/${suggestions[selectedIndex].id}`);
        setShowSuggestions(false);
      }
    }
  };

  // 🔹 자동완성 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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
                    className={`px-4 py-2 cursor-pointer ${selectedIndex === idx
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                      }`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
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

          {/* 오른쪽 버튼 */}
          <div className="flex items-center gap-4">
            {!user && (
              <>
                <button
                  className="px-3 py-1 border rounded-lg"
                  onClick={() => setLoginOpen(true)}
                >
                  로그인
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg"
                  onClick={() => setVerifyOpen(true)}
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
              <div className="absolute right-6 top-16 w-56 bg-white border rounded-lg shadow-lg py-2">

                {!user ? (
                  <p className="text-center py-3 text-gray-500">
                    로그인이 되어있지 않습니다
                  </p>
                ) : (
                  <>
                    {/* 기본 메뉴 */}
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

                    {/* 내 가입 동아리 */}
{!isPresident && (
  <div className="border-t mt-2 pt-2">
    <p className="px-4 py-1 text-sm font-semibold text-gray-700">
      내 가입 동아리
    </p>

    {myClubStatus === "approved" && (
      <button
        className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
        onClick={() => movePage(`/clubs/${myClubId}`)}
      >
        👉 내 동아리 바로가기
      </button>
    )}

    {myClubStatus === "pending" && (
      <p className="px-4 py-2 text-yellow-600 text-sm">
        ⏳ 승인 대기중
      </p>
    )}

    {myClubStatus === "none" && (
      <p className="px-4 py-2 text-gray-500 text-sm">
        아직 가입한 동아리가 없습니다
      </p>
    )}
  </div>
)}
{isPresident && (
  <div className="border-t mt-2 pt-2">
    <p className="px-4 py-1 text-sm font-semibold text-gray-700">
      내 동아리 관리
    </p>

    {/* ✅ 이거 추가 */}
    <button
      className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
      onClick={() => movePage(`/clubs/${presidentClubId}`)}
    >
      🏠 내 동아리 홈
    </button>

    <button
      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
      onClick={() => movePage(`/clubs/${presidentClubId}/admin`)}
    >
      📋 동아리 가입 승인
    </button>

    <button
      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
      onClick={() => movePage(`/clubs/${presidentClubId}/members`)}
    >
      👥 동아리 인원 관리
    </button>

  </div>
)}




                

                    <hr className="my-2" />

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
      />

      {/* 회원가입 모달 */}
      <EmailVerifySignupModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
      />
    </>
  );
}
