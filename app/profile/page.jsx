"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);          // Firebase Auth 사용자
  const [userData, setUserData] = useState(null);  // Firestore users 문서
  const [myClubName, setMyClubName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      setUser(currentUser);

      // 1️⃣ users 문서
      const userSnap = await getDoc(
        doc(db, "users", currentUser.uid)
      );

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);

        // 2️⃣ 가입된 동아리 이름 조회 (승인된 경우만)
        if (data.myClubStatus === "approved" && data.myClubId) {
          const clubSnap = await getDoc(
            doc(db, "clubs", data.myClubId)
          );

          if (clubSnap.exists()) {
            setMyClubName(clubSnap.data().name);
          } else {
            setMyClubName(null);
          }
        } else {
          setMyClubName(null);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="pt-24 text-center">불러오는 중...</div>;
  }

  return (
    <div className="pt-24 px-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">내 정보</h1>

      <div className="bg-white shadow p-6 rounded-lg space-y-4 text-lg">

        {/* 이메일 */}
        <p><b>이메일:</b> {user.email}</p>

        {/* 이름 */}
        <p><b>이름:</b> {userData?.name || "미등록"}</p>

        {/* 전화번호 */}
        <p><b>전화번호:</b> {userData?.phone || "미등록"}</p>

        {/* 학번 */}
        <p><b>학번:</b> {userData?.studentId || "미등록"}</p>

        {/* 학과 */}
        <p><b>학과:</b> {userData?.department || "미등록"}</p>

        {/* 🔥 가입된 동아리 */}
        <p>
          <b>가입된 동아리:</b>{" "}
          {userData?.myClubStatus === "approved" && myClubName && (
            <span className="text-blue-600">{myClubName}</span>
          )}

          {userData?.myClubStatus === "pending" && (
            <span className="text-yellow-600">승인 대기중</span>
          )}

          {userData?.myClubStatus === "none" && (
            <span className="text-gray-500">없음</span>
          )}
        </p>

        {/* 가입일 */}
        <p>
          <b>가입일:</b>{" "}
          {user.metadata.creationTime
            ? new Date(user.metadata.creationTime).toLocaleString("ko-KR")
            : "알 수 없음"}
        </p>

        <button
          onClick={() => router.push("/profile/edit")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          정보 수정하기
        </button>
      </div>
    </div>
  );
}
