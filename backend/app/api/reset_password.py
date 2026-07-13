"""Password-reset landing page (GET /reset-password).

Supabase's recovery email redirects here with the access token in the URL
hash (#access_token=...&type=recovery). This page lets the user set a new
password by calling Supabase's user-update endpoint directly with that token.
SUPABASE_URL / SUPABASE_ANON_KEY are read from the environment (already set on
Render); the anon key is public by design, so it's safe to embed in the page.
"""
import os

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Saphin AI — Reset password</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
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
      padding: 36px 28px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    }
    .badge {
      width: 72px; height: 72px; margin: 0 auto 22px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 34px;
      background: linear-gradient(135deg, #7c5cff, #a97bff);
      box-shadow: 0 8px 30px rgba(124, 92, 255, 0.5);
    }
    h1 { font-size: 21px; font-weight: 700; text-align: center; margin-bottom: 8px; }
    .sub { font-size: 14px; color: #cabfe8; text-align: center; margin-bottom: 24px; line-height: 1.5; }
    label { display: block; font-size: 13px; color: #b3a7dd; margin-bottom: 6px; }
    input {
      width: 100%; padding: 14px; margin-bottom: 16px; font-size: 15px;
      color: #fff; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(150,120,255,0.3); border-radius: 12px; outline: none;
    }
    input:focus { border-color: #a97bff; }
    button {
      width: 100%; padding: 15px; font-size: 15px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #7c5cff, #a97bff);
      border: none; border-radius: 12px; cursor: pointer;
    }
    button:disabled { opacity: 0.6; cursor: default; }
    .msg { font-size: 14px; text-align: center; margin-top: 16px; line-height: 1.5; }
    .msg.error { color: #ff8a9b; }
    .msg.ok { color: #8affc0; }
    .brand { margin-top: 26px; text-align: center; font-size: 13px; color: #8a7ec0; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">&#128273;</div>
    <h1>Set a new password</h1>
    <p class="sub">Enter a new password for your Saphin AI account.</p>

    <div id="form">
      <label for="pw">New password</label>
      <input id="pw" type="password" autocomplete="new-password" placeholder="At least 6 characters" />
      <label for="pw2">Confirm password</label>
      <input id="pw2" type="password" autocomplete="new-password" placeholder="Re-enter password" />
      <button id="save">Update password</button>
    </div>

    <p id="msg" class="msg"></p>
    <div class="brand">Saphin AI</div>
  </div>

  <script>
    var SUPABASE_URL = "__SUPABASE_URL__";
    var SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";

    function getHashParams() {
      var h = window.location.hash.replace(/^#/, "");
      var out = {};
      h.split("&").forEach(function (pair) {
        if (!pair) return;
        var kv = pair.split("=");
        out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      });
      return out;
    }

    var params = getHashParams();
    var accessToken = params["access_token"];
    var msg = document.getElementById("msg");
    var form = document.getElementById("form");

    if (params["error_description"]) {
      form.classList.add("hidden");
      msg.className = "msg error";
      msg.textContent = decodeURIComponent(params["error_description"].replace(/\\+/g, " ")) +
        " — please request a new reset link from the app.";
    } else if (!accessToken) {
      form.classList.add("hidden");
      msg.className = "msg error";
      msg.textContent = "This link is invalid or has expired. Please request a new reset link from the Saphin AI app.";
    }

    document.getElementById("save").addEventListener("click", function () {
      var pw = document.getElementById("pw").value;
      var pw2 = document.getElementById("pw2").value;
      msg.className = "msg";
      msg.textContent = "";

      if (pw.length < 6) {
        msg.className = "msg error";
        msg.textContent = "Password must be at least 6 characters.";
        return;
      }
      if (pw !== pw2) {
        msg.className = "msg error";
        msg.textContent = "Passwords don't match.";
        return;
      }

      var btn = document.getElementById("save");
      btn.disabled = true;
      btn.textContent = "Updating...";

      fetch(SUPABASE_URL + "/auth/v1/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + accessToken
        },
        body: JSON.stringify({ password: pw })
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (r) {
          if (r.ok) {
            form.classList.add("hidden");
            msg.className = "msg ok";
            msg.textContent = "Password updated. Open the Saphin AI app and log in with your new password. You can close this tab.";
          } else {
            btn.disabled = false;
            btn.textContent = "Update password";
            msg.className = "msg error";
            msg.textContent = (r.data && (r.data.msg || r.data.error_description || r.data.message)) ||
              "Could not update password. The link may have expired — request a new one from the app.";
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = "Update password";
          msg.className = "msg error";
          msg.textContent = "Network error. Please try again.";
        });
    });
  </script>
</body>
</html>"""


@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password() -> HTMLResponse:
    html = (
        _PAGE
        .replace("__SUPABASE_URL__", os.getenv("SUPABASE_URL", ""))
        .replace("__SUPABASE_ANON_KEY__", os.getenv("SUPABASE_ANON_KEY", ""))
    )
    return HTMLResponse(content=html)