// uploadClubs.js
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error(
    "Firebase 환경변수가 없습니다. .env.example을 .env.local로 복사한 뒤 값을 입력하세요."
  );
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clubs = [
  { name: "동아리 소개", description: "" },
  { name: "리더스", description: "" },
  { name: "S·B·C(농구부)", description: "" },
  { name: "NEWHILL(배구부)", description: "" },
  { name: "콕콕콕(배드민턴부)", description: "" },
  { name: "SFC(축구부)", description: "" },
  { name: "S·G·T·C(테니스부)", description: "" },
  { name: "그림패움", description: "" },
  { name: "노들(노래가좋은사람들)", description: "" },
  { name: "S.C.F.(기독교동아리)", description: "" },
  { name: "Nature Plus", description: "" },
  { name: "데시나", description: "" },
  { name: "머무네", description: "" },
  { name: "불똥별(불교동아리)", description: "" },
  { name: "볼링블링(볼링부)", description: "" },
  { name: "솔트레인", description: "" }
];

(async () => {
  console.log("동아리 업로드 시작...");
  for (let club of clubs) {
    await addDoc(collection(db, "clubs"), club);
    console.log("업로드:", club.name);
  }
  console.log("완료!");
  process.exit(0);
})();
