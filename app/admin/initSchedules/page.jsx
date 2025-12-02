"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

export default function InitSchedules() {
  const [done, setDone] = useState(false);

  const createSchedulesForAllClubs = async () => {
    const clubsSnap = await getDocs(collection(db, "clubs"));

    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;

      // schedules 하위 컬렉션에 임시 문서 생성
      await setDoc(doc(db, `clubs/${clubId}/schedules`, "init-doc"), {
        date: "temp",
        title: "temp",
        content: "temp"
      });
    }

    setDone(true);
  };

  useEffect(() => {
    createSchedulesForAllClubs();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>동아리 일정 컬렉션 생성기</h1>
      {!done && <p>실행 중...</p>}
      {done && <p>완료! Firestore에서 확인해보세요.</p>}
    </div>
  );
}
