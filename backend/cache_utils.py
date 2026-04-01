"""
Cache utility for API responses
Implements in-memory caching with TTL (Time-To-Live)
"""

import time
import json
import inspect
from functools import wraps
from typing import Callable, Dict, Any, Optional

class CacheManager:
    """In-memory cache manager with TTL support"""

    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        if key not in self.cache:
            return None

        entry = self.cache[key]
        if time.time() > entry['expires_at']:
            # Cache expired, remove it
            del self.cache[key]
            return None

        return entry['value']

    def set(self, key: str, value: Any, ttl: int = 300):
        """
        Set value in cache with TTL in seconds
        Default: 300 seconds (5 minutes)
        """
        self.cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl
        }

    def clear(self, pattern: Optional[str] = None):
        """Clear cache, optionally by pattern"""
        if pattern is None:
            self.cache.clear()
        else:
            # Clear keys matching pattern
            keys_to_delete = [k for k in self.cache.keys() if pattern in k]
            for key in keys_to_delete:
                del self.cache[key]

    def get_stats(self) -> Dict[str, int]:
        """Get cache statistics"""
        return {
            'total_entries': len(self.cache),
            'expired_entries': sum(
                1 for v in self.cache.values()
                if time.time() > v['expires_at']
            )
        }


# Global cache instance
cache_manager = CacheManager()


def cache_response(ttl: int = 300):
    """
    Decorator to cache API responses

    Args:
        ttl: Time-to-live in seconds (default: 300 = 5 minutes)

    Usage:
        @app.get("/api/endpoint")
        @cache_response(ttl=600)  # Cache for 10 minutes
        async def get_data():
            return data
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Create cache key from function name and args
            cache_key = f"{func.__name__}"

            # Try to get from cache
            cached_value = cache_manager.get(cache_key)
            if cached_value is not None:
                return cached_value

            # Call function and cache result
            result = await func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl=ttl)
            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Create cache key from function name and args
            cache_key = f"{func.__name__}"

            # Try to get from cache
            cached_value = cache_manager.get(cache_key)
            if cached_value is not None:
                return cached_value

            # Call function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl=ttl)
            return result

        # Return appropriate wrapper based on function type
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


def invalidate_cache(pattern: str = ""):
    """Invalidate cache entries by pattern"""
    cache_manager.clear(pattern)
