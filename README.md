# SHINGUCLUB (신구클럽)

신구대학교 동아리 관리 웹 애플리케이션 — 동아리 탐색, 가입 신청,
회원·공지·일정 관리를 위한 개인 프론트엔드 프로젝트

## 프로젝트 개요

SHINGUCLUB은 신구대학교 학생들이 중앙동아리를 찾고, 가입을 신청하며,
동아리 내부의 공지·일정·회원 정보를 확인할 수 있도록 만든
웹 서비스이다.

Next.js(App Router)와 Firebase(Authentication, Firestore, Storage)를
사용해 로그인/회원가입, 동아리 목록·상세, 가입 신청/승인,
회장 관리 화면, 프로필 편집 기능을 구현했다.

자세한 기획 배경은 [docs/PLANNING.md](docs/PLANNING.md)를 참고한다.

## 주요 기능

- 동아리 목록 조회 및 페이지네이션
- 동아리 상세(소개, 가입 신청/대기/승인 상태)
- 이메일 기반 회원가입·로그인 (Firebase Auth)
- 프로필 조회·수정
- 동아리 공지, 일정(캘린더), 회원 목록
- 회장(admin) 전용 가입 신청 승인/거절

## 기술 스택

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend/BaaS**: Firebase Authentication, Cloud Firestore, Storage
- **기타**: EmailJS(이메일 인증 보조), react-calendar

## 설치 및 실행 방법

```bash
git clone https://github.com/baejooho/SHINGUCLUB.git
cd SHINGUCLUB
npm install
cp .env.example .env.local
# .env.local에 Firebase, EmailJS 설정값 입력
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

자세한 환경 설정은 [docs/SETUP.md](docs/SETUP.md)를 참고한다.

## 문서

- [기획서 및 요구사항 정의서](docs/PLANNING.md)
- [WBS 및 일정](docs/WBS.md)
- [아키텍처 설계 문서](docs/ARCHITECTURE.md)
- [ADR (아키텍처 의사결정 기록)](docs/ADR.md)
- [Setup / Deploy 가이드](docs/SETUP.md)

## 향후 계획

- 동아리 검색·카테고리 필터 강화
- 권한/보안 규칙(Firestore Rules) 점검 및 고도화
- 배포(Vercel) 및 도메인 연결

## 라이선스

본 프로젝트는 학습 목적으로 제작되었습니다.
