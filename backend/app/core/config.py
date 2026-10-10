"""Centralized configuration. All environment variables are read here once."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Database (Supabase Postgres, async driver)
    database_url: str

    # AI providers
    groq_api_key: str
    anthropic_api_key: str = ""
    gemini_api_key: str = ""

    # AI MODEL NAMES - the single source of truth.
    #
    # Groq retires model names server-side with no warning: in Session 22
    # llama-3.3-70b-versatile vanished and every AI feature returned 404 until
    # the name was changed in five separate files. These are settings rather
    # than constants so the next time it happens you can set the new name in
    # Render -> Environment and restart. No code change, no git push, no
    # waiting for a deploy while chat is down.
    #
    # Env var names are the uppercase form: GROQ_MODEL, GROQ_VISION_MODEL,
    # GROQ_TRANSCRIBE_MODEL. Leave them unset to use the defaults below.
    #
    # Pick a replacement carefully: a reasoning model that emits <think> blocks
    # breaks the chat reply path (bugs #91/#92). Test before adopting.
    groq_model: str = "openai/gpt-oss-120b"
    # Session 23: qwen/qwen3.6-27b was retired by Groq (404 model_not_found),
    # which silently broke image reading - vision_reader swallows the error and
    # returns None, so the companion simply acted as if no image was sent.
    # qwen3.8-27b verified to accept images via the 16.1 probe (it reported
    # "Image must have at least 32 pixels in each dimension", which only a model
    # that decoded the image can say). Note: the threshold is 32px now, not 2px.
    groq_vision_model: str = "qwen/qwen3.8-27b"
    groq_transcribe_model: str = "whisper-large-v3-turbo"

    # App
    environment: str = "development"

    # Phase 4: shared secret for the cron-triggered check-in endpoint
    cron_secret: str = ""


settings = Settings()
