"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation";

const PAGE_SIZE = 5;

export default function ClubNoticesPage() {
  const { id: clubId } = useParams();

  const [isPresident, setIsPresident] = useState(false);

  const [pinnedNotice, setPinnedNotice] = useState(null);
  const [notices, setNotices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  /* ===============================
     👑 회장 여부 확인 (members 기준)
     =============================== */
  useEffect(() => {
    const checkPresident = async () => {
      const user = auth.currentUser;
      if (!user || !clubId) return;

      const snap = await getDoc(
        doc(db, "clubs", clubId, "members", user.uid)
      );

      if (snap.exists() && snap.data().role === "president") {
        setIsPresident(true);
      }
    };

    checkPresident();
  }, [clubId]);

  /* ===============================
     📌 고정 공지 (1개)
     =============================== */
  const fetchPinned = async () => {
    const q = query(
      collection(db, "clubs", clubId, "notices"),
      where("isPinned", "==", true),
      limit(1)
    );

    const snap = await getDocs(q);
    setPinnedNotice(
      snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
    );
  };

  /* ===============================
     📄 일반 공지 (페이지네이션)
     =============================== */
  const fetchNotices = async (page) => {
    const q = query(
      collection(db, "clubs", clubId, "notices"),
      where("isPinned", "==", false),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE * page)
    );

    const snap = await getDocs(q);

    setNotices(
      snap.docs
        .slice((page - 1) * PAGE_SIZE)
        .map((d) => ({ id: d.id, ...d.data() }))
    );
  };

  /* ===============================
     🔢 전체 개수
     =============================== */
  const fetchTotalCount = async () => {
    const q = query(
      collection(db, "clubs", clubId, "notices"),
      where("isPinned", "==", false)
    );

    const snap = await getDocs(q);
    setTotalCount(snap.size);
  };

  useEffect(() => {
    if (!clubId) return;
    fetchPinned();
    fetchTotalCount();
    fetchNotices(currentPage);
  }, [clubId, currentPage]);

  /* ===============================
     ✍️ 공지 작성 (항상 일반 공지)
     =============================== */
  const createNotice = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    await addDoc(collection(db, "clubs", clubId, "notices"), {
      title,
      content,
      isPinned: false,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setContent("");
    fetchTotalCount();
    fetchNotices(currentPage);
  };

  /* ===============================
     📌 고정 / 해제
     =============================== */
  const togglePin = async (notice) => {
    if (!notice.isPinned && pinnedNotice) {
      alert("고정 공지는 1개만 가능합니다.");
      return;
    }

    await updateDoc(
      doc(db, "clubs", clubId, "notices", notice.id),
      { isPinned: !notice.isPinned }
    );

    fetchPinned();
    fetchTotalCount();
    fetchNotices(currentPage);
  };

  /* ===============================
     ❌ 삭제
     =============================== */
  const removeNotice = async (id) => {
    if (!confirm("삭제하시겠습니까?")) return;

    await deleteDoc(doc(db, "clubs", clubId, "notices", id));

    fetchPinned();
    fetchTotalCount();
    fetchNotices(currentPage);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto mt-20 px-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">📢 공지사항</h1>

      {/* ✍️ 공지 작성 */}
      {isPresident && (
        <div className="border p-4 rounded mb-6">
          <input
            className="w-full border p-2 mb-2"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border p-2 mb-2"
            rows={3}
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={createNotice}
          >
            공지 등록
          </button>
        </div>
      )}

      {/* 📌 고정 공지 */}
      {pinnedNotice && (
        <div className="border-l-4 border-red-500 bg-red-50 p-4 mb-4">
          <h2 className="font-bold">📌 {pinnedNotice.title}</h2>
          <p>{pinnedNotice.content}</p>

          {isPresident && (
            <button
              onClick={() => togglePin(pinnedNotice)}
              className="mt-2 text-sm text-purple-600"
            >
              📌 고정 해제
            </button>
          )}
        </div>
      )}

      {/* 📄 일반 공지 */}
      {notices.map((n) => (
  <div key={n.id} className="border p-3 mb-2 rounded">
    <h3 className="font-semibold text-lg">{n.title}</h3>

    <p className="text-sm text-gray-600 mb-2">
      {n.createdAt?.toDate().toLocaleDateString()}
    </p>

    {/* 🔥 공지 내용 추가 */}
    <p className="whitespace-pre-line text-gray-800">
      {n.content}
    </p>

    {isPresident && (
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => togglePin(n)}
          className="text-sm text-purple-600"
        >
          {n.isPinned ? "📌 고정 해제" : "📌 고정"}
        </button>

        <button
          onClick={() => removeNotice(n.id)}
          className="text-sm text-red-500"
        >
          삭제
        </button>
      </div>
    )}
  </div>
))}

      {/* 🔢 페이지 번호 */}
      <div className="flex gap-2 justify-center mt-6">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setCurrentPage(n)}
            className={`px-3 py-1 rounded ${
              n === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
