# RestNTravel Sleep Comparator

Academic full-stack IoT platform for comparing sleep outcomes between baseline pillows and the RestNTravel organic rice-grass pillow.

> **Research-use only disclaimer:** Sleep stage estimates are surrogate, rule-based approximations (HRV + motion + respiration proxies) and are **not clinical-grade**. Accuracy ceiling target disclosure: Cohen's κ 0.4–0.7 vs PSG.

## Repository layout

- `backend/` FastAPI + SQLAlchemy + Alembic + analysis services
- `frontend/` React + Vite + TypeScript + Recharts + Tailwind
- `firmware/esp32-node/` ESP32-S3 PlatformIO skeleton
- `docs/` SRS reference placeholder notes

## Local development

### 1) Start Postgres + backend

```bash
docker-compose up --build
```

Backend runs on `http://localhost:8000`.

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment variables

See `.env.example`:

- `DATABASE_URL`
- `DEVICE_API_KEY`
- `CORS_ORIGINS`

## DB migration (Alembic)

```bash
cd backend
alembic upgrade head
```

## Seed synthetic study data

```bash
cd backend
python scripts/seed_data.py
```

## Test ingest endpoint with curl

1) Create a participant:

```bash
curl -X POST http://localhost:8000/api/participants \
  -H "Content-Type: application/json" \
  -d '{
    "participant_id":"P001",
    "age":24,
    "gender":"F",
    "neck_pain_baseline_ndi":22.5,
    "consent_confirmed":true
  }'
```

2) Create a session:

```bash
curl -X POST http://localhost:8000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "participant_id":"P001",
    "phase":"baseline",
    "pillow_type":"standard_fiberfill",
    "start_time":"2026-08-12T22:00:00Z",
    "notes":"Night 1"
  }'
```

3) Ingest a reading (`X-Device-Key` must match your env setting):

```bash
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-Device-Key: dev-device-key" \
  -d '{
    "session_id":"<session-uuid>",
    "timestamp":"2026-08-12T22:05:00Z",
    "pressure_1":0.72,
    "pressure_2":0.68,
    "pressure_cervical_zone":0.63,
    "motion_x":0.04,
    "motion_y":0.06,
    "motion_z":0.05,
    "heart_rate":63,
    "spo2":97,
    "ambient_temperature":24.1,
    "ambient_humidity":53.0,
    "snore_event":false
  }'
```

## Tests

```bash
cd backend
pytest tests/test_sleep_services.py
```

## System Architecture (Data Flow)

```ascii
 [ ESP32-S3 Firmware ]
  |-- Sensors: MPU6050, FSRs, MAX30102, DHT22
  |-- Connects via Wi-Fi (retry logic, deduplication)
  |-- JSON payload over HTTP POST
        |
        v
 [ FastAPI Backend ]
  |-- Ingest Endpoint (Idempotent, Rate-limited)
  |-- Validates Device API Key
  |-- Stages data into Postgres
        |
        v
 [ PostgreSQL DB ] <-- [ Analysis Pipeline ]
  |-- Tables:          |-- HRV (RMSSD/SDNN)
      - Participants   |-- WASO / Sleep Efficiency
      - Sessions       |-- Rule-based Staging
      - Readings       |-- SQI re-weighting
      - Metrics
        |
        v
 [ React Frontend ]
  |-- Vite / Tailwind / Recharts
  |-- Endpoints: /analytics, /compare, /export
  |-- Defensible Dashboard (Objective + Subjective stats)
```

## How to Add a New Sensor Field

To add a new sensor for future experiments, follow these steps across the full stack:

1. **Database Schema (`backend/app/models/entities.py`)**:
   Add the new field to the `SensorReading` table model:
   ```python
   new_sensor_val: Mapped[float | None] = mapped_column(Float, nullable=True)
   ```

2. **Database Migration (Alembic)**:
   Generate and apply the migration script:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Add new_sensor_val"
   alembic upgrade head
   ```

3. **Pydantic Schema (`backend/app/schemas/common.py`)**:
   Update `SensorReadingCreate` to accept the new value:
   ```python
   new_sensor_val: float | None = Field(default=None, description="New sensor data")
   ```

4. **Ingest Endpoint (`backend/app/api/ingest.py`)**:
   Map the payload to the SQLAlchemy object in `ingest_reading()`:
   ```python
   new_sensor_val=payload.new_sensor_val
   ```

5. **Firmware (`firmware/esp32-node/...`)**:
   Include the field in the outgoing JSON POST payload:
   ```cpp
   doc["new_sensor_val"] = sensorRead();
   ```
