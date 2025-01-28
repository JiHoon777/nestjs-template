# Authentication Flow

## Overview
이 프로젝트는 Access Token과 Refresh Token을 사용하는 JWT 기반의 인증 시스템을 구현하고 있습니다. 토큰은 HTTP-only 쿠키를 통해 안전하게 전달됩니다.

## 인증 흐름

### 1. 회원가입 (Signup)
1. 클라이언트가 `/auth/signup`에 email과 password를 전송
2. 비밀번호는 bcryptjs를 사용하여 해시
3. 사용자 정보를 DB에 저장
4. 생성된 사용자 정보 반환 (비밀번호 제외)

### 2. 로그인 (Signin)
1. 클라이언트가 `/auth/signin`에 email과 password를 전송
2. `LocalStrategy`가 사용자 검증
   - DB에서 email로 사용자 조회
   - bcryptjs로 비밀번호 검증
3. 검증 성공 시 Access Token과 Refresh Token 생성
   - Access Token (15분): 실제 인증에 사용
   - Refresh Token (7일): Access Token 갱신에 사용
4. Refresh Token은 해시하여 DB에 저장
5. 두 토큰을 HTTP-only 쿠키로 설정하여 응답
   - Authentication: Access Token
   - Refresh: Refresh Token

### 3. 토큰 갱신 (Refresh)
1. Access Token이 만료되면 클라이언트가 `/auth/refresh`로 요청
2. `JwtRefreshStrategy`가 Refresh Token 검증
   - 쿠키에서 Refresh Token 추출
   - Token 유효성 검증
   - DB의 해시된 Refresh Token과 비교
3. 검증 성공 시 새로운 Access Token과 Refresh Token 발급

### 4. 보호된 라우트 접근
1. 클라이언트가 요청 시 자동으로 쿠키의 Access Token이 전송됨
2. `JwtStrategy`가 토큰 검증
3. 검증 성공 시 요청 처리

## 주요 컴포넌트

### Guards
- `JwtAuthGuard`: Access Token 검증 (기본 가드)
- `JwtRefreshAuthGuard`: Refresh Token 검증
- `LocalAuthGuard`: 이메일/비밀번호 검증

### Strategies
- `LocalStrategy`: 이메일/비밀번호 기반 인증
- `JwtStrategy`: Access Token 검증
- `JwtRefreshStrategy`: Refresh Token 검증

### Services
- `AuthService`: 사용자 인증 및 토큰 관리
  - `validateUser`: 이메일/비밀번호 검증
  - `generateTokens`: Access/Refresh 토큰 생성
  - `validateUserRefreshToken`: Refresh Token 검증

### Decorators
- `@Public()`: 인증이 필요없는 라우트 표시
- `@CurrentUser()`: 인증된 사용자 정보 주입

## 보안 특징
1. HTTP-only 쿠키 사용으로 XSS 공격 방지
2. Refresh Token 해싱으로 토큰 탈취 위험 감소
3. Access Token의 짧은 만료 시간 (15분)으로 보안 강화
4. 환경 변수를 통한 보안 설정 관리
5. bcryptjs를 사용한 안전한 비밀번호 해싱

## 환경 변수
```env
JWT_SECRET_KEY=secret                    # Access Token 비밀키
JWT_REFRESH_SECRET_KEY=refresh_secret    # Refresh Token 비밀키
JWT_SECRET_EXPIRATION=900000             # Access Token 만료시간 (15분)
JWT_REFRESH_SECRET_EXPIRATION=604800000  # Refresh Token 만료시간 (7일)
```
