"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { setDoc, doc } from "firebase/firestore";

export default function SignupModal({ open, onClose, onSuccess, openLogin }) {
  if (!open) return null;

  const [toast, setToast] = useState("");
  const [askLogin, setAskLogin] = useState(false); // 회원가입 완료 후 "로그인 하시겠습니까?" 모달

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setname] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    // 비밀번호 자리수 검증
    if (password.length < 6) {
      setToast("비밀번호는 6자리 이상으로 설정해주세요.");
      return;
    }

    try {
      // Firebase Auth 계정 생성
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, "users", result.user.uid), {
        email,
        name,
        phone,
        role: "user",
        createdAt: new Date(),
      });

      // ⭐ Firebase가 자동 로그인시켜버리기 때문에, 강제 로그아웃해서 비로그인 상태로 돌려놓기
      await signOut(auth);

      // 부모에게 "회원가입 성공" 알림 (원하면 토스트 등)
      onSuccess && onSuccess();

      // "로그인 하시겠습니까?" 모달 띄우기
      setAskLogin(true);
      setToast("");

    } catch (err) {
      console.error(err);
      setToast("회원가입 실패: 비밀번호는 6자리 이상이어야 합니다.");
    }
  };

  return (
    <>
      {/* 메인 회원가입 모달 (질문 모달 뜰 때는 숨김) */}
      {!askLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl relative animate-[fadeIn_0.25s]">

            {/* X 버튼 */}
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              onClick={onClose}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">회원가입</h2>

            <form onSubmit={handleSignup} className="space-y-3">
              {/* 이메일 */}
              <input
                type="email"
                placeholder="이메일"
                className="border w-full p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* 비밀번호 */}
              <input
                type="password"
                placeholder="비밀번호 (6자리 이상)"
                className="border w-full p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* 이름 */}
              <input
                type="text"
                placeholder="이름"
                className="border w-full p-2 rounded"
                value={name}
                onChange={(e) => setname(e.target.value)}
                required
              />

              {/* 전화번호 */}
              <input
                type="text"
                placeholder="전화번호 (숫자만 입력 가능)"
                className="border w-full p-2 rounded"
                value={phone}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                  setPhone(onlyNums);
                }}
                required
              />

              <button className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition">
                회원가입
              </button>
            </form>

            {toast && (
              <div className="mt-4 bg-blue-600 text-white py-2 px-3 rounded text-center">
                {toast}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 회원가입 완료 후 "로그인 하시겠습니까?" 모달 */}
      {askLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.25s]">
          <div className="bg-white p-6 rounded-xl w-72 shadow-xl text-center">
            <h3 className="text-lg font-bold mb-3">회원가입 완료!</h3>
            <p className="mb-5">지금 로그인하시겠습니까?</p>

            <div className="flex justify-between gap-3">
              <button
                className="bg-gray-300 px-4 py-2 rounded w-1/2"
                onClick={() => {
                  setAskLogin(false);
                  onClose(); // 그냥 닫고 메인 화면만 보여줌
                }}
              >
                아니요
              </button>

              <button
                className="bg-blue-500 text-white px-4 py-2 rounded w-1/2"
                onClick={() => {
                  setAskLogin(false);
                  onClose();      // 회원가입 모달 닫고
                  openLogin && openLogin(); // 로그인 모달 열기
                }}
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
