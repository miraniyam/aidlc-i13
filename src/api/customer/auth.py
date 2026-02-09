from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from src.core.database import get_db
from src.services.authentication_service import AuthenticationService

router = APIRouter(prefix="/api/customer/auth", tags=["customer-auth"])

class TableLoginRequest(BaseModel):
    table_number: str
    password: str
    store_id: str

@router.post("/login")
async def login(request: TableLoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthenticationService.authenticate_table(
        request.table_number, request.password, request.store_id, db
    )
