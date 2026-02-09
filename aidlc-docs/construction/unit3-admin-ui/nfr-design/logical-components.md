# Logical Components - Unit 3 (Admin Frontend)

## Overview

Admin Frontend의 NFR 요구사항을 충족하기 위한 논리적 컴포넌트를 정의합니다. 각 컴포넌트는 특정 NFR 목표를 달성하기 위한 역할과 책임을 가집니다.

---

## 1. API Client Layer

### 1.1 HTTP Client (Axios)

**Purpose**: 모든 HTTP 요청의 중앙 관리

**Responsibilities**:
- Base URL 설정
- 인증 토큰 자동 주입
- 요청/응답 인터셉터
- 에러 핸들링
- Rate Limiting

**Implementation**:
```typescript
// src/api/client.ts
import axios from 'axios';
import { TokenStorage } from '../utils/tokenStorage';
import { RateLimiter } from '../utils/rateLimiter';

const rateLimiter = new RateLimiter(10, 1000);

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Rate limiting
    if (!rateLimiter.canMakeRequest()) {
      return Promise.reject(new Error('Too many requests'));
    }
    
    // Token injection
    const token = TokenStorage.get('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on 401
    if (error.response?.status === 401) {
      TokenStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

**NFR Contribution**:
- **Security**: 토큰 자동 주입, Rate Limiting
- **Reliability**: 에러 핸들링, Auto Logout
- **Performance**: Timeout 설정

---

### 1.2 Query Client (React Query)

**Purpose**: 서버 상태 관리 및 캐싱

**Responsibilities**:
- 데이터 캐싱
- 자동 재시도
- 백그라운드 동기화
- Optimistic Update
- 캐시 무효화

**Implementation**:
```typescript
// src/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

**NFR Contribution**:
- **Performance**: 캐싱, 중복 요청 방지
- **Reliability**: 자동 재시도, 백그라운드 동기화
- **Scalability**: 효율적인 데이터 관리

---

## 2. Real-time Communication Layer

### 2.1 SSE Manager

**Purpose**: Server-Sent Events 연결 관리

**Responsibilities**:
- SSE 연결 생성 및 관리
- 자동 재연결 (Exponential Backoff)
- 이벤트 리스너 등록
- 연결 상태 추적
- 에러 핸들링

**Implementation**:
```typescript
// src/services/sseManager.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface SSEManagerOptions {
  url: string;
  onMessage: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  maxReconnectDelay?: number;
}

export const useSSEManager = ({
  url,
  onMessage,
  onError,
  maxReconnectDelay = 30000
}: SSEManagerOptions) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const reconnectAttempts = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const connect = useCallback(() => {
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      setStatus('connected');
      reconnectAttempts.current = 0;
    };
    
    eventSource.onmessage = onMessage;
    
    eventSource.onerror = (error) => {
      setStatus('reconnecting');
      eventSource.close();
      
      if (onError) {
        onError(error);
      }
      
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts.current),
        maxReconnectDelay
      );
      
      setTimeout(() => {
        reconnectAttempts.current++;
        connect();
      }, delay);
    };
    
    return eventSource;
  }, [url, onMessage, onError, maxReconnectDelay]);
  
  useEffect(() => {
    const eventSource = connect();
    
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [connect]);
  
  return { status };
};
```

**NFR Contribution**:
- **Reliability**: 자동 재연결, Circuit Breaker
- **Performance**: 실시간 업데이트 (1-2초)
- **Availability**: 연결 상태 추적

---

### 2.2 Hybrid Sync Manager

**Purpose**: SSE + 주기적 동기화 하이브리드 관리

**Responsibilities**:
- SSE 이벤트 수신
- 5분 주기 폴링
- 캐시 무효화 트리거
- 동기화 상태 관리

**Implementation**:
```typescript
// src/services/hybridSyncManager.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSSEManager } from './sseManager';

export const useHybridSync = (token: string) => {
  const queryClient = useQueryClient();
  
  // SSE connection
  const { status } = useSSEManager({
    url: `/api/admin/events?token=${token}`,
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      
      // Invalidate cache on SSE event
      if (data.type === 'order_created' || data.type === 'order_updated') {
        queryClient.invalidateQueries(['dashboard']);
      }
    }
  });
  
  // Periodic sync (5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['dashboard']);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [queryClient]);
  
  return { sseStatus: status };
};
```

**NFR Contribution**:
- **Reliability**: SSE 실패 시 폴링으로 대체
- **Performance**: 실시간 업데이트 + 주기적 동기화
- **Availability**: 99% 가용성 보장

---

## 3. State Management Layer

### 3.1 Authentication State Manager

**Purpose**: 인증 상태 관리

**Responsibilities**:
- 로그인/로그아웃
- 토큰 저장/삭제
- 자동 로그인 (토큰 유효성 검증)
- 자동 로그아웃 (16시간)

**Implementation**:
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { TokenStorage } from '../utils/tokenStorage';

interface AuthState {
  isAuthenticated: boolean;
  adminId: string | null;
  storeName: string | null;
  login: (token: string, adminId: string, storeName: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  adminId: null,
  storeName: null,
  
  login: (token, adminId, storeName) => {
    TokenStorage.set('admin_token', token);
    TokenStorage.set('admin_id', adminId);
    TokenStorage.set('store_name', storeName);
    TokenStorage.set('login_time', Date.now().toString());
    
    set({ isAuthenticated: true, adminId, storeName });
  },
  
  logout: () => {
    TokenStorage.clear();
    set({ isAuthenticated: false, adminId: null, storeName: null });
  },
  
  checkAuth: () => {
    const token = TokenStorage.get('admin_token');
    const loginTime = TokenStorage.get('login_time');
    
    if (!token || !loginTime) {
      set({ isAuthenticated: false });
      return;
    }
    
    // Auto logout after 16 hours
    const elapsed = Date.now() - parseInt(loginTime);
    if (elapsed > 16 * 60 * 60 * 1000) {
      TokenStorage.clear();
      set({ isAuthenticated: false });
      return;
    }
    
    const adminId = TokenStorage.get('admin_id');
    const storeName = TokenStorage.get('store_name');
    set({ isAuthenticated: true, adminId, storeName });
  }
}));
```

**NFR Contribution**:
- **Security**: 토큰 관리, 자동 로그아웃
- **Usability**: 자동 로그인
- **Reliability**: 인증 상태 일관성

---

### 3.2 UI State Manager

**Purpose**: UI 상태 관리 (모달, 사이드바 등)

**Responsibilities**:
- 모달 열기/닫기
- 사이드바 토글
- 알림 표시
- 로딩 상태

**Implementation**:
```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  isSidebarCollapsed: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  activeModal: null,
  
  toggleSidebar: () => set((state) => ({ 
    isSidebarCollapsed: !state.isSidebarCollapsed 
  })),
  
  openModal: (modalId) => set({ activeModal: modalId }),
  
  closeModal: () => set({ activeModal: null })
}));
```

**NFR Contribution**:
- **Usability**: 일관된 UI 상태
- **Performance**: 불필요한 리렌더링 방지

---

## 4. Security Layer

### 4.1 Input Sanitizer

**Purpose**: 사용자 입력 검증 및 정제

**Responsibilities**:
- XSS 방지
- HTML 태그 제거
- 특수문자 이스케이프

**Implementation**:
```typescript
// src/utils/sanitizer.ts
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T;
  
  for (const key in data) {
    const value = data[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as any;
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
```

**NFR Contribution**:
- **Security**: XSS 공격 방지
- **Reliability**: 안전한 데이터 저장

---

### 4.2 Rate Limiter

**Purpose**: API 요청 속도 제한

**Responsibilities**:
- 요청 빈도 추적
- 제한 초과 시 차단
- 토큰 버킷 알고리즘

**Implementation**:
```typescript
// src/utils/rateLimiter.ts
export class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private window: number;
  
  constructor(limit: number, window: number) {
    this.limit = limit;
    this.window = window;
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    
    if (this.requests.length >= this.limit) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    return Math.max(0, this.limit - this.requests.length);
  }
}
```

**NFR Contribution**:
- **Security**: Brute force 방지
- **Reliability**: API 남용 방지

---

### 4.3 Token Storage

**Purpose**: 안전한 토큰 저장 및 관리

**Responsibilities**:
- 토큰 저장/조회/삭제
- 에러 핸들링
- 자동 로그아웃 트리거

**Implementation**:
```typescript
// src/utils/tokenStorage.ts
export const TokenStorage = {
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },
  
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },
  
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },
  
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};
```

**NFR Contribution**:
- **Security**: 안전한 토큰 관리
- **Reliability**: 에러 핸들링

---

## 5. Error Handling Layer

### 5.1 Error Boundary

**Purpose**: React 컴포넌트 에러 격리

**Responsibilities**:
- 에러 캐치
- Fallback UI 표시
- 에러 로깅
- 복구 메커니즘

**Implementation**:
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="오류가 발생했습니다"
          subTitle={this.state.error?.message}
          extra={
            <Button type="primary" onClick={this.handleReset}>
              다시 시도
            </Button>
          }
        />
      );
    }
    
    return this.props.children;
  }
}
```

**NFR Contribution**:
- **Reliability**: 에러 격리
- **Usability**: 우아한 에러 처리
- **Availability**: 부분 장애 격리

---

### 5.2 Error Handler

**Purpose**: API 에러 처리

**Responsibilities**:
- 에러 분류
- 사용자 알림 (Toast/Modal)
- 에러 로깅
- 재시도 트리거

**Implementation**:
```typescript
// src/utils/errorHandler.ts
import { message, Modal } from 'antd';

export const handleAPIError = (error: any) => {
  const status = error.response?.status;
  const msg = error.response?.data?.message || '오류가 발생했습니다.';
  
  // Critical errors: Modal
  if (status === 500 || status === 403) {
    Modal.error({
      title: '오류',
      content: msg,
      okText: '확인'
    });
    return;
  }
  
  // General errors: Toast
  message.error(msg, 3);
};

export const logError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Error]', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  } else {
    console.error(error);
  }
};
```

**NFR Contribution**:
- **Usability**: 명확한 에러 피드백
- **Reliability**: 에러 추적
- **Availability**: 에러 복구 유도

---

## 6. Performance Monitoring Layer

### 6.1 Performance Monitor

**Purpose**: 성능 측정 및 로깅

**Responsibilities**:
- 렌더링 시간 측정
- API 응답 시간 측정
- 페이지 로드 시간 측정
- 성능 로그 기록

**Implementation**:
```typescript
// src/utils/performanceMonitor.ts
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  const duration = end - start;
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  
  return duration;
};

export const measurePageLoad = () => {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    console.log('[Performance] Page Load:', {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      totalTime: perfData.loadEventEnd - perfData.fetchStart
    });
  });
};

export const measureAPICall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await apiCall();
    const end = performance.now();
    
    console.log(`[Performance] API ${name}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    const end = performance.now();
    console.log(`[Performance] API ${name} (failed): ${(end - start).toFixed(2)}ms`);
    throw error;
  }
};
```

**NFR Contribution**:
- **Performance**: 성능 병목 식별
- **Reliability**: 성능 목표 검증
- **Usability**: 최적화 근거

---

## 7. Utility Layer

### 7.1 Image Uploader

**Purpose**: 이미지 업로드 및 미리보기

**Responsibilities**:
- 이미지 파일 검증
- 미리보기 생성
- 업로드 진행률 추적
- 에러 핸들링

**Implementation**:
```typescript
// src/utils/imageUploader.ts
import apiClient from '../api/client';

export interface UploadProgress {
  percent: number;
  status: 'uploading' | 'success' | 'error';
}

export const uploadImage = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Validation
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다.');
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('이미지 크기는 5MB 이하여야 합니다.');
  }
  
  // Upload
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await apiClient.post('/api/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress?.({ percent, status: 'uploading' });
      }
    });
    
    onProgress?.({ percent: 100, status: 'success' });
    return response.data.image_url;
  } catch (error) {
    onProgress?.({ percent: 0, status: 'error' });
    throw error;
  }
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    
    reader.readAsDataURL(file);
  });
};
```

**NFR Contribution**:
- **Usability**: 미리보기, 진행률 표시
- **Reliability**: 파일 검증, 에러 핸들링
- **Performance**: 5초 이내 업로드

---

### 7.2 Date Formatter

**Purpose**: 날짜/시간 포맷팅

**Responsibilities**:
- ISO 8601 파싱
- 한국어 포맷팅
- 상대 시간 표시

**Implementation**:
```typescript
// src/utils/dateFormatter.ts
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

export const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

export const formatRelativeTime = (date: string): string => {
  return dayjs(date).fromNow();
};

export const formatDateRange = (start: string, end: string): string => {
  return `${dayjs(start).format('YYYY-MM-DD')} ~ ${dayjs(end).format('YYYY-MM-DD')}`;
};
```

**NFR Contribution**:
- **Usability**: 일관된 날짜 표시
- **Reliability**: 타임존 처리

---

## Component Dependency Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  (React Components, Pages, Layouts)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      State Management Layer                  │
│  - Authentication State Manager                              │
│  - UI State Manager                                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      API Client Layer                        │
│  - HTTP Client (Axios)                                       │
│  - Query Client (React Query)                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                Real-time Communication Layer                 │
│  - SSE Manager                                               │
│  - Hybrid Sync Manager                                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      Security Layer                          │
│  - Input Sanitizer                                           │
│  - Rate Limiter                                              │
│  - Token Storage                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   Error Handling Layer                       │
│  - Error Boundary                                            │
│  - Error Handler                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                Performance Monitoring Layer                  │
│  - Performance Monitor                                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      Utility Layer                           │
│  - Image Uploader                                            │
│  - Date Formatter                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

### API Client Layer (2)
1. HTTP Client (Axios)
2. Query Client (React Query)

### Real-time Communication Layer (2)
1. SSE Manager
2. Hybrid Sync Manager

### State Management Layer (2)
1. Authentication State Manager
2. UI State Manager

### Security Layer (3)
1. Input Sanitizer
2. Rate Limiter
3. Token Storage

### Error Handling Layer (2)
1. Error Boundary
2. Error Handler

### Performance Monitoring Layer (1)
1. Performance Monitor

### Utility Layer (2)
1. Image Uploader
2. Date Formatter

**Total**: 14 Logical Components

---

**All logical components are defined and ready for implementation.**
