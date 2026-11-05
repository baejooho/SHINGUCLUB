# SHINGUCLUB — 아키텍처 설계 문서

## 1. 개요

SHINGUCLUB은 Next.js App Router 기반의 클라이언트 중심 웹앱이다.
서버를 직접 구현하기보다 Firebase를 BaaS로 사용해
인증·데이터·파일 저장을 처리한다.

## 2. 시스템 구성도

```
[사용자 브라우저]
      |
      v
[Next.js App Router (React)]
  - app/page.jsx            동아리 목록
  - app/clubs/[id]/*        상세/공지/일정/회원/admin
  - app/profile/*           프로필
  - app/components/*        Header, Login, Signup Modal
      |
      +---- Firebase Auth -------- 로그인/회원가입
      +---- Cloud Firestore ----- clubs, members, applications, notices...
      +---- Firebase Storage ---- (프로필/이미지 등)
      +---- EmailJS (옵션) ------ 이메일 인증 보조
```

## 3. 컴포넌트 설명

### 3.1 페이지 (App Router)
- `/` : 동아리 목록 + 페이지네이션
- `/clubs/[id]` : 상세, 가입 신청, 소개 수정(회장)
- `/clubs/[id]/admin` : 가입 신청 승인/거절
- `/clubs/[id]/notices` : 공지
- `/clubs/[id]/schedule` : 일정 캘린더
- `/clubs/[id]/members` : 회원 목록
- `/profile`, `/profile/edit` : 프로필

### 3.2 Firebase 연동
- `firebase/config.js`에서 Auth/Firestore/Storage 초기화
- 클라이언트 컴포넌트(`"use client"`)에서 Firestore SDK 직접 호출

### 3.3 권한 모델
- `clubs/{clubId}/members/{uid}.role`
  - `president`: 관리 화면·승인 가능
  - 일반 회원: 조회·신청 상태 확인

## 4. 주요 데이터 흐름

1. 사용자가 홈에서 동아리 목록 조회 (`getDocs(clubs)`)
2. 상세 진입 후 내 상태 확인 (`members` → 없으면 `clubApplications` pending)
3. 미가입이면 가입 신청 문서 생성
4. 회장이 admin에서 승인 → `members`에 문서 생성, 신청 상태 갱신
5. 승인 회원은 공지/일정/회원 메뉴 이용

## 5. 설계상 특징

- BaaS 우선: 별도 REST API 서버 없이 빠른 프로토타이핑
- 역할 기반 UI: 회장만 admin 라우트 접근
- App Router + Client Component: 인터랙션이 많은 화면을 클라이언트에서 처리

## 6. 향후 확장 시 아키텍처 변화

- Firebase 웹 설정은 환경변수로 분리함. 민감 쓰기는 서버 컴포넌트 또는 API Route로 옮길 여지 있음
- 민감 쓰기 로직은 Cloud Functions 또는 API Route로 이전
- Security Rules로 클라이언트 직접 쓰기 범위 축소
