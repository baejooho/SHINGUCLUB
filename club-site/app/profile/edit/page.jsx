"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 입력값 state
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [majorGroup, setMajorGroup] = useState("");
    const [department, setDepartment] = useState("");

    // 학부 → 학과 목록
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
            "호텔제과제빵과",
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

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                router.push("/");
                return;
            }

            setUser(currentUser);

            // Firestore 데이터 가져오기
            const docRef = doc(db, "users", currentUser.uid);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const userData = snap.data();
                setData(userData);
                setNickname(userData.nickname || "");
                setPhone(userData.phone || "");
                setMajorGroup(userData.majorGroup || "");
                setDepartment(userData.department || "");
            }

            setLoading(false);
        });

        return () => unsub();
    }, []);

    // 저장 함수
    const handleSave = async () => {
        const docRef = doc(db, "users", user.uid);

        await updateDoc(docRef, {
            nickname,
            phone,
            majorGroup,
            department,
        });

        alert("정보가 수정되었습니다!");
        router.push("/profile");
    };

    if (loading) return <div className="pt-24 text-center">불러오는 중...</div>;

    return (
        <div className="pt-24 px-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">정보 수정</h1>

            <div className="bg-white shadow p-6 rounded-lg space-y-4">

                {/* 닉네임 */}
                <div>
                    <p className="font-semibold mb-1">닉네임</p>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                </div>

                {/* 전화번호 */}
                <div>
                    <p className="font-semibold mb-1">전화번호 (숫자만)</p>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => {
                            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                            setPhone(onlyNums);
                        }}
                        className="border p-2 w-full rounded"
                    />
                </div>

                {/* 학부 선택 */}
                <div>
                    <p className="font-semibold mb-1">학부</p>
                    <select
                        value={majorGroup}
                        onChange={(e) => {
                            setMajorGroup(e.target.value);
                            setDepartment(""); // 학부 바꾸면 학과 초기화
                        }}
                        className="border p-2 w-full rounded"
                    >
                        <option value="">선택하세요</option>
                        {Object.keys(departments).map((major) => (
                            <option key={major} value={major}>
                                {major}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 학과 선택 */}
                <div>
                    <p className="font-semibold mb-1">학과</p>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="border p-2 w-full rounded"
                        disabled={!majorGroup}
                    >
                        <option value="">선택하세요</option>

                        {majorGroup &&
                            departments[majorGroup].map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                    </select>
                </div>

                <button
                    className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600"
                    onClick={handleSave}
                >
                    저장하기
                </button>
            </div>
        </div>
    );
}
