// uploadClubs.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// 🔥 여기 firebaseConfig는 너의 firebase/config.js 에 있는 값으로 바꿔야 함!
const firebaseConfig = {
  apiKey: "AIzaSyD9Xryev37hu-jazCTFHkEpDRDgrwC4jRk",
  authDomain: "club-site-f783b.firebaseapp.com",
  projectId: "club-site-f783b",
  storageBucket: "club-site-f783b.firebasestorage.app",
  messagingSenderId: "802499909390",
  appId: "1:802499909390:web:3ccbc9a90dff28acf4295f"
};

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
    console.log(`✔ ${club.name} 추가됨`);
  }
  console.log("🔥 모든 동아리 업로드 완료!");
})();
