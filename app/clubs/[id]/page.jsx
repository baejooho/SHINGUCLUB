"use client";

import { use, useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ClubDetail(props) {
  // Next.js 16: params는 Promise → use()로 언랩 필요
  const { id } = use(props.params);
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const ref = doc(db, "clubs", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setClub({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.log("동아리 조회 오류:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id]);

  if (loading) return <p className="text-center mt-20">불러오는 중...</p>;
  if (!club) return <p className="text-center mt-20">존재하지 않는 동아리입니다.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-20 px-6 pb-20">

      {/* ⭐ 동아리 대표 이미지 */}
      {club.imageUrl && (
        <img
          src={club.imageUrl}
          alt={club.name}
          className="w-full h-60 object-cover rounded-lg shadow-lg"
        />
      )}

      {/* ⭐ 동아리 제목 / 설명 */}
      <h1 className="text-4xl font-bold mt-6">{club.name}</h1>
      <p className="text-gray-600 mt-2">{club.shortDesc}</p>

      <hr className="my-6" />

      {/* ⭐ 상세 설명 */}
      <div className="text-lg whitespace-pre-line leading-7">
        {club.description || "동아리에 대한 설명이 아직 없습니다."}
      </div>

      <hr className="my-6" />

      {/* ⭐ 활동 사진 */}
      {club.photos && club.photos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">활동 사진</h2>
          <div className="grid grid-cols-2 gap-3">
            {club.photos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                className="w-full h-40 object-cover rounded-md shadow"
              />
            ))}
          </div>
        </div>
      )}

      {/* ⭐⭐⭐ 일정 확인하기 버튼 (가입 신청 위에 추가된 부분) ⭐⭐⭐ */}
      <button
        onClick={() => router.push(`/clubs/${id}/schedule`)}
        className="mt-8 w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition"
      >
        📅 일정 확인하기
      </button>

      {/* ⭐ 가입 신청 버튼 */}
      {club.applyForm && (
        <a
          href={club.applyForm}
          target="_blank"
          className="block mt-4 bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
        >
          가입 신청하기
        </a>
      )}
    </div>
  );
}
