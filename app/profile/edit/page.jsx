"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import {
  deleteUser,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";



export default function EditProfilePage() {
  const router = useRouter();

  // 학부/학과 데이터
  const departments = {
    "산업디자인학부": [
      "영상디자인과",
      "시각디자인과",
      "패션디자인과",
      "헤어디자인전공",
      "스킨케어전공",
      "메이크업전공",
      "e스포츠학과",
    ],
    "생명환경학부": [
      "환경조경학과",
      "생태정원전공",
      "플로리스트전공",
      "정원문화산업전공",
      "반려동물산업과",
      "반려동물보건과",
      "바이오생명과학과",
      "유아교육학과",
      "식품영양학과",
      "호텔조리과",
      "호텔제과제빵과",
    ],
    "정보미디어학부": [
      "사진영상콘텐츠과",
      "프린트미디어과",
      "미디어콘텐츠과",
      "컴퓨터소프트웨어과",
      "AI데이터과",
      "IT보안과",
      "게임콘텐츠과",
    ],
    "비즈니스실무학부": [
      "마케팅학과",
      "세무회계학과",
      "호텔관광과",
      "항공서비스과",
      "사회복지학과",
      "아동보육과",
    ],
    "보건의료학부": [
      "물리치료학과",
      "방사선학과",
      "치기공학과",
      "치위생학과",
      "작업치료과",
      "임상병리학과",
      "보건의료행정학과",
      "스포츠재활과",
      "응급구조학과",
    ],
    "공간시스템학부": ["부동산지적학과", "실내건축과", "건축학과"],
    "자율전공학과": ["자율전공학과"],
  };

  

  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    major: "",
    department: "",
    studentId: "",
  });

  const [loading, setLoading] = useState(true);

  // 비밀번호 변경
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  // 회원탈퇴 모달
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  // 로그인 유저 정보 로드
  useEffect(() => {
    const fetch = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("로그인이 필요합니다.");
        router.push("/");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserData(snap.data());
      }

      setLoading(false);
    };

    fetch();
  }, [router]);

  // Input 변경
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  // 학부 변경
  const handleMajorChange = (e) => {
    setUserData({
      ...userData,
      major: e.target.value,
      department: "",
    });
  };

  // 정보 저장
  const handleSave = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    // 1️⃣ users 컬렉션 업데이트
    await updateDoc(doc(db, "users", user.uid), userData);

    // 2️⃣ 다시 users 문서 읽기 (myClubId 얻기)
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) {
      alert("유저 정보가 없습니다.");
      return;
    }

    const myClubId = userSnap.data().myClubId;

    // 3️⃣ 🔥 동아리에 가입되어 있으면 members도 같이 업데이트
    if (myClubId) {
      const memberRef = doc(db, "clubs", myClubId, "members", user.uid);

      await setDoc(
        memberRef,
        {
          name: userData.name,
          phone: userData.phone,
          department: userData.department,
          studentId: userData.studentId,
        },
        { merge: true } // ⭐ role 같은 기존 필드 유지
      );
    }

    alert("정보가 수정되었습니다!");
    router.push("/profile");
  } catch (error) {
    console.error("handleSave 오류:", error);
    alert("수정 실패");
  }
};


  // 🔥 비밀번호 변경
  const handleChangePassword = async () => {
    setPwMessage("");

    if (!currentPw || !newPw) {
      setPwMessage("현재 비밀번호와 새 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const user = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPw
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPw);

      setPwMessage("비밀번호가 성공적으로 변경되었습니다!");
      setCurrentPw("");
      setNewPw("");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setPwMessage("현재 비밀번호가 올바르지 않습니다.");
      } else if (error.code === "auth/weak-password") {
        setPwMessage("새 비밀번호가 너무 약합니다. 6자리 이상 입력해주세요.");
      } else {
        setPwMessage("오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 🔥 회원 탈퇴
  const handleDeleteAccount = async () => {
    setDeleteMessage("");

    if (!deletePw) {
      setDeleteMessage("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const user = auth.currentUser;

      // 재인증
      const credential = EmailAuthProvider.credential(
        user.email,
        deletePw
      );

      await reauthenticateWithCredential(user, credential);

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      alert("회원탈퇴가 완료되었습니다.");
      router.push("/");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setDeleteMessage("비밀번호가 올바르지 않습니다.");
      } else {
        setDeleteMessage("탈퇴 실패. 다시 시도해주세요.");
      }
    }
  };

  if (loading) return <div className="pt-24 px-6">불러오는 중...</div>;

  return (
    <div className="pt-24 px-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">내 정보 수정</h1>

      {/* 이름 */}
      <div className="mb-4">
        <label className="font-semibold">이름</label>
        <input
          name="name"
          value={userData.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mt-1"
        />
      </div>

      {/* 전화번호 */}
      <div className="mb-4">
        <label className="font-semibold">전화번호</label>
        <input
          name="phone"
          value={userData.phone}
          onChange={handleChange}
          placeholder="숫자만 입력"
          className="w-full border px-3 py-2 rounded mt-1"
        />
      </div>

      {/* 학번 */}
      <div className="mb-4">
        <label className="font-semibold">학번</label>
        <input
          name="studentId"
          value={userData.studentId || ""}   // 🔥 핵심
          onChange={handleChange}
          placeholder="예: 2022136038"
          className="w-full border px-3 py-2 rounded mt-1"
        />

      </div>

      {/* 학부 */}
      <div className="mb-4">
        <label className="font-semibold">학부</label>
        <select
          value={userData.major}
          onChange={handleMajorChange}
          className="w-full border px-3 py-2 rounded mt-1"
        >
          <option value="">학부 선택</option>
          {Object.keys(departments).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* 학과 */}
      {userData.major && (
        <div className="mb-6">
          <label className="font-semibold">학과</label>
          <select
            name="department"
            value={userData.department}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mt-1"
          >
            <option value="">학과 선택</option>
            {departments[userData.major].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 저장하기 */}
      <button
        onClick={handleSave}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        저장하기
      </button>

      {/* 🔥 비밀번호 변경 */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">비밀번호 변경</h2>

        <input
          type="password"
          placeholder="현재 비밀번호"
          className="w-full border px-3 py-2 rounded mb-2"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
        />

        <input
          type="password"
          placeholder="새 비밀번호 (6자리 이상)"
          className="w-full border px-3 py-2 rounded mb-2"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />

        <button
          onClick={handleChangePassword}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
        >
          비밀번호 변경
        </button>

        {pwMessage && (
          <p className="text-center text-sm mt-2 text-gray-600">
            {pwMessage}
          </p>
        )}
      </div>

      {/* 🔥 회원탈퇴 버튼 → 모달 열기 */}
      <button
        onClick={() => setDeleteModalOpen(true)}
        className="mt-8 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        회원 탈퇴
      </button>

      {/* 🔥 회원탈퇴 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              회원 탈퇴
            </h2>

            <p className="text-sm mb-4 text-gray-600">
              탈퇴를 위해 비밀번호를 입력해주세요.<br />
              계정 정보와 데이터가 모두 삭제됩니다.
            </p>

            <input
              type="password"
              placeholder="비밀번호 입력"
              className="w-full border px-3 py-2 rounded mb-2"
              value={deletePw}
              onChange={(e) => setDeletePw(e.target.value)}
            />

            {deleteMessage && (
              <p className="text-sm text-red-500 mb-2">{deleteMessage}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletePw("");
                  setDeleteMessage("");
                }}
                className="flex-1 border py-2 rounded hover:bg-gray-100"
              >
                취소
              </button>

              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
