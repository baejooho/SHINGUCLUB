"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
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
      "e스포츠학과"
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
      "호텔제과제빵과"
    ],
    "정보미디어학부": [
      "사진영상콘텐츠과",
      "프린트미디어과",
      "미디어콘텐츠과",
      "컴퓨터소프트웨어과",
      "AI데이터과",
      "IT보안과",
      "게임콘텐츠과"
    ],
    "비즈니스실무학부": [
      "마케팅학과",
      "세무회계학과",
      "호텔관광과",
      "항공서비스과",
      "사회복지학과",
      "아동보육과"
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
      "응급구조학과"
    ],
    "공간시스템학부": [
      "부동산지적학과",
      "실내건축과",
      "건축학과"
    ],
    "자율전공학과": ["자율전공학과"],
  };

  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    major: "",
    department: "",
  });

  const [loading, setLoading] = useState(true);

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

  // 학부 변경 시 학과 초기화
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
      await updateDoc(doc(db, "users", user.uid), userData);
      alert("정보가 수정되었습니다!");
      router.push("/profile");
    } catch (e) {
      alert("수정 실패");
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (!confirm("정말 탈퇴하시겠습니까?")) return;

    try {
      const user = auth.currentUser;

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      alert("회원탈퇴 완료되었습니다.");
      router.push("/");
    } catch (e) {
      alert("탈퇴 실패. 다시 로그인해 주세요.");
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
            <option key={m} value={m}>{m}</option>
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
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        저장하기
      </button>

      {/* 회원탈퇴 */}
      <button
        onClick={handleDeleteAccount}
        className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        회원 탈퇴
      </button>
    </div>
  );
}
