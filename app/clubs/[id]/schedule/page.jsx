"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ScheduleCalendar() {
  const { id: clubId } = useParams();

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [isPresident, setIsPresident] = useState(false);

  // 일정 추가
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 수정용
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // 🔥 일정 다시 불러오기
  const fetchSchedules = async () => {
    const snap = await getDocs(
      collection(db, "clubs", clubId, "schedules")
    );
    setSchedules(
      snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    );
  };

  // 🔥 일정 수정
  const handleUpdateSchedule = async (scheduleId) => {
    if (!editTitle) {
      alert("제목은 필수입니다.");
      return;
    }

    await updateDoc(
      doc(db, "clubs", clubId, "schedules", scheduleId),
      {
        title: editTitle,
        content: editContent,
      }
    );

    await fetchSchedules();
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  // 🔥 최초 로딩
  useEffect(() => {
    if (!clubId) return;

    const loadData = async () => {
      try {
        await fetchSchedules();

        const user = auth.currentUser;
        if (user) {
          const userSnap = await getDoc(
            doc(db, "users", user.uid)
          );
          if (
            userSnap.exists() &&
            userSnap.data().presidentOf === clubId
          ) {
            setIsPresident(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clubId]);

  // 🔥 날짜 클릭
  const onDateClick = (dateObj) => {
    const d = dateObj.toLocaleDateString("sv-SE");
    setDate(d);
    setIsAdding(false);
  };

  // 🔥 일정 추가
  const handleAddSchedule = async () => {
    if (!date || !title) {
      alert("날짜와 제목은 필수입니다.");
      return;
    }

    await addDoc(
      collection(db, "clubs", clubId, "schedules"),
      {
        date,
        title,
        content,
        createdAt: serverTimestamp(),
      }
    );

    await fetchSchedules();
    setIsAdding(false);
    setTitle("");
    setContent("");
  };

  const selectedSchedules = schedules.filter(
    (s) => s.date === date
  );

  if (loading) {
    return <p className="mt-20 text-center">불러오는 중...</p>;
  }

  return (
    <div className="flex flex-col items-center mt-20 pb-20 px-6 max-w-4xl mx-auto">

      {/* 상단 */}
      <div className="relative w-full mb-6">
        <h1 className="text-3xl font-bold text-center">
          📅 동아리 일정
        </h1>

        {isPresident && (
          <button
            onClick={() => setIsAdding(true)}
            className="absolute right-0 top-0 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            ➕ 일정 추가
          </button>
        )}
      </div>

      {/* 캘린더 */}
      <Calendar
        className="big-calendar"
        onClickDay={onDateClick}
        tileContent={({ date }) => {
          const d = date.toLocaleDateString("sv-SE");
          return schedules.some((s) => s.date === d)
            ? <div className="schedule-dot">●</div>
            : null;
        }}
      />

      {/* 선택한 날짜 일정 */}
      {date && (
        <div className="w-full mt-8">
          <h2 className="text-xl font-bold mb-4">
            📌 {date} 일정
          </h2>

          {selectedSchedules.length === 0 ? (
            <p className="text-gray-500">
              등록된 일정이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedSchedules.map((s) => (
                <div
                  key={s.id}
                  className="border rounded-lg p-4 bg-white shadow-sm relative"
                >
                  {/* 회장 전용 버튼 */}
                  {isPresident && (
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(s.id);
                          setEditTitle(s.title);
                          setEditContent(s.content || "");
                        }}
                        className="text-sm px-2 py-1 bg-yellow-400 rounded"
                      >
                        수정
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("삭제하시겠습니까?")) {
                            await deleteDoc(
                              doc(db, "clubs", clubId, "schedules", s.id)
                            );
                            fetchSchedules();
                          }
                        }}
                        className="text-sm px-2 py-1 bg-red-500 text-white rounded"
                      >
                        삭제
                      </button>
                    </div>
                  )}

                  {/* 수정 모드 */}
                  {editingId === s.id ? (
                    <>
                      <input
                        className="w-full border px-2 py-1 mb-2"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full border px-2 py-1 mb-2"
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 border rounded"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleUpdateSchedule(s.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          저장
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                      <p className="text-gray-600 whitespace-pre-line mt-1">
                        {s.content || "내용 없음"}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 일정 추가 폼 */}
      {isAdding && isPresident && (
        <div className="w-full mt-8 p-6 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">
            일정 추가
          </h2>

          <input
            type="date"
            className="w-full border px-3 py-2 mb-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="text"
            className="w-full border px-3 py-2 mb-3"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border px-3 py-2 mb-3"
            rows={4}
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border rounded"
            >
              취소
            </button>
            <button
              onClick={handleAddSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
