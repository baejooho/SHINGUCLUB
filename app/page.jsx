"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Home() {
  const [clubs, setClubs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  const ITEMS_PER_PAGE = 3; // ⭐ 한 페이지에 3개 (한 줄당 1개)

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "clubs"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClubs(list);
      } catch (error) {
        console.error("Firestore 읽기 오류:", error);
      }
    };

    fetchClubs();
  }, []);

  /* ===============================
     페이지네이션 계산
  =============================== */
  const totalPages = Math.ceil(clubs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClubs = clubs.slice(startIndex, endIndex);

  return (
    <div className="pt-24 px-6 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-2">
          동아리 목록
        </h1>
        <p className="text-gray-500">
          신구대학교의 다양한 동아리를 만나보세요
        </p>
      </div>


      {/* 세로 리스트 (한 줄에 하나씩) */}
      <div className="flex flex-col gap-6">
        {currentClubs.length === 0 ? (
          <p className="text-gray-500">동아리를 불러오는 중...</p>
        ) : (
          currentClubs.map((club) => (
            <div
              key={club.id}
              className="relative w-full
               rounded-2xl border bg-white p-6
               shadow-sm transition-all duration-300
               hover:-translate-y-1 hover:shadow-xl"
            >
              {/* 왼쪽 포인트 바 */}
              <div className="absolute left-0 top-6 h-14 w-1 bg-blue-500 rounded-full" />

              <div className="flex items-center justify-between pl-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {club.name}
                  </h2>

                  <span className="inline-block text-xs px-3 py-1 rounded-full
                         bg-blue-50 text-blue-600">
                    중앙동아리
                  </span>
                </div>

                <button
                  onClick={() => router.push(`/clubs/${club.id}`)}
                  className="px-6 py-2 rounded-lg
                   bg-linear-to-r from-blue-500 to-blue-600
                   text-white font-medium"
                >
                  자세히 보기
                </button>
              </div>

              <p className="text-gray-600 mt-4 pl-4">
                {club.description || "소개가 없습니다."}
              </p>
            </div>
          ))

        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-4 py-2 rounded-full border
                  ${currentPage === page
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
