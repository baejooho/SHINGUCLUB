"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";

export default function EmailVerifySignupModal({ open, onClose, onSuccess }) {
  if (!open) return null;

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [toast, setToast] = useState("");

  const [shake, setShake] = useState(false); // 🔥 인증 실패 시 흔들기
  const [timer, setTimer] = useState(0); // 🔥 타이머

  // 타이머 작동
  useEffect(() => {
    if (timer <= 0) return;
    const countdown = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer]);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 인증코드 발송 함수
  const sendVerifyCode = async () => {
    if (!email.endsWith("@g.shingu.ac.kr")) {
      setToast("신구대 이메일(@g.shingu.ac.kr)만 사용 가능합니다.");
      return;
    }

    try {
      const code = generateCode();

      // Firestore에 코드 저장
      await setDoc(doc(db, "emailCodes", email), {
        code,
        createdAt: new Date(),
      });

      // EmailJS로 발송
      await emailjs.send(
        "service_ex63x8g",
        "template_px72gnf",
        {
          user_email: email,
          verify_code: code,
        },
        "gH5UXA6t6wBqrBAGB"
      );

      setCodeSent(true);
      setToast("인증코드가 이메일로 발송되었습니다.");
      setTimer(60); // 🔥 60초 타이머 시작

    } catch (error) {
      console.error("EmailJS Error:", error);
      setToast("인증코드 발송 중 오류가 발생했습니다.");
    }
  };

  // 인증코드 확인 함수
  const verifyCode = async () => {
    const ref = doc(db, "emailCodes", email);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setToast("인증코드가 존재하지 않습니다.");
      return;
    }

    if (snap.data().code === inputCode) {
      onClose();   // 🔥 모달 닫기
      onSuccess && onSuccess();
      router.push(`/signup/complete?email=${email}`);
    } else {
      setToast("인증코드가 올바르지 않습니다.");

      // 🔥 흔들림 애니메이션 발동
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className={`bg-white p-6 rounded-xl w-80 transition-all ${
          shake ? "animate-shake" : ""
        }`}
      >
        <button className="float-right" onClick={onClose}>✕</button>

        <h2 className="text-xl font-bold mb-4">학생 이메일 인증</h2>

        {!codeSent ? (
          <>
            <input
              type="email"
              placeholder="신구대 이메일 (@g.shingu.ac.kr)"
              className="border w-full p-2 rounded mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white w-full py-2 rounded"
              onClick={sendVerifyCode}
            >
              인증코드 발송
            </button>
          </>
        ) : (
          <>
            <p className="text-sm mb-2 text-gray-600">
              이메일로 전송된 인증코드를 입력하세요.
            </p>

            <input
              type="text"
              placeholder="6자리 인증코드"
              maxLength={6}
              className="border w-full p-2 rounded mb-3"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />

            <button
              className="bg-green-500 text-white w-full py-2 rounded mb-3"
              onClick={verifyCode}
            >
              인증 완료
            </button>

            {/* 재전송 타이머 UI */}
            <button
              disabled={timer > 0}
              onClick={sendVerifyCode}
              className={`w-full py-2 rounded border ${
                timer > 0
                  ? "text-gray-400 border-gray-300"
                  : "text-blue-600 border-blue-400 hover:bg-blue-50"
              }`}
            >
              {timer > 0
                ? `재전송 (${timer}s)`
                : "인증코드 다시 보내기"}
            </button>
          </>
        )}

        {toast && (
          <p className="mt-3 text-center text-blue-600">{toast}</p>
        )}
      </div>

      {/* 🔥 흔들림 애니메이션 Tailwind custom keyframes */}
      <style jsx global>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.4s ease;
        }
      `}</style>
    </div>
  );
}
