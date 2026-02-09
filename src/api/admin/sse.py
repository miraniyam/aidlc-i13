from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from src.core.security import require_role
from src.infrastructure.sse_publisher import sse_publisher

router = APIRouter(prefix="/api/admin/sse", tags=["admin-sse"])

@router.get("")
async def sse_stream(user: dict = Depends(require_role("store_admin"))):
    return StreamingResponse(
        sse_publisher.stream(user["store_id"]),
        media_type="text/event-stream"
    )
