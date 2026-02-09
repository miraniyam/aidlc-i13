import asyncio
import json
from typing import AsyncGenerator
from src.infrastructure.event_bus import event_bus

class SSEPublisher:
    def __init__(self):
        self._clients: dict = {}
    
    async def stream(self, store_id: str) -> AsyncGenerator[str, None]:
        queue = asyncio.Queue()
        client_id = id(queue)
        self._clients[client_id] = {"store_id": store_id, "queue": queue}
        
        try:
            while True:
                event = await queue.get()
                yield f"data: {json.dumps(event)}\n\n"
        finally:
            del self._clients[client_id]
    
    async def broadcast(self, event: dict):
        store_id = event.get("store_id")
        for client in self._clients.values():
            if client["store_id"] == store_id:
                await client["queue"].put(event)

sse_publisher = SSEPublisher()

async def setup_sse():
    async def handle_event(payload: dict):
        await sse_publisher.broadcast(payload)
    
    event_bus.subscribe("OrderCreated", handle_event)
    event_bus.subscribe("OrderStatusChanged", handle_event)
