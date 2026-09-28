import asyncio
from server import _backfill_slugs
import os

os.environ['USE_MOCK_MONGO'] = '1'

async def test():
    await _backfill_slugs()

asyncio.run(test())
