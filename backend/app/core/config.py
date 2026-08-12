from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = Field(
        default="sqlite+pysqlite:///:memory:",
        alias="DATABASE_URL",
    )
    device_api_key: str = Field(default="dev-device-key", alias="DEVICE_API_KEY")
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"], alias="CORS_ORIGINS")

    motion_window_size: int = 5
    sleep_motion_std_threshold: float = 0.08
    sleep_hr_std_threshold: float = 3.5
    wake_pressure_threshold: float = 0.15
    waso_motion_threshold: float = 0.35
    waso_hr_spike_bpm: float = 8.0

    sqi_weight_efficiency: float = 0.45
    sqi_weight_movement: float = 0.20
    sqi_weight_stability: float = 0.25
    sqi_weight_snore: float = 0.10


settings = Settings()
