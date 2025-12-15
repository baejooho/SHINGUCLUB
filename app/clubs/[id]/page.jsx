"use client";

import { use, useEffect, useState } from "react";
import { db, auth } from "../../../firebase/config";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  updateDoc,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ClubDetail(props) {
  const { id } = use(props.params);
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const [intro, setIntro] = useState("");

  // 🔐 내 상태
  const [myStatusInThisClub, setMyStatusInThisClub] = useState("none"); // none | pending | approved
  const [isPresident, setIsPresident] = useState(false);

  // ✏️ 소개글 수정
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  /* ===============================
     🔍 내 상태 (members 기준)
     =============================== */
  useEffect(() => {
    const fetchMyStatus = async () => {
      const user = auth.currentUser;
      if (!user || !id) {
        setMyStatusInThisClub("none");
        setIsPresident(false);
        return;
      }

      // 1️⃣ members → 승인됨
      const memberSnap = await getDoc(
        doc(db, "clubs", id, "members", user.uid)
      );

      if (memberSnap.exists()) {
        setMyStatusInThisClub("approved");
        setIsPresident(memberSnap.data().role === "president");
        return;
      }

      // 2️⃣ pending 신청 확인
      const q = query(
        collection(db, "clubApplications"),
        where("clubId", "==", id),
        where("userId", "==", user.uid),
        where("status", "==", "pending")
      );

      const snap = await getDocs(q);
      if (!snap.empty) {
        setMyStatusInThisClub("pending");
        return;
      }

      setMyStatusInThisClub("none");
    };

    fetchMyStatus();
  }, [id]);

  /* ===============================
     🏫 동아리 정보
     =============================== */
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const snap = await getDoc(doc(db, "clubs", id));
        if (snap.exists()) {
          const data = snap.data();
          setClub({ id: snap.id, ...data });
          setEditDesc(data.description || "");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id]);

  /* ===============================
     ✍️ 가입 신청
     =============================== */
  const handleApply = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) return;

    const u = userSnap.data();

    // 🔥 이미 다른 동아리 가입/대기 중이면 차단
    if (u.myClubStatus && u.myClubStatus !== "none") {
      alert("동아리는 한 개만 가입할 수 있습니다.");
      return;
    }

    if (!u.studentId || !u.name || !u.phone) {
      alert("학번, 이름, 전화번호는 필수입니다.");
      return;
    }

    if (!intro.trim()) {
      alert("소개글을 입력해주세요.");
      return;
    }

    await addDoc(collection(db, "clubApplications"), {
      clubId: id,
      userId: user.uid,
      status: "pending",
      createdAt: serverTimestamp(),
      name: u.name,
      department: u.department,
      studentId: u.studentId,
      email: u.email,
      phone: u.phone,
      intro,
    });

    await updateDoc(doc(db, "users", user.uid), {
      myClubStatus: "pending",
      myClubId: id,
    });

    setMyStatusInThisClub("pending");
    alert("가입 신청 완료");
  };

  /* ===============================
     🚪 동아리 탈퇴
     =============================== */
  const handleLeaveClub = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm("정말 동아리를 탈퇴하시겠습니까?")) return;

    await deleteDoc(
      doc(db, "clubs", id, "members", user.uid)
    );

    await updateDoc(doc(db, "users", user.uid), {
      myClubStatus: "none",
      myClubId: null,
    });

    setMyStatusInThisClub("none");
    alert("탈퇴 완료");
  };

  /* ===============================
     ✏️ 소개글 저장 (회장)
     =============================== */
  const handleSaveDescription = async () => {
    if (!editDesc.trim()) {
      alert("소개글을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, "clubs", id), {
        description: editDesc,
      });

      setClub((prev) => ({
        ...prev,
        description: editDesc,
      }));

      setIsEditingDesc(false);
      alert("소개글이 수정되었습니다.");
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     🖥️ 렌더링
     =============================== */
  if (loading) {
    return <p className="text-center mt-20">불러오는 중...</p>;
  }

  if (!club) {
    return <p className="text-center mt-20">존재하지 않는 동아리입니다.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-20 px-6 pb-20">
      <h1 className="text-4xl font-bold">{club.name}</h1>
      <p className="text-gray-600 mt-2">{club.shortDesc}</p>

      <hr className="my-6" />

      {/* 🔥 소개글 */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">동아리 소개</h2>

        {isPresident && isEditingDesc ? (
          <>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[120px]"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditingDesc(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                취소
              </button>
              <button
                onClick={handleSaveDescription}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                저장
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="whitespace-pre-line text-lg">
              {club.description || "동아리 설명이 없습니다."}
            </div>

            {isPresident && (
              <button
                onClick={() => setIsEditingDesc(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                ✏️ 소개글 수정
              </button>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => router.push(`/clubs/${id}/schedule`)}
        className="mt-8 w-full bg-green-600 text-white py-3 rounded"
      >
        📅 일정 확인하기
      </button>

      <button
  onClick={() => router.push(`/clubs/${id}/notices`)}
  className="mt-4 w-full bg-indigo-600 text-white py-3 rounded"
>
  📢 공지사항 보기
</button>


      {/* 가입 / 상태 */}
      {myStatusInThisClub === "none" && !isPresident && (
        <>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="지원 동기"
            className="w-full border rounded p-3 mt-4"
          />
          <button
            onClick={handleApply}
            className="mt-3 w-full bg-blue-600 text-white py-3 rounded"
          >
            가입 신청하기
          </button>
        </>
      )}

      {myStatusInThisClub === "pending" && (
        <div className="mt-4 text-center bg-yellow-100 py-3 rounded">
          ⏳ 승인 대기중
        </div>
      )}

      {myStatusInThisClub === "approved" && !isPresident && (
        <button
          onClick={handleLeaveClub}
          className="mt-4 w-full bg-red-500 text-white py-3 rounded"
        >
          🚪 동아리 탈퇴하기
        </button>
      )}
    </div>
  );
}
