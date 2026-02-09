# Infrastructure Design - Unit 3 (Admin Frontend)

## Overview

Admin Frontend는 React 기반 SPA(Single Page Application)로, 정적 파일 호스팅 인프라가 필요합니다. 로컬 개발 환경과 프로덕션 배포 환경을 정의합니다.

---

## 1. Deployment Environment

### 1.1 Local Development

**Environment**: Developer Workstation

**Infrastructure**:
- **Runtime**: Node.js 18+ (LTS)
- **Package Manager**: npm 또는 yarn
- **Dev Server**: Vite Dev Server (HMR 지원)
- **Port**: 5173 (Vite 기본)

**Setup**:
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Access
http://localhost:5173
```

**Benefits**:
- Hot Module Replacement (HMR)
- 빠른 빌드 속도
- 개발자 친화적

---

### 1.2 Production Deployment

**Option A: AWS S3 + CloudFront (권장)**

**Infrastructure Components**:
1. **S3 Bucket**: 정적 파일 저장
   - Bucket Name: `tableorder-admin-ui`
   - Static Website Hosting 활성화
   - Public Read 권한 (CloudFront를 통해서만 접근)

2. **CloudFront Distribution**: CDN
   - Origin: S3 Bucket
   - HTTPS 필수 (SSL/TLS 인증서)
   - Cache Policy: CachingOptimized
   - Origin Access Identity (OAI) 사용

3. **Route 53** (선택적): DNS 관리
   - Custom Domain 연결 (예: admin.tableorder.com)

**Deployment Flow**:
```bash
# Build production bundle
npm run build

# Upload to S3
aws s3 sync dist/ s3://tableorder-admin-ui --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

**Benefits**:
- 글로벌 CDN (낮은 지연시간)
- HTTPS 기본 지원
- 높은 가용성 (99.99%)
- 저렴한 비용

**Estimated Cost**:
- S3: ~$0.023/GB/month (저장)
- CloudFront: ~$0.085/GB (전송, 첫 10TB)
- 예상 월 비용: $5-10 (소규모 트래픽 기준)

---

**Option B: Nginx (On-premise or EC2)**

**Infrastructure Components**:
1. **Web Server**: Nginx
   - Static file serving
   - Gzip compression
   - Cache headers

2. **Server**: EC2 or On-premise
   - OS: Ubuntu 22.04 LTS
   - Instance Type: t3.micro (AWS) 또는 최소 사양 서버
   - Port: 80 (HTTP), 443 (HTTPS)

3. **SSL/TLS**: Let's Encrypt (무료)

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name admin.tableorder.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.tableorder.com;
    
    ssl_certificate /etc/letsencrypt/live/admin.tableorder.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.tableorder.com/privkey.pem;
    
    root /var/www/tableorder-admin-ui;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Deployment Flow**:
```bash
# Build production bundle
npm run build

# Upload to server
scp -r dist/* user@server:/var/www/tableorder-admin-ui/

# Reload Nginx
ssh user@server "sudo systemctl reload nginx"
```

**Benefits**:
- 완전한 제어
- On-premise 가능
- 추가 비용 없음 (서버 제외)

**Estimated Cost**:
- EC2 t3.micro: ~$8/month (AWS)
- On-premise: 서버 비용만

---

## 2. Build Infrastructure

### 2.1 Build Tool

**Tool**: Vite

**Configuration**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Production에서는 비활성화
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Backend API
        changeOrigin: true
      }
    }
  }
});
```

**Build Output**:
- `dist/index.html`: Entry point
- `dist/assets/*.js`: JavaScript bundles
- `dist/assets/*.css`: CSS bundles
- `dist/assets/*.{png,jpg,svg}`: Images

**Bundle Size Target**: ~461KB (gzipped)

---

### 2.2 Environment Variables

**Tool**: Vite Environment Variables

**Configuration**:
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_SSE_URL=http://localhost:8000/api/admin/events

# .env.production
VITE_API_BASE_URL=https://api.tableorder.com
VITE_SSE_URL=https://api.tableorder.com/api/admin/events
```

**Usage**:
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const sseUrl = import.meta.env.VITE_SSE_URL;
```

---

## 3. Backend Integration

### 3.1 API Gateway

**Service**: Backend API (Unit 1)

**Endpoint**: `https://api.tableorder.com` (프로덕션)

**CORS Configuration** (Backend 설정 필요):
```python
# Backend CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local dev
    "https://admin.tableorder.com"  # Production
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["Authorization", "Content-Type"]
```

**API Routes**:
- `/api/admin/login`: 로그인
- `/api/admin/dashboard`: 대시보드 데이터
- `/api/admin/orders`: 주문 관리
- `/api/admin/tables`: 테이블 관리
- `/api/admin/menus`: 메뉴 관리
- `/api/admin/categories`: 카테고리 관리
- `/api/admin/events`: SSE 이벤트

---

### 3.2 SSE Connection

**Service**: Backend SSE Endpoint

**Endpoint**: `https://api.tableorder.com/api/admin/events`

**Connection**:
```typescript
const eventSource = new EventSource(
  `${import.meta.env.VITE_SSE_URL}?token=${token}`
);
```

**Network Requirements**:
- Keep-alive connection
- HTTP/1.1 or HTTP/2
- No proxy timeout (또는 충분히 긴 timeout)

---

## 4. Monitoring & Logging

### 4.1 Browser Console Logging

**Tool**: Browser DevTools Console

**Implementation**:
```typescript
// Production error logging
if (process.env.NODE_ENV === 'production') {
  console.error('[Error]', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}
```

**Log Levels**:
- `console.error()`: 에러
- `console.warn()`: 경고
- `console.log()`: 정보 (개발 환경만)

---

### 4.2 Performance Monitoring

**Tool**: Browser Performance API

**Implementation**:
```typescript
// Page load performance
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('[Performance]', perfData);
});
```

**Metrics**:
- Page Load Time
- API Response Time
- Render Time

---

### 4.3 External Monitoring (선택적)

**Options**:
- **Google Analytics**: 사용자 행동 추적
- **Sentry**: 에러 추적 (유료)
- **LogRocket**: 세션 리플레이 (유료)

**Note**: 현재는 Browser Console만 사용 (Basic 모니터링)

---

## 5. Security Infrastructure

### 5.1 HTTPS

**Requirement**: 필수

**Implementation**:
- **AWS CloudFront**: ACM (AWS Certificate Manager) 인증서
- **Nginx**: Let's Encrypt 인증서

**Benefits**:
- 데이터 암호화
- JWT 토큰 보호
- 브라우저 보안 정책 준수

---

### 5.2 CSP (Content Security Policy)

**Implementation**: Backend 응답 헤더 (권장)

**Headers**:
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' https://api.tableorder.com;
```

**Note**: Backend 팀과 협의 필요

---

### 5.3 Rate Limiting

**Implementation**: 
- **Client-side**: Token Bucket (10 req/sec)
- **Backend**: API Gateway Rate Limiting (권장)

---

## 6. Shared Infrastructure

### 6.1 Backend API (Unit 1)

**Shared Service**: Backend API

**Dependency**: Unit 3 → Unit 1

**Integration Points**:
- REST API endpoints
- SSE events
- Image upload

**CORS Configuration**: Backend 설정 필요

---

### 6.2 Image Storage

**Service**: Backend Image Storage (S3 or Local)

**Dependency**: Unit 3 → Unit 1

**Integration**:
- Upload: `POST /api/admin/upload`
- Access: `image_url` from API response

---

## 7. Deployment Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    CloudFront (CDN)                          │
│  - SSL/TLS Termination                                       │
│  - Global Edge Locations                                     │
│  - Cache Static Assets                                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    S3 Bucket (Origin)                        │
│  - Static Files (HTML, JS, CSS, Images)                     │
│  - Origin Access Identity (OAI)                              │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    Admin Browser                             │
│  - React SPA                                                 │
│  - React Query (Caching)                                     │
│  - SSE Connection                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS (API Calls)
                            │ SSE (Real-time Events)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend API (Unit 1)                      │
│  - REST API Endpoints                                        │
│  - SSE Event Stream                                          │
│  - Image Upload                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Infrastructure Summary

### Compute
- **Local Dev**: Vite Dev Server (Node.js)
- **Production**: S3 + CloudFront (정적 호스팅) 또는 Nginx

### Storage
- **Static Files**: S3 Bucket 또는 Nginx 서버
- **Images**: Backend Storage (Unit 1)

### Networking
- **CDN**: CloudFront (AWS) 또는 없음 (Nginx)
- **SSL/TLS**: ACM (AWS) 또는 Let's Encrypt
- **CORS**: Backend 설정

### Monitoring
- **Logging**: Browser Console
- **Performance**: Performance API
- **External**: 없음 (Basic)

### Security
- **HTTPS**: 필수
- **CSP**: Backend 헤더 (권장)
- **Rate Limiting**: Client-side + Backend

---

## 9. Deployment Checklist

### Pre-deployment
- [ ] Environment variables 설정 (`.env.production`)
- [ ] Backend API URL 확인
- [ ] CORS 설정 확인 (Backend)
- [ ] SSL/TLS 인증서 준비

### Build
- [ ] `npm run build` 실행
- [ ] Bundle size 확인 (~461KB gzipped)
- [ ] Source maps 비활성화 확인

### Deployment (S3 + CloudFront)
- [ ] S3 Bucket 생성
- [ ] Static Website Hosting 활성화
- [ ] CloudFront Distribution 생성
- [ ] OAI 설정
- [ ] SSL/TLS 인증서 연결
- [ ] 파일 업로드 (`aws s3 sync`)
- [ ] CloudFront 캐시 무효화

### Deployment (Nginx)
- [ ] Nginx 설치 및 설정
- [ ] Let's Encrypt 인증서 발급
- [ ] 파일 업로드 (SCP)
- [ ] Nginx 재시작

### Post-deployment
- [ ] HTTPS 접속 확인
- [ ] API 연결 확인
- [ ] SSE 연결 확인
- [ ] 브라우저 Console 에러 확인
- [ ] Performance 측정

---

**Infrastructure design is complete and ready for deployment.**
