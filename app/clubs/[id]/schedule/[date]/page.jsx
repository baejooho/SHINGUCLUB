"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function ScheduleDetailPage() {
  const { id: clubId, date } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId || !date) return;

    const fetchSchedules = async () => {
      try {
        const q = query(
          collection(db, "clubs", clubId, "schedules"),
          where("date", "==", date)
        );

        const snap = await getDocs(q);

        const arr = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSchedules(arr);
      } catch (e) {
        console.error("일정 조회 오류:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [clubId, date]);

  if (loading) return <p className="mt-20 text-center">불러오는 중...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-20 px-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">
        📅 {date} 일정
      </h1>

      {schedules.length === 0 ? (
        <p className="text-gray-500">등록된 일정이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold mb-1">
                {s.title}
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {s.content || "내용 없음"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
