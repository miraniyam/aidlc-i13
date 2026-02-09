#!/bin/bash
# Backend 서버 실행 스크립트

echo "🚀 TableOrder Backend 서버 시작..."

# 1. .env 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. .env.example을 복사합니다..."
    cp .env.example .env
    echo "✅ .env 파일 생성 완료"
    echo "📝 DATABASE_URL을 수정해주세요!"
fi

# 2. 의존성 설치 확인
echo "📦 의존성 확인 중..."
python3 -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  의존성이 설치되지 않았습니다."
    echo "다음 명령어를 실행하세요:"
    echo "  pip3 install -r requirements.txt"
    exit 1
fi

# 3. 데이터베이스 연결 확인
echo "🗄️  데이터베이스 연결 확인..."

# 4. 서버 실행
echo "✅ 서버 시작 중..."
echo "📍 URL: http://localhost:8000"
echo "📚 API 문서: http://localhost:8000/docs"
echo ""
python3 -m src.main
