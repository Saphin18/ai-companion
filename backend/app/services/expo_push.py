import httpx

EXPO_URL = "https://exp.host/--/api/v2/push/send"


async def send_push(token, title, body, data=None):
    """Best-effort push via Expo. Returns True on success, never raises."""
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(EXPO_URL, json={
                "to": token,
                "title": title,
                "body": body,
                "data": data or {},
                "sound": "default",
                "channelId": "default",
            })
            return r.status_code == 200
    except Exception:
        return False
