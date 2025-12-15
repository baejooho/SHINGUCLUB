"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function LoginModal({ open, onClose, onSuccess }) {
  if (!open) return null;

  const [toast, setToast] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast("로그인 성공!");

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setToast("로그인 실패: 이메일 또는 비밀번호 확인");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-80 shadow-xl relative animate-[fadeIn_0.25s]">

        {/* X 버튼 */}
        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">로그인</h2>

        <form onSubmit={handleLogin} className="space-y-3">

          <input
            name="email"
            type="email"
            placeholder="이메일"
            className="border w-full p-2 rounded"
            required
          />
          
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            className="border w-full p-2 rounded"
            required
          />

          <button className="bg-black text-white w-full py-2 rounded">
            로그인
          </button>
        </form>

        {toast && (
          <div className="mt-4 bg-green-600 text-white py-2 px-3 rounded text-center">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
