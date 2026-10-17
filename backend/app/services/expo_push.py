import httpx

EXPO_URL = "https://exp.host/--/api/v2/push/send"

# Return values from send_push. Deliberately strings rather than a bool:
# "the HTTP call worked" and "the notification was delivered" are different
# questions, and conflating them is what caused bug #102.
SENT = "sent"
UNREGISTERED = "unregistered"   # the device uninstalled / token is dead
FAILED = "failed"               # transient or unknown - keep the token


async def send_push(token, title, body, data=None):
    """Best-effort push via Expo. Never raises.

    Returns SENT, UNREGISTERED or FAILED.

    Bug #102: this used to return `r.status_code == 200`, which is almost
    always True even when nothing is delivered. Expo accepts the REQUEST with
    200 and reports per-notification failures inside the body:

        {"data": [{"status": "error",
                   "message": "...is not a registered push credential",
                   "details": {"error": "DeviceNotRegistered"}}]}

    Nothing read that body, so tokens for uninstalled apps were retried
    forever and never cleaned up. UNREGISTERED tells the caller to delete the
    token; FAILED means try again another day.
    """
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
    except Exception:
        return FAILED

    if r.status_code != 200:
        return FAILED

    # A malformed body is not worth throwing away a token over.
    try:
        payload = r.json()
    except Exception:
        return FAILED

    # Expo returns a single object for one token and a list for many; accept
    # either so this keeps working if the caller is ever batched.
    tickets = payload.get("data")
    if isinstance(tickets, dict):
        tickets = [tickets]
    if not isinstance(tickets, list):
        return FAILED

    for ticket in tickets:
        if not isinstance(ticket, dict):
            continue
        if ticket.get("status") == "error":
            details = ticket.get("details") or {}
            if details.get("error") == "DeviceNotRegistered":
                return UNREGISTERED
            return FAILED

    return SENT
