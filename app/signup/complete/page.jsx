"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../../firebase/config";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function CompleteSignup() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!email) {
      alert("잘못된 접근입니다.");
      router.push("/");
    }
  }, [email, router]);

  const handleFinish = async () => {
    if (password.length < 6) {
      setToast("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }

    try {
      // 1) Firebase Auth 계정 생성
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Firestore 저장
      await setDoc(doc(db, "users", result.user.uid), {
        email,
        name,
        phone,
        studentVerified: true,
        createdAt: new Date(),
      });

      // 3) 자동 로그인 방지 → 즉시 로그아웃
      await signOut(auth);

      alert("회원가입이 완료되었습니다. 로그인해주세요!");
      router.push("/");

    } catch (err) {
      console.error(err);
      setToast("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="pt-24 px-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">회원정보 입력</h2>

      <p className="mb-4 text-gray-600">{email}</p>

      <input
        className="border w-full p-2 rounded mb-3"
        placeholder="비밀번호 (6자리 이상)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="border w-full p-2 rounded mb-3"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border w-full p-2 rounded mb-3"
        placeholder="전화번호"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value.replace(/[^0-9]/g, ""))
        }
      />

      <button
        className="bg-blue-500 text-white w-full py-2 rounded"
        onClick={handleFinish}
      >
        회원가입 완료
      </button>

      {toast && (
        <p className="mt-3 text-center text-red-600">{toast}</p>
      )}
    </div>
  );
}
