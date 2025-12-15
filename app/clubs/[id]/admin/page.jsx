"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function ClubAdminPage() {
  const { id: clubId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [isPresident, setIsPresident] = useState(false);

  /* ===============================
     🔐 회장 권한 체크 (members 기준)
     =============================== */
  useEffect(() => {
    const checkPresident = async () => {
      const user = auth.currentUser;
      if (!user || !clubId) {
        router.replace("/");
        return;
      }

      const memberSnap = await getDoc(
        doc(db, "clubs", clubId, "members", user.uid)
      );

      if (!memberSnap.exists() || memberSnap.data().role !== "president") {
        alert("회장만 접근할 수 있습니다.");
        router.replace("/");
        return;
      }

      setIsPresident(true);
    };

    checkPresident();
  }, [clubId, router]);

  /* ===============================
     📥 가입 신청 목록 불러오기
     (권한 체크와 분리!)
     =============================== */
  useEffect(() => {
    const fetchApplications = async () => {
      const q = query(
        collection(db, "clubApplications"),
        where("clubId", "==", clubId),
        where("status", "==", "pending")
      );

      const snap = await getDocs(q);
      setApplications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    };

    if (clubId) {
      fetchApplications();
    }
  }, [clubId]);

  /* ===============================
     ✅ 가입 승인
     =============================== */
  const approveMember = async (app) => {
    if (!confirm(`${app.name} 님을 승인하시겠습니까?`)) return;

    try {
      // 1️⃣ 신청 상태 변경
      await updateDoc(doc(db, "clubApplications", app.id), {
        status: "approved",
      });

      // 2️⃣ members 컬렉션 추가
      await setDoc(
        doc(db, "clubs", clubId, "members", app.userId),
        {
          userId: app.userId,
          name: app.name,
          studentId: app.studentId,
          department: app.department,
          phone: app.phone,
          role: "member",
          joinedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 3️⃣ users 상태 업데이트
      await updateDoc(doc(db, "users", app.userId), {
        myClubStatus: "approved",
        myClubId: clubId,
      });

      // 4️⃣ UI에서 제거
      setApplications((prev) =>
        prev.filter((a) => a.id !== app.id)
      );

      alert("가입 승인이 완료되었습니다.");
    } catch (e) {
      console.error("❌ 승인 오류:", e);
      alert("승인 중 오류가 발생했습니다.");
    }
  };

  /* ===============================
     ❌ 가입 거절
     =============================== */
  const rejectMember = async (app) => {
    if (!confirm(`${app.name} 님의 가입 신청을 거절하시겠습니까?`)) return;

    await updateDoc(doc(db, "clubApplications", app.id), {
      status: "rejected",
    });

    await updateDoc(doc(db, "users", app.userId), {
      myClubStatus: "none",
      myClubId: null,
    });

    setApplications((prev) =>
      prev.filter((a) => a.id !== app.id)
    );
  };

  /* ===============================
     🖥️ 렌더링
     =============================== */
  if (loading) {
    return <p className="mt-20 text-center">불러오는 중...</p>;
  }

  if (!isPresident) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="max-w-4xl mx-auto mt-20 px-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">
        📋 동아리 가입 승인
      </h1>

      {applications.length === 0 ? (
        <p className="text-gray-500">
          승인 대기중인 신청이 없습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-4 bg-white shadow"
            >
              <p><b>이름:</b> {app.name}</p>
              <p><b>학과:</b> {app.department}</p>
              <p><b>학번:</b> {app.studentId}</p>
              <p><b>전화번호:</b> {app.phone}</p>
              <p><b>이메일:</b> {app.email}</p>
              <p><b>지원 동기:</b> {app.intro || "작성하지 않음"}</p>

              <div className="mt-3 flex gap-2 justify-end">
                <button
                  onClick={() => approveMember(app)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  승인
                </button>
                <button
                  onClick={() => rejectMember(app)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
