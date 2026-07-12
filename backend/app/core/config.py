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

    # App
    environment: str = "development"


settings = Settings()
