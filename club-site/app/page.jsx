"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Home() {
  const [clubs, setClubs] = useState([]);
  const router = useRouter();

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

  return (
    <div className="pt-24 px-6">
      <h1 className="text-3xl font-bold mb-6">동아리 목록</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.length === 0 ? (
          <p className="text-gray-500">동아리를 불러오는 중...</p>
        ) : (
          clubs.map((club) => (
            <div
              key={club.id}
              onClick={() => router.push(`/clubs/${club.id}`)}
              className="cursor-pointer border rounded-lg p-5 bg-white shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{club.name}</h2>
              <p className="text-gray-600 text-sm mt-2">
                {club.description || "소개가 없습니다."}
              </p>

              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                자세히 보기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
