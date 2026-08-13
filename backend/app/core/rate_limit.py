import time
from collections import defaultdict
from fastapi import HTTPException, Request, status

class RateLimiter:
    def __init__(self, requests: int, window: int):
        self.requests = requests
        self.window = window
        self.clients = defaultdict(list)

    def __call__(self, request: Request):
        # Use client IP or X-Device-Key as identifier
        device_key = request.headers.get("x-device-key", request.client.host if request.client else "unknown")
        now = time.time()
        
        # Clean up old timestamps
        self.clients[device_key] = [ts for ts in self.clients[device_key] if now - ts < self.window]
        
        if len(self.clients[device_key]) >= self.requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too Many Requests"
            )
            
        self.clients[device_key].append(now)

# Basic rate limiting: e.g., 5 requests per second per device
limiter = RateLimiter(requests=10, window=1)
