"""Friendly email-confirmation landing page (GET /confirmed)."""
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Saphin AI — Email confirmed</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #17102b;
      background: radial-gradient(circle at 50% 30%, #2a1a52 0%, #17102b 60%, #0f0a1f 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f3f0ff;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 380px;
      background: rgba(38, 26, 74, 0.6);
      border: 1px solid rgba(150, 120, 255, 0.25);
      border-radius: 24px;
      padding: 40px 28px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    }
    .badge {
      width: 84px;
      height: 84px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 44px;
      background: linear-gradient(135deg, #7c5cff, #a97bff);
      box-shadow: 0 8px 30px rgba(124, 92, 255, 0.5);
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    p { font-size: 15px; line-height: 1.55; color: #cabfe8; }
    .hint {
      margin-top: 24px;
      font-size: 13px;
      color: #9a8fc0;
      padding-top: 20px;
      border-top: 1px solid rgba(150, 120, 255, 0.15);
    }
    .brand { margin-top: 28px; font-size: 13px; letter-spacing: 0.5px; color: #8a7ec0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">&#10003;</div>
    <h1>Email confirmed</h1>
    <p>You're all set. Open the <strong>Saphin AI</strong> app and log in with your email and password.</p>
    <p class="hint">You can close this tab. The first message after a while may take ~50 seconds &mdash; that's normal.</p>
    <div class="brand">Saphin AI</div>
  </div>
</body>
</html>"""


@router.get("/confirmed", response_class=HTMLResponse)
async def confirmed() -> HTMLResponse:
    return HTMLResponse(content=_PAGE)