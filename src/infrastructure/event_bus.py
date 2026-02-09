import asyncio
from typing import Dict, List, Callable
from collections import defaultdict

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = defaultdict(list)
        self._queue: asyncio.Queue = asyncio.Queue()
    
    def subscribe(self, event_type: str, callback: Callable):
        self._subscribers[event_type].append(callback)
    
    async def publish(self, event_type: str, payload: dict):
        await self._queue.put({"event_type": event_type, "payload": payload})
        for callback in self._subscribers[event_type]:
            asyncio.create_task(callback(payload))

event_bus = EventBus()
