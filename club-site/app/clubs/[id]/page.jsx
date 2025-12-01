"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function ClubDetail({ params }) {
  const { id } = params;
  const [club, setClub] = useState(null);

  useEffect(() => {
    const fetchClub = async () => {
      const ref = doc(db, "clubs", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setClub(snap.data());
    };
    fetchClub();
  }, [id]);

  if (!club) return <div className="pt-24 px-6">불러오는 중...</div>;

  return (
    <div className="pt-24 px-6">
      <h1 className="text-3xl font-bold mb-4">{club.name}</h1>
      <p className="text-gray-600 text-lg">{club.description || "소개가 없습니다."}</p>
    </div>
  );
}
