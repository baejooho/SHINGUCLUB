# SHINGUCLUB — ADR (Architecture Decision Record)

본 문서는 프로젝트 진행 중 내린 주요 아키텍처 의사결정과 그 배경을 기록한다.

---

## ADR-1: 백엔드 직접 구현 대신 Firebase(BaaS) 선택

### 상태
승인됨

### 배경 (Context)
개인 프로젝트에서 인증·DB·파일 저장 서버를 처음부터 만들면
프론트 기능 완성보다 인프라 구축에 시간이 많이 소요된다.

### 결정 (Decision)
Firebase Authentication + Cloud Firestore + Storage를 사용해
백엔드 기능을 BaaS로 대체한다.

### 이유 (Rationale)
- 이메일 로그인·회원 상태를 빠르게 구현 가능
- 동아리/신청/회원 문서를 컬렉션 구조로 자연스럽게 모델링 가능
- 배포·운영 부담이 적음

### 결과 (Consequences)
- 프론트에서 Firestore SDK를 직접 호출하는 구조가 됨
- Security Rules와 키 관리를 별도로 신경 써야 함

---

## ADR-2: Next.js App Router + Client Component 중심

### 상태
승인됨

### 배경 (Context)
로그인 상태, 가입 신청, 실시간성 UI 등 브라우저 상호작용이 많다.

### 결정 (Decision)
페이지 대부분을 `"use client"` 컴포넌트로 구현하고,
Next.js App Router로 라우팅한다.

### 이유 (Rationale)
- Firebase Web SDK와의 연동이 단순
- 모달·상태 관리·라우팅을 React 패턴으로 일관되게 구현 가능

### 결과 (Consequences)
- SEO/서버 렌더링 이점은 상대적으로 적음 (교내 도구 목적에는 충분)
- 추후 일부 조회를 Server Component로 옮길 여지 있음

---

## ADR-3: 회장 권한을 members.role로 표현

### 상태
승인됨

### 배경 (Context)
가입 승인·소개 수정 등은 모든 회원에게 열리면 안 된다.

### 결정 (Decision)
`clubs/{id}/members/{uid}` 문서의 `role` 값이 `president`인
사용자만 admin 기능을 사용하도록 한다.

### 이유 (Rationale)
- 동아리 단위로 권한이 명확함
- 승인 시 members 문서 생성과 권한 부여를 한 흐름으로 처리 가능

### 결과 (Consequences)
- UI에서 권한 체크를 수행하므로, Firestore Rules로 한 번 더 막는 것이 안전
