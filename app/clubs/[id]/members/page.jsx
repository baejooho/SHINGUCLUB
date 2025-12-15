"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase/config";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function ClubMembersPage() {
  const { id: clubId } = useParams();
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [isPresident, setIsPresident] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  

  // 🔥 역할 우선순위
  const rolePriority = {
    president: 0,
    staff: 1,
    member: 2,
  };

  // 🔥 정렬 (임원진 위)
  const sortedMembers = [...members].sort(
    (a, b) => rolePriority[a.role] - rolePriority[b.role]
  );

  // 🔍 이름 검색
  const filteredMembers = sortedMembers.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  );

  // 👑 임원진 / 👤 일반 회원 분리
  const executives = filteredMembers.filter(
    (m) => m.role === "president" || m.role === "staff"
  );

  const normalMembers = filteredMembers.filter(
    (m) => m.role === "member"
  );

  const delegatePresident = async (newPresidentId) => {
  if (!confirm("회장 권한을 위임하시겠습니까?")) return;

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    // 1️⃣ 현재 회장 → 임원
    await updateDoc(
      doc(db, "clubs", clubId, "members", currentUser.uid),
      { role: "staff" }
    );

    // 2️⃣ 새 회장 → 회장
    await updateDoc(
      doc(db, "clubs", clubId, "members", newPresidentId),
      { role: "president" }
    );

    // 3️⃣ users 컬렉션 업데이트
    await updateDoc(doc(db, "users", currentUser.uid), {
      presidentOf: null,
    });

    await updateDoc(doc(db, "users", newPresidentId), {
      presidentOf: clubId,
    });

    // 4️⃣ 로컬 상태 반영
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === currentUser.uid)
          return { ...m, role: "staff" };
        if (m.id === newPresidentId)
          return { ...m, role: "president" };
        return m;
      })
    );

    alert("회장 권한이 위임되었습니다.");
  } catch (e) {
    console.error("회장 위임 오류:", e);
    alert("회장 위임 중 오류가 발생했습니다.");
  }
  // 🔥 내가 더 이상 회장이 아님을 즉시 반영
setIsPresident(false);

};


  // 🔐 회장만 접근 가능
  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user || !clubId) {
      router.replace("/");
      return;
    }

    // 🔥 무조건 members 컬렉션 기준
    const memberSnap = await getDoc(
      doc(db, "clubs", clubId, "members", user.uid)
    );

    if (memberSnap.exists() && memberSnap.data().role === "president") {
      setIsPresident(true);
      setLoading(false);
    } else {
      alert("회장만 접근할 수 있습니다.");
      router.replace("/");
    }
  });

  return () => unsubscribe();
}, [clubId, router]);


  // 🔥 멤버 목록 불러오기 (회장 여부와 상관없이 항상 로드)
useEffect(() => {
  if (!clubId) return;

  const fetchMembers = async () => {
    try {
      const snap = await getDocs(
        collection(db, "clubs", clubId, "members")
      );

      setMembers(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (e) {
      console.error("멤버 불러오기 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  fetchMembers();
}, [clubId]);



  // 🔄 역할 변경
  const changeRole = async (userId, role) => {
    await updateDoc(
      doc(db, "clubs", clubId, "members", userId),
      { role }
    );

    setMembers((prev) =>
      prev.map((m) =>
        m.id === userId ? { ...m, role } : m
      )
    );
  };

  // ❌ 강제 탈퇴
  const removeMember = async (userId) => {
    if (!confirm("해당 멤버를 탈퇴시키겠습니까?")) return;

    await deleteDoc(
      doc(db, "clubs", clubId, "members", userId)
    );

    await updateDoc(doc(db, "users", userId), {
      myClubStatus: "none",
      myClubId: null,
    });

    setMembers((prev) =>
      prev.filter((m) => m.id !== userId)
    );
  };

  if (loading) {
    return <p className="mt-20 text-center">불러오는 중...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-20 px-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">
        👥 동아리 인원 관리
      </h1>

      {/* 🔍 검색 */}
      <input
        type="text"
        placeholder="이름으로 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-3 py-2 border rounded-lg"
      />

      {filteredMembers.length === 0 && (
        <p className="text-center text-gray-500">
          검색 결과가 없습니다.
        </p>
      )}

      {/* 👑 임원진 */}
      <h2 className="text-2xl font-bold mb-4">
        👑 임원진
      </h2>

      {executives.length === 0 ? (
        <p className="text-gray-500 mb-6">
          임원진이 없습니다.
        </p>
      ) : (
        executives.map((m) => (
          <MemberCard
  key={m.id}
  m={m}
  changeRole={changeRole}
  removeMember={removeMember}
  delegatePresident={delegatePresident}
/>

        ))
      )}

      {/* 👤 일반 회원 */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        👤 일반 회원
      </h2>

      {normalMembers.length === 0 ? (
        <p className="text-gray-500">
          일반 회원이 없습니다.
        </p>
      ) : (
        normalMembers.map((m) => (
          <MemberCard
            key={m.id}
            m={m}
            changeRole={changeRole}
            removeMember={removeMember}
          />
        ))
      )}
    </div>
  );
}

/* 🔧 멤버 카드 컴포넌트 */
function MemberCard({ m, changeRole, removeMember, delegatePresident }) {

  return (
    <div className="border rounded-lg p-4 mb-3 bg-white shadow">
      <p><b>이름:</b> {m.name}</p>
      <p><b>전화번호:</b> {m.phone || "없음"}</p>
      <p><b>학번:</b> {m.studentId}</p>
      <p><b>학과:</b> {m.department}</p>
      <p>
        <b>역할:</b>{" "}
        {m.role === "president"
          ? "회장"
          : m.role === "staff"
          ? "임원진"
          : "일반 회원"}
      </p>

      {m.role !== "president" && (
        <div className="mt-2 flex gap-2">
          {m.role === "member" && (
            <button
              onClick={() => changeRole(m.id, "staff")}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              임원으로 승격
            </button>
          )}

{m.role === "staff" && (
  <button
    onClick={() => delegatePresident(m.id)}
    className="px-3 py-1 bg-purple-600 text-white rounded"
  >
    👑 회장 위임
  </button>
)}
          {m.role === "staff" && (
            <button
              onClick={() => changeRole(m.id, "member")}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              일반 회원으로
            </button>
            
          )}
          

          <button
            onClick={() => removeMember(m.id)}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            탈퇴
          </button>
        </div>
      )}
    </div>
  );
}
