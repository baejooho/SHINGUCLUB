"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);       // Firebase Auth 사용자
    const [userData, setUserData] = useState(null); // Firestore 사용자 정보
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                router.push("/"); // 로그인 안 되어있으면 홈으로
                return;
            }

            setUser(currentUser);

            // Firestore 데이터 불러오기
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserData(docSnap.data());
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
                <p><b>전화번호:</b> {userData?.phone || "없음"}</p>

                {/* 학과 */}
                <p><b>학과:</b> {userData?.department || "미등록"}</p>

                {/* 동아리 */}
                <p>
                    <b>동아리:</b>{" "}
                    {userData?.clubs?.length > 0
                        ? userData.clubs.join(", ")
                        : "가입한 동아리가 없습니다"}
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
