"use client";

import { use, useEffect, useState } from "react";
import { db } from "../../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ScheduleCalendar(props) {
    // ❗ Next.js 13~16에서는 params가 Promise → use()로 언랩해야 함
    const { id } = use(props.params);

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        const loadSchedules = async () => {
            try {
                const ref = collection(db, `clubs/${id}/schedules`);
                const snap = await getDocs(ref);

                const arr = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setSchedules(arr);
            } catch (e) {
                console.error("일정 불러오기 오류:", e);
            } finally {
                setLoading(false);
            }
        };

        loadSchedules();
    }, [id]);

    const onDateClick = (dateObj) => {
        const date = dateObj.toISOString().split("T")[0];
        router.push(`/clubs/${id}/schedule/${date}`);
    };

    if (loading) return <p className="p-6 text-center">일정 불러오는 중...</p>;

    return (
        <div className="flex flex-col items-center mt-20 pb-20 px-6">
            <h1 className="text-3xl font-bold mb-8">📅 동아리 일정 캘린더</h1>

            <Calendar
                className="big-calendar"
                onClickDay={onDateClick}
                tileContent={({ date }) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const exist = schedules.some((s) => s.date === dateStr);

                    return exist ? <div className="schedule-dot">●</div> : null;
                }}

            />

            <p className="mt-4 text-gray-500 text-sm">
                ● 표시가 있는 날짜는 일정이 존재합니다.
            </p>
        </div>
    );
}
