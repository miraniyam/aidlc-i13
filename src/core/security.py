import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.config import settings

security = HTTPBearer()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_jwt_token(payload: dict) -> str:
    exp = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    payload["exp"] = exp
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="TOKEN_EXPIRED")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return decode_jwt_token(credentials.credentials)

def require_role(required_role: str):
    async def role_checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN")
        return user
    return role_checker
