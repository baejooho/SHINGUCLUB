# SHINGUCLUB — Setup / Deploy 가이드

## 1. 사전 요구사항

- Node.js 18 이상
- npm
- Firebase 프로젝트 (Authentication, Firestore, Storage 사용)

## 2. 클론 및 설치

```bash
git clone https://github.com/baejooho/SHINGUCLUB.git
cd SHINGUCLUB
npm install
```

## 3. Firebase 설정 (환경변수)

Firebase 웹 설정은 코드에 넣지 않고 `.env.local`로 관리한다.

```bash
cp .env.example .env.local
```

`.env.local`에 Firebase Console 값을 넣는다.

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API 키 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth 도메인 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 프로젝트 ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage 버킷 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 메시징 센더 ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 앱 ID |

`.env.local`은 Git에 올라가지 않는다. (`.gitignore`에 `.env*` 포함, `.env.example`만 커밋)

Firebase Console에서 확인할 항목:
- Authentication: Email/Password 활성화
- Firestore: `clubs`, `clubApplications` 등 컬렉션
- (선택) Storage, EmailJS 키

## 3-1. 초기 동아리 데이터 (선택)

동아리 초기 데이터를 넣을 때만 아래 스크립트를 실행한다. `.env.local`을 읽으며, 실행할 때마다 `clubs` 문서가 추가된다.

```bash
npm run upload-clubs
```

## 4. 실행

```bash
npm run dev
```

`http://localhost:3000` 접속.

## 5. 빌드

```bash
npm run build
npm start
```

## 6. 배포 (권장: Vercel)

1. GitHub 저장소 연결
2. Framework Preset: Next.js
3. 환경변수에 Firebase 공개 설정 등록
4. Deploy

## 7. 주의사항

- Firebase 웹 API 키는 “비밀키”와 다르지만, Firestore Rules가 약하면
  데이터 노출/변조 위험이 있다. Rules를 반드시 점검한다.
- 회장 권한은 클라이언트 체크와 Rules를 함께 적용하는 것이 안전하다.
