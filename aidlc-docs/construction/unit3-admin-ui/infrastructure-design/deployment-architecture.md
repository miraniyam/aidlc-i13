# Deployment Architecture - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 배포 아키텍처를 정의합니다. 로컬 개발 환경과 프로덕션 환경의 구성 요소, 네트워크 흐름, 보안 설정을 명시합니다.

---

## 1. Architecture Options

### Option A: AWS S3 + CloudFront (권장)

**Architecture Type**: Serverless Static Hosting

**Components**:
1. S3 Bucket (Origin)
2. CloudFront Distribution (CDN)
3. Route 53 (DNS, 선택적)
4. ACM (SSL/TLS Certificate)

**Benefits**:
- 글로벌 CDN (낮은 지연시간)
- 자동 스케일링
- 높은 가용성 (99.99%)
- 저렴한 비용
- 관리 부담 최소화

**Drawbacks**:
- AWS 종속성
- 초기 설정 복잡도

---

### Option B: Nginx (On-premise or EC2)

**Architecture Type**: Traditional Web Server

**Components**:
1. Nginx Web Server
2. EC2 Instance or On-premise Server
3. Let's Encrypt (SSL/TLS Certificate)

**Benefits**:
- 완전한 제어
- On-premise 가능
- AWS 종속성 없음

**Drawbacks**:
- 수동 스케일링
- 서버 관리 필요
- 가용성 낮음 (단일 서버)

---

## 2. Recommended Architecture (AWS S3 + CloudFront)

### 2.1 Architecture Diagram

```
                                Internet
                                   │
                                   │ HTTPS
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   Route 53 (DNS)     │
                        │  admin.tableorder.com│
                        └──────────┬───────────┘
                                   │
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  CloudFront (CDN)    │
                        │  - SSL/TLS (ACM)     │
                        │  - Global Cache      │
                        │  - Gzip Compression  │
                        └──────────┬───────────┘
                                   │
                                   │ OAI (Origin Access Identity)
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   S3 Bucket          │
                        │  - index.html        │
                        │  - assets/*.js       │
                        │  - assets/*.css      │
                        │  - assets/*.{png,svg}│
                        └──────────────────────┘


                        ┌──────────────────────┐
                        │  Admin Browser       │
                        │  - React SPA         │
                        │  - React Query       │
                        │  - SSE Connection    │
                        └──────────┬───────────┘
                                   │
                                   │ HTTPS (API)
                                   │ SSE (Events)
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  Backend API (Unit 1)│
                        │  - REST API          │
                        │  - SSE Endpoint      │
                        │  - Image Upload      │
                        └──────────────────────┘
```

---

### 2.2 Component Details

#### 2.2.1 S3 Bucket (Origin)

**Purpose**: 정적 파일 저장 및 제공

**Configuration**:
```json
{
  "BucketName": "tableorder-admin-ui",
  "Region": "ap-northeast-2",
  "StaticWebsiteHosting": {
    "Enabled": true,
    "IndexDocument": "index.html",
    "ErrorDocument": "index.html"
  },
  "PublicAccessBlock": {
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
  },
  "BucketPolicy": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowCloudFrontOAI",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <OAI-ID>"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::tableorder-admin-ui/*"
      }
    ]
  }
}
```

**Files**:
- `index.html`: Entry point
- `assets/*.js`: JavaScript bundles (~350KB gzipped)
- `assets/*.css`: CSS bundles (~50KB gzipped)
- `assets/*.{png,jpg,svg}`: Images (~61KB gzipped)

**Total Size**: ~461KB (gzipped)

---

#### 2.2.2 CloudFront Distribution (CDN)

**Purpose**: 글로벌 콘텐츠 전송 및 캐싱

**Configuration**:
```json
{
  "DistributionConfig": {
    "Origins": [
      {
        "Id": "S3-tableorder-admin-ui",
        "DomainName": "tableorder-admin-ui.s3.ap-northeast-2.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/<OAI-ID>"
        }
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-tableorder-admin-ui",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
      "CachedMethods": ["GET", "HEAD"],
      "Compress": true,
      "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
    },
    "PriceClass": "PriceClass_200",
    "ViewerCertificate": {
      "AcmCertificateArn": "arn:aws:acm:us-east-1:...",
      "SslSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "CustomErrorResponses": [
      {
        "ErrorCode": 404,
        "ResponseCode": 200,
        "ResponsePagePath": "/index.html"
      },
      {
        "ErrorCode": 403,
        "ResponseCode": 200,
        "ResponsePagePath": "/index.html"
      }
    ]
  }
}
```

**Cache Policy**: CachingOptimized
- TTL: 86400초 (24시간)
- Gzip/Brotli 압축 활성화
- Query string 무시

**Custom Error Responses**:
- 404 → 200 (SPA routing)
- 403 → 200 (SPA routing)

---

#### 2.2.3 Route 53 (DNS, 선택적)

**Purpose**: Custom Domain 연결

**Configuration**:
```json
{
  "HostedZone": "tableorder.com",
  "RecordSet": {
    "Name": "admin.tableorder.com",
    "Type": "A",
    "AliasTarget": {
      "HostedZoneId": "Z2FDTNDATAQYW2",
      "DNSName": "d1234567890.cloudfront.net",
      "EvaluateTargetHealth": false
    }
  }
}
```

**Note**: Custom Domain 없이 CloudFront URL 직접 사용 가능

---

#### 2.2.4 ACM (SSL/TLS Certificate)

**Purpose**: HTTPS 지원

**Configuration**:
```json
{
  "DomainName": "admin.tableorder.com",
  "ValidationMethod": "DNS",
  "Region": "us-east-1"
}
```

**Note**: CloudFront는 us-east-1 리전의 ACM 인증서만 사용 가능

---

### 2.3 Network Flow

#### 2.3.1 Static Asset Loading

```
1. User → Browser: https://admin.tableorder.com
2. Browser → Route 53: DNS query
3. Route 53 → Browser: CloudFront IP
4. Browser → CloudFront: GET /index.html
5. CloudFront → S3: GET /index.html (cache miss)
6. S3 → CloudFront: index.html
7. CloudFront → Browser: index.html (cached)
8. Browser → CloudFront: GET /assets/main.js
9. CloudFront → Browser: main.js (cached)
```

**Cache Hit Ratio**: ~90% (after initial load)

---

#### 2.3.2 API Communication

```
1. Browser → Backend API: GET /api/admin/dashboard
2. Backend API → Browser: Dashboard data (JSON)
3. Browser → Backend API: SSE connection (/api/admin/events)
4. Backend API → Browser: SSE events (real-time)
```

**CORS**: Backend에서 `admin.tableorder.com` 허용 필요

---

### 2.4 Security Configuration

#### 2.4.1 HTTPS Enforcement

**CloudFront**: `redirect-to-https`
- HTTP 요청 자동 HTTPS 리다이렉트

**Benefits**:
- 데이터 암호화
- JWT 토큰 보호
- 브라우저 보안 정책 준수

---

#### 2.4.2 Origin Access Identity (OAI)

**Purpose**: S3 Bucket 직접 접근 차단

**Configuration**:
- CloudFront만 S3 접근 가능
- Public URL 차단

**Benefits**:
- 보안 강화
- CloudFront를 통한 접근만 허용

---

#### 2.4.3 CSP (Content Security Policy)

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

### 2.5 Deployment Process

#### 2.5.1 Initial Setup

```bash
# 1. Create S3 Bucket
aws s3 mb s3://tableorder-admin-ui --region ap-northeast-2

# 2. Enable Static Website Hosting
aws s3 website s3://tableorder-admin-ui \
  --index-document index.html \
  --error-document index.html

# 3. Create CloudFront OAI
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  CallerReference=tableorder-admin-ui,Comment="OAI for Admin UI"

# 4. Update S3 Bucket Policy (with OAI ARN)
aws s3api put-bucket-policy \
  --bucket tableorder-admin-ui \
  --policy file://bucket-policy.json

# 5. Create CloudFront Distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json

# 6. Request ACM Certificate (us-east-1)
aws acm request-certificate \
  --domain-name admin.tableorder.com \
  --validation-method DNS \
  --region us-east-1

# 7. Create Route 53 Record (optional)
aws route53 change-resource-record-sets \
  --hosted-zone-id <ZONE-ID> \
  --change-batch file://route53-change.json
```

---

#### 2.5.2 Build and Deploy

```bash
# 1. Build production bundle
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://tableorder-admin-ui --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION-ID> \
  --paths "/*"
```

**Deployment Time**: ~2-3분 (캐시 무효화 포함)

---

#### 2.5.3 Rollback

```bash
# 1. Restore previous version from S3 versioning
aws s3api list-object-versions \
  --bucket tableorder-admin-ui \
  --prefix index.html

# 2. Copy previous version
aws s3api copy-object \
  --bucket tableorder-admin-ui \
  --copy-source tableorder-admin-ui/index.html?versionId=<VERSION-ID> \
  --key index.html

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION-ID> \
  --paths "/*"
```

---

### 2.6 Cost Estimation

#### Monthly Cost (Small Scale)

**Assumptions**:
- 10 admin users
- 100 requests/day/user
- 1,000 requests/day total
- 30,000 requests/month
- 461KB per page load
- 13.8GB data transfer/month

**Cost Breakdown**:
- **S3 Storage**: $0.023/GB × 0.5GB = $0.01
- **S3 Requests**: $0.0004/1,000 GET × 30 = $0.01
- **CloudFront Data Transfer**: $0.085/GB × 13.8GB = $1.17
- **CloudFront Requests**: $0.0075/10,000 × 3 = $0.002
- **Route 53 Hosted Zone**: $0.50/month (선택적)
- **ACM Certificate**: Free

**Total**: ~$1.70/month (Route 53 제외)

**Note**: 실제 비용은 트래픽에 따라 변동

---

## 3. Alternative Architecture (Nginx)

### 3.1 Architecture Diagram

```
                                Internet
                                   │
                                   │ HTTPS
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   Nginx Web Server   │
                        │  - SSL/TLS (Let's    │
                        │    Encrypt)          │
                        │  - Gzip Compression  │
                        │  - Static Files      │
                        └──────────┬───────────┘
                                   │
                                   │
                        ┌──────────▼───────────┐
                        │  /var/www/tableorder-│
                        │  admin-ui/           │
                        │  - index.html        │
                        │  - assets/*.js       │
                        │  - assets/*.css      │
                        └──────────────────────┘


                        ┌──────────────────────┐
                        │  Admin Browser       │
                        └──────────┬───────────┘
                                   │
                                   │ HTTPS (API)
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  Backend API (Unit 1)│
                        └──────────────────────┘
```

---

### 3.2 Nginx Configuration

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
    
    # SSL/TLS
    ssl_certificate /etc/letsencrypt/live/admin.tableorder.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.tableorder.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Root directory
    root /var/www/tableorder-admin-ui;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
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
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

### 3.3 Deployment Process

```bash
# 1. Install Nginx
sudo apt update
sudo apt install nginx

# 2. Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# 3. Create directory
sudo mkdir -p /var/www/tableorder-admin-ui

# 4. Build and upload
npm run build
scp -r dist/* user@server:/var/www/tableorder-admin-ui/

# 5. Configure Nginx
sudo nano /etc/nginx/sites-available/tableorder-admin-ui
sudo ln -s /etc/nginx/sites-available/tableorder-admin-ui /etc/nginx/sites-enabled/

# 6. Obtain SSL certificate
sudo certbot --nginx -d admin.tableorder.com

# 7. Reload Nginx
sudo systemctl reload nginx
```

---

### 3.4 Cost Estimation

**Monthly Cost**:
- **EC2 t3.micro**: ~$8/month (AWS)
- **On-premise**: 서버 비용만
- **Let's Encrypt**: Free

**Total**: ~$8/month (EC2) or $0 (On-premise)

---

## 4. Comparison

| Feature | AWS S3 + CloudFront | Nginx |
|---------|---------------------|-------|
| **Cost** | ~$1.70/month | ~$8/month (EC2) |
| **Scalability** | Auto-scaling | Manual |
| **Availability** | 99.99% | ~95% (단일 서버) |
| **Latency** | 낮음 (Global CDN) | 높음 (단일 위치) |
| **Management** | 최소 | 수동 관리 필요 |
| **Control** | 제한적 | 완전한 제어 |
| **Setup** | 복잡 | 간단 |

**Recommendation**: AWS S3 + CloudFront (프로덕션 환경)

---

## 5. Deployment Checklist

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

**Deployment architecture is complete and ready for implementation.**
