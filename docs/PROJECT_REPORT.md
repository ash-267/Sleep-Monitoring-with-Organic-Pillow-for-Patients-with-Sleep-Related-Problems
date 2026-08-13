# RestNTravel Sleep Comparator — Full Project Report

> \*\*Prepared for:\*\* Faculty Panel Defense \& Company Review  
> \*\*Project Type:\*\* Academic Research Platform (IoT + Full-Stack)  
> \*\*Date:\*\* August 2026  
> \*\*Team Size:\*\* 3 members  

\---

## 1\. PROJECT OVERVIEW

**RestNTravel Sleep Comparator** is a full-stack IoT research platform that compares sleep quality outcomes between a standard fiberfill pillow (baseline) and a RestNTravel organic rice-grass pillow (intervention). It collects real-time sensor data from an ESP32-S3 embedded in/near the pillow, processes it through a FastAPI backend with PostgreSQL, and visualizes the results on a React dashboard.

**Research Goal:** Determine whether the organic pillow improves objective sleep metrics (sleep efficiency, HRV, movement reduction) and subjective outcomes (VAS neck pain, NDI disability scores) compared to a standard pillow, specifically evaluating cervical ergonomics.

**Key Limitation (disclosed throughout the system):** Sleep stage estimates are derived from surrogate sensors (PPG heart rate, IMU motion, FSR pressure) — NOT clinical-grade polysomnography. The accuracy ceiling is Cohen's κ 0.4–0.7 vs PSG. This disclaimer appears in API responses, dashboard UI, and exported data.

\---

## 2\. SYSTEM ARCHITECTURE

```
 ┌─────────────────────────────────────┐
 │       ESP32-S3 Firmware Node        │
 │  Sensors: MPU6050 (IMU), FSRs,     │
 │           MAX30102 (PPG/SpO2)       │
 │  Connectivity: Wi-Fi HTTP POST     │
 │  Retry: Exponential backoff        │
 └──────────────┬──────────────────────┘
                │ JSON over HTTP
                │ Header: X-Device-Key
                ▼
 ┌─────────────────────────────────────┐
 │        FastAPI Backend (Python)     │
 │  • Idempotent ingestion endpoint   │
 │  • Rate-limited (10 req/s/device)  │
 │  • Static API key authentication   │
 │  • Auto-creates DB tables on boot  │
 └──────────────┬──────────────────────┘
                │ SQLAlchemy ORM
                ▼
 ┌─────────────────────────────────────┐
 │       PostgreSQL 16 Database       │
 │  Tables: participants, sessions,   │
 │   sensor\_readings, derived\_metrics,│
 │   outcome\_measures                 │
 │  Managed via: Alembic migrations   │
 └──────────────┬──────────────────────┘
                │ Analytics Pipeline
                │ (triggered on session end)
                ▼
 ┌─────────────────────────────────────┐
 │      Analysis Services (Python)    │
 │  • Sleep onset/wake detection      │
 │  • WASO computation                │
 │  • HRV features (RMSSD, SDNN)     │
 │  • Rule-based sleep staging        │
 │  • SQI scoring (re-weighted)       │
 │  • Paired statistical tests        │
 └──────────────┬──────────────────────┘
                │ REST API
                ▼
 ┌─────────────────────────────────────┐
 │    React Frontend (Vite + TS)      │
 │  • Cohort dashboard                │
 │  • Side-by-side session comparison │
 │  • Participant baseline vs interv. │
 │  • Research CSV export             │
 │  • Accuracy disclaimer banner      │
 └─────────────────────────────────────┘
```

\---

## 3\. REPOSITORY STRUCTURE — FILE-BY-FILE REFERENCE

### 3.1 Root Configuration Files

|File|Purpose|
|-|-|
|`docker-compose.yml`|Orchestrates PostgreSQL 16 + FastAPI backend. DB has a healthcheck (`pg\_isready`) so backend only starts after DB is accepting connections. Backend has `restart: on-failure`.|
|`.env.example`|Environment variables: `DATABASE\_URL` (postgresql+psycopg dialect for psycopg v3), `DEVICE\_API\_KEY`, `CORS\_ORIGINS`.|
|`README.md`|Setup instructions, architecture diagram, "how to add a new sensor field" walkthrough.|
|`CONTRIBUTING.md`|Team ownership split: Hardware/Firmware, Algorithm/Backend, Dashboard/Frontend.|
|`.gitignore`|Standard Python + Node ignores.|

\---

### 3.2 Backend — `/backend/`

#### 3.2.1 Infrastructure

|File|Purpose|Key Details|
|-|-|-|
|`Dockerfile`|Python 3.11-slim container. Installs deps, copies code, runs `uvicorn app.main:app --host 0.0.0.0 --port 8000`.||
|`requirements.txt`|Dependencies: `fastapi==0.116.1`, `uvicorn`, `sqlalchemy==2.0.43`, `psycopg\[binary]==3.2.9`, `alembic==1.16.4`, `pydantic==2.11.7`, `pydantic-settings==2.10.1`, `numpy==2.3.2`, `scipy==1.16.1`, `pandas==2.3.1`, `pytest==8.4.1`, `httpx==0.28.1`.||
|`alembic.ini`|Alembic config pointing to `postgresql+psycopg://postgres:postgres@db:5432/restntravel`.||
|`alembic/env.py`|Alembic migration environment. Adds project root to `sys.path` for Docker compatibility. Imports `Base` metadata from the ORM.||
|`alembic/versions/0001\_initial\_schema.py`|Initial migration creating all 5 tables + 3 enum types. Creates tables for participants, sessions, sensor\_readings, derived\_metrics, outcome\_measures.||

#### 3.2.2 Application Entry Point

**`app/main.py`** — FastAPI application factory.

```
What it does:
1. Creates FastAPI app titled "RestNTravel Sleep Comparator"
2. Adds CORS middleware (origins from config)
3. Registers 6 routers: health, ingest, sessions, participants, export, analytics
4. On startup: calls Base.metadata.create\_all() to auto-create tables
   (wrapped in try/except so container doesn't crash if DB is briefly unavailable)
```

#### 3.2.3 Core Configuration

**`app/core/config.py`** — Single source of truth for ALL configurable thresholds.

|Setting|Default|Purpose|
|-|-|-|
|`database\_url`|`sqlite+pysqlite:///:memory:`|DB connection (overridden by env)|
|`device\_api\_key`|`dev-device-key`|Static API key for ESP32 auth|
|`cors\_origins`|`\["http://localhost:5173"]`|Allowed frontend origins|
|`motion\_window\_size`|`5`|Number of readings in the sliding window for onset detection|
|`sleep\_motion\_std\_threshold`|`0.08`|Max motion std-dev to classify as "asleep" (g-force units from MPU6050)|
|`sleep\_hr\_std\_threshold`|`3.5`|Max HR std-dev within window to confirm sleep onset (BPM)|
|`wake\_pressure\_threshold`|`0.15`|Below this average pressure = person left the pillow (wake detection)|
|`waso\_motion\_threshold`|`0.35`|Motion magnitude that flags an awakening epoch (g-force)|
|`waso\_hr\_spike\_bpm`|`8.0`|HR must exceed baseline by this many BPM to confirm WASO epoch|
|`sqi\_weight\_efficiency`|`0.55`|SQI weighting for sleep efficiency component|
|`sqi\_weight\_movement`|`0.20`|SQI weighting for movement component|
|`sqi\_weight\_stability`|`0.25`|SQI weighting for HR stability component|
|`stage\_deep\_motion\_max`|`0.1`|Motion below this = candidate for deep sleep|
|`stage\_deep\_hr\_max`|`62.0`|HR below this = candidate for deep sleep|
|`stage\_rem\_motion\_max`|`0.2`|Motion below this = candidate for REM|
|`stage\_rem\_hr\_min`|`62.0`|HR above this + below max = candidate for REM|
|`stage\_rem\_hr\_max`|`78.0`|HR below this = candidate for REM|

> \*\*Design decision:\*\* All thresholds live here — not scattered as magic numbers. This makes them defensible: a panel reviewer can ask "why 0.08?" and you point to one file.

**`app/core/rate\_limit.py`** — In-memory rate limiter for the ingest endpoint.

```
Implementation: Sliding-window counter per device key.
Default: 10 requests per 1-second window per device.
Purpose: Prevents accidental flooding from ESP32 retry loops.
Limitation: In-memory only — resets on container restart. Acceptable for academic prototype.
```

#### 3.2.4 Database Layer

**`app/db/base.py`** — SQLAlchemy declarative base class. All models inherit from `Base`.

**`app/db/session.py`** — Creates the SQLAlchemy engine from `settings.database\_url` and provides a `get\_db()` dependency that yields database sessions with proper cleanup.

#### 3.2.5 ORM Models — `app/models/entities.py`

Five tables, three enums:

**Enums:**

* `PhaseEnum`: `baseline` | `intervention`
* `PillowTypeEnum`: `standard\_fiberfill` | `cervical\_contour` | `restntravel\_organic`
* `OutcomeMeasureTypeEnum`: `VAS` | `NDI`

**Table: `participants`**

|Column|Type|Notes|
|-|-|-|
|`participant\_id`|String(64) PK|e.g. "P001"|
|`age`|Integer|Required|
|`gender`|String(32)|Required|
|`neck\_pain\_baseline\_ndi`|Float|Nullable — pre-study NDI score|
|`consent\_confirmed`|Boolean|Must be True|
|`created\_at`|DateTime(tz)|Auto-set|

**Table: `sessions`**

|Column|Type|Notes|
|-|-|-|
|`session\_id`|UUID PK|Auto-generated|
|`participant\_id`|FK → participants|Cascade delete|
|`phase`|PhaseEnum|baseline or intervention|
|`pillow\_type`|PillowTypeEnum|Which pillow was used|
|`start\_time`|DateTime(tz)|When session started|
|`end\_time`|DateTime(tz)|Nullable — set when session ends|
|`notes`|Text|Optional researcher notes|

**Table: `sensor\_readings`**

|Column|Type|Notes|
|-|-|-|
|`id`|Integer PK|Auto-increment|
|`session\_id`|FK → sessions|Cascade delete|
|`timestamp`|DateTime(tz)|UTC-normalized|
|`pressure\_1`|Float|FSR 1 (general head zone)|
|`pressure\_2`|Float|FSR 2 (general head zone)|
|`pressure\_cervical\_zone`|Float|Nullable — FSR in cervical sub-region (**key differentiator**)|
|`motion\_x`|Float|MPU6050 accelerometer X axis|
|`motion\_y`|Float|MPU6050 accelerometer Y axis|
|`motion\_z`|Float|MPU6050 accelerometer Z axis|
|`heart\_rate`|Float|Nullable — MAX30102 PPG-derived BPM|
|`spo2`|Float|Nullable — MAX30102 SpO2 %|

> \*\*Removed sensors:\*\* `ambient\_temperature`, `ambient\_humidity` (DHT22), and `snore\_event` (MEMS mic) were removed post-SRS after team decided to focus on core metrics only (pressure, motion, heart rate).

**Table: `derived\_metrics`**

|Column|Type|Notes|
|-|-|-|
|`session\_id`|UUID PK (FK)|One-to-one with session|
|`sleep\_onset\_time`|DateTime|Detected sleep start|
|`wake\_time`|DateTime|Detected wake|
|`total\_sleep\_time`|Float|Minutes (onset→wake minus WASO)|
|`waso`|Float|Wake After Sleep Onset (minutes)|
|`sleep\_efficiency`|Float|TST / TIB × 100 (%)|
|`movement\_event\_count`|Integer|Number of high-motion readings|
|`sqi\_score`|Float|0–100 composite Sleep Quality Index|
|`rmssd`|Float|HRV: Root Mean Square of Successive Differences|
|`sdnn`|Float|HRV: Standard Deviation of NN intervals|
|`lf\_hf\_ratio`|Float|HRV: Low-Frequency / High-Frequency ratio|
|`estimated\_stage\_summary`|JSON|`{light\_minutes, deep\_minutes, rem\_proxy\_minutes, confidence, disclaimer}`|

**Table: `outcome\_measures`**

|Column|Type|Notes|
|-|-|-|
|`id`|Integer PK|Auto-increment|
|`session\_id`|UUID FK|Nullable|
|`participant\_id`|String FK|Nullable|
|`measure\_type`|OutcomeMeasureTypeEnum|VAS or NDI|
|`score`|Float|Subjective score value|
|`recorded\_at`|DateTime(tz)|When the questionnaire was filled|

#### 3.2.6 Pydantic Schemas — `app/schemas/common.py`

Request/response models for API validation:

* `ParticipantCreate` / `ParticipantRead` — create and read participants
* `SessionCreate` / `SessionRead` / `SessionEndPatch` / `SessionDetail` — CRUD for sessions
* `SensorReadingCreate` / `SensorReadingRead` — ingestion payload / response
* `DerivedMetricsRead` — read-only derived metrics
* `OutcomeMeasureCreate` — submit VAS/NDI scores

#### 3.2.7 API Endpoints — `app/api/`

**`health.py`** — `GET /api/health` → `{"status": "ok"}`

**`ingest.py`** — `POST /api/ingest`

```
Authentication: X-Device-Key header must match config
Rate limiting: 10 requests/second/device via Depends(limiter)
Validation: Session must exist and be active (end\_time is NULL)
Idempotency: Deduplicates on (session\_id + timestamp) — if an exact
             match exists, returns the existing reading instead of
             creating a duplicate. This handles ESP32 retry scenarios
             where the same reading is POSTed multiple times due to
             intermittent Wi-Fi.
```

**`sessions.py`**

* `POST /api/sessions` — Create a new sleep session (validates participant exists, no active session conflict)
* `PATCH /api/sessions/{id}/end` — End a session (sets end\_time, triggers metrics computation)
* `GET /api/sessions/{id}` — Get session with derived metrics + all sensor readings

**`participants.py`**

* `GET /api/participants` — List all participants with session counts and SQI trends
* `POST /api/participants` — Create a participant (409 if already exists)
* `GET /api/participants/{id}/compare` — **Key endpoint**: Returns baseline vs intervention comparison with:

  * Paired SQI scores
  * Subjective VAS/NDI outcome scores
  * Percentage change
  * Statistical test results (auto-selected paired t-test or Wilcoxon)

**`analytics.py`** — `POST /api/analytics/sessions/{id}/recompute` — Re-trigger metrics pipeline for a session.

**`export.py`** — `GET /api/export/csv?session\_id=X\&participant\_id=Y`

```
Merges raw sensor readings with derived metrics into a single CSV.
Supports export by session or by participant (all sessions).
Designed for direct import into R/SPSS for academic paper analysis.
```

#### 3.2.8 Analysis Services — `app/services/`

##### `sleep\_analysis.py` — Core Sleep Detection Algorithms

**`ReadingLike` dataclass** — Protocol-compatible shape matching both raw readings and ORM objects.

**`estimate\_sleep\_onset\_and\_wake(readings)`**

```
Algorithm:
1. ONSET DETECTION (sliding window):
   - Slide a window of size `motion\_window\_size` (default 5) across readings
   - For each window, compute:
     a. Standard deviation of motion magnitude (√(x² + y² + z²))
     b. Standard deviation of heart rate (ignoring NaN/missing)
   - If motion\_std ≤ 0.08 AND hr\_std ≤ 3.5 → person has settled → mark onset
   - Fallback: if no stable window found, use the first reading timestamp

2. WAKE DETECTION (reverse pressure scan):
   - Scan readings from the end backwards
   - Compute average pressure across pressure\_1, pressure\_2, pressure\_cervical\_zone
   - When average pressure drops below 0.15 → person left the pillow → mark wake

Why this method: Combines motion stillness (actigraphy principle) with heart rate
stabilization (HR decreases and stabilizes during NREM onset) and pressure occupancy
(person physically on pillow). This multi-signal approach is more robust than any
single sensor alone.
```

**`compute\_waso\_minutes(readings, onset, wake)`**

```
Algorithm:
- Compute baseline HR as the session mean heart rate
- For each epoch between onset and wake:
  If motion\_magnitude ≥ 0.35 AND heart\_rate ≥ baseline + 8.0 BPM:
    → Count this epoch as WASO (wake after sleep onset)
- Sum the durations of all WASO epochs in minutes

Why both conditions: Motion alone can be a position shift during sleep.
Requiring both elevated motion AND a heart rate spike above baseline
reduces false positives. The 8 BPM spike threshold is based on the
typical sympathetic nervous system activation during arousals.
```

**`calculate\_sleep\_efficiency(total\_sleep\_minutes, time\_in\_bed\_minutes)`**

```
Formula: SE = (TST / TIB) × 100
Standard sleep medicine metric. Values above 85% are considered good.
```

**`calculate\_hrv\_features(heart\_rates)`**

```
Input: List of heart rate values (BPM), may contain None
Processing:
1. Filter out None and ≤0 values
2. Convert BPM to RR intervals: RR\_ms = 60000 / BPM
3. Compute:
   - RMSSD: √(mean(diff(RR)²)) — short-term parasympathetic variability
   - SDNN: std(RR) — overall HRV
   - LF/HF ratio: variance(first\_half) / variance(second\_half)
     (simplified proxy — true frequency domain requires FFT on longer recordings)

Important caveat: These are PPG-derived proxies from MAX30102, not ECG-grade
RR intervals. Accuracy is lower than clinical HRV. This is noted in code comments.
Returns (None, None, None) if fewer than 3 valid readings.
```

##### `staging.py` — Rule-Based Sleep Stage Estimation

**`RuleBasedStageEstimator.estimate(readings, onset, wake)`**

```
For each epoch between onset and wake, classifies into:
- DEEP SLEEP: motion < 0.1g AND heart\_rate < 62 BPM
  (minimal movement + bradycardia characteristic of N3/SWS)
- REM PROXY: motion < 0.2g AND 62 ≤ heart\_rate ≤ 78 BPM
  (still relatively low motion due to atonia + moderate HR due to dreaming)
- LIGHT SLEEP: everything else

Output includes:
- light\_minutes, deep\_minutes, rem\_proxy\_minutes
- confidence: 0.55 (fixed — reflects known accuracy ceiling)
- disclaimer: "Cohen's κ 0.4–0.7 vs polysomnography"

Thresholds are configurable via config.py (stage\_deep\_motion\_max, etc.)

Why rule-based: Without EEG, true polysomnographic staging is impossible.
This heuristic approach using motion + HR follows established actigraphy
literature (Sadeh algorithm, Cole-Kripke). The confidence score explicitly
communicates the limitation.
```

##### `sqi.py` — Sleep Quality Index (Composite Score)

**`calculate\_sqi(sleep\_efficiency, movement\_event\_count, stability\_score=None)`**

```
Components:
1. Efficiency (weight 0.55): Clamped to \[0, 100]
2. Movement (weight 0.20): 100 - (count × 2.5), clamped at 0
3. Stability (weight 0.25): HR stability score, clamped to \[0, 100]
   Only included if heart rate data is present (MAX30102 not null)

Graceful degradation: If the MAX30102 sensor is absent (stability\_score=None),
the stability component is excluded and the remaining weights are automatically
re-normalized. Formula:

  SQI = Σ(component\_value × weight) / Σ(active\_weights)

This ensures the SQI score remains valid and comparable even with different
sensor configurations across sessions.

Score range: 0–100 (higher is better sleep quality)
```

##### `stats.py` — Paired Statistical Comparison

**`paired\_comparison(baseline, intervention)`**

```
Algorithm:
1. Validate: Both lists must be equal length ≥ 2
2. Compute differences: intervention - baseline
3. Normality test: Shapiro-Wilk on differences (if n ≤ 5000)
4. Test selection:
   - If normality\_p > 0.05 (normal): use paired t-test (ttest\_rel)
   - If normality\_p ≤ 0.05 (non-normal): use Wilcoxon signed-rank test
5. Compute:
   - Mean effect difference
   - 95% confidence interval (using t-distribution)
   - P-value from the selected test
   - Normality test p-value (for transparency)

Why auto-select: With small sample sizes typical in academic
pilot studies (n=5–15 participants), assuming normality is risky.
The Shapiro-Wilk test determines the appropriate non-parametric
alternative automatically.

Returns: {test, normality\_p, p\_value, effect\_mean\_diff, ci\_95}
```

##### `metrics\_pipeline.py` — Orchestrator

**`compute\_session\_metrics(db, session\_id)`**

```
Triggered when a session is ended (via PATCH /sessions/{id}/end).
Sequence:
1. Load all sensor readings for the session, ordered by timestamp
2. Detect sleep onset and wake times
3. Compute WASO
4. Count movement events (motion magnitude > 0.3g)
5. Calculate sleep efficiency: (TST - WASO) / TIB × 100
6. Extract HRV features (RMSSD, SDNN, LF/HF)
7. Run rule-based sleep staging
8. Compute HR stability score (if HR data available)
9. Calculate composite SQI
10. Upsert into derived\_metrics table
```

#### 3.2.9 Tests — `backend/tests/test\_sleep\_services.py`

|Test|What It Validates|
|-|-|
|`test\_estimate\_sleep\_onset\_and\_wake\_detects\_sleep\_and\_wake`|20-reading synthetic sequence with clear awake→asleep→wake transition. Verifies onset is detected after the transition point and wake is detected at the pressure drop.|
|`test\_estimate\_sleep\_with\_missing\_sensors`|All heart\_rate=None, pressure\_cervical\_zone=None. Verifies onset detection still works using motion alone (graceful degradation).|
|`test\_waso\_computation`|30-reading sequence with a 5-minute awake period in the middle (high motion + elevated HR). Verifies WASO > 0.|
|`test\_calculate\_sqi\_in\_range`|SQI with realistic inputs stays in \[0, 100] and exceeds 60 for good sleep.|
|`test\_staging\_estimation`|60-minute synthetic session with deliberate deep/REM/light segments. Verifies each stage has non-zero minutes and disclaimer contains "kappa".|
|`test\_paired\_comparison\_wilcoxon`|8-pair comparison verifying the statistical test runs and returns a valid p-value.|

#### 3.2.10 Seed Script — `backend/scripts/seed\_data.py`

Creates synthetic demo data:

* 1 participant (P001, age 24, F, NDI 22.5)
* 2 sessions: 1 baseline (standard\_fiberfill) + 1 intervention (restntravel\_organic)
* 360 sensor readings per session (6 hours at 1-minute intervals)
* Readings use Gaussian noise around realistic values
* Automatically triggers `compute\_session\_metrics()` for each session

\---

### 3.3 Frontend — `/frontend/`

**Stack:** React 19 + Vite 8 + TypeScript 6 + Recharts 3 + Tailwind CSS 3

#### 3.3.1 Configuration Files

|File|Purpose|
|-|-|
|`vite.config.ts`|Vite config with React plugin|
|`tailwind.config.js`|Tailwind with `tailwindcss-animate` plugin for smooth animations|
|`postcss.config.js`|PostCSS with Tailwind + Autoprefixer|
|`tsconfig.json`|TypeScript project references|
|`package.json`|Dependencies and scripts (`dev`, `build`, `lint`, `preview`)|
|`index.html`|Entry HTML with `<div id="root">` mount point|

#### 3.3.2 Application Entry

**`src/main.tsx`** — Mounts `<App />` into the root div with StrictMode.

**`src/App.tsx`** — Main application shell.

```
Layout:
- Top navigation bar: Gradient indigo header with glassmorphism nav pills
- Tab-based routing: Dashboard | Participant Detail | Session Compare | Export
- Mobile-responsive: Horizontal scroll nav on small screens
- Background: Subtle radial glow effect behind content area
```

#### 3.3.3 API Client — `src/api/client.ts`

Centralized fetch wrapper pointing to `VITE\_API\_BASE\_URL` (defaults to `http://localhost:8000`):

* `api.health()` — Health check
* `api.participants()` — List all participants with SQI trends
* `api.compareParticipant(id)` — Get baseline vs intervention comparison
* `api.getSession(id)` — Get full session detail with readings
* `api.exportBySession(id)` / `api.exportByParticipant(id)` — CSV download URLs

#### 3.3.4 Components

**`src/components/DisclaimerBanner.tsx`**

```
Professional academic disclaimer banner (blue info-box style, not alarmist).
States: "Stage estimations and metrics are derived from surrogate
commercial-grade sensors... Accuracy ceiling: Cohen's κ 0.4–0.7
when validated against gold-standard polysomnography."
```

#### 3.3.5 Pages

**`src/pages/Dashboard.tsx`** — Cohort Overview

```
- Fetches all participants on mount
- Shows loading spinner during fetch
- Displays card grid: each participant shows:
  - Participant ID
  - Session count badge
  - Sparkline chart of recent SQI trend (Recharts LineChart)
- Hover effects: card lift + shadow transition
```

**`src/pages/ParticipantDetail.tsx`** — Baseline vs Intervention Analysis

```
- Input: Participant ID
- Calls api.compareParticipant()
- Left panel: Statistical comparison card
  - Paired session count
  - % improvement (green/red)
  - Test used (Wilcoxon / paired t-test)
  - P-value (highlighted green if < 0.05)
  - 95% confidence interval
- Right panel: Bar chart comparing:
  - SQI (Objective) — baseline vs intervention mean
  - Neck Pain (Subjective) — VAS/NDI outcome scores
- Bottom: DisclaimerBanner
```

**`src/pages/SessionCompare.tsx`** — Side-by-Side Session Visualization

```
- Two UUID inputs: Baseline session + Intervention session
- Side-by-side layout (2 columns on large screens):
  For each session:
  - Header card with SQI score
  - Heart Rate Trend: AreaChart with gradient fill
  - Pressure Distribution: Stacked BarChart distinguishing:
    \* General head pressure (gray bars)
    \* Cervical zone pressure (amber bars) ← KEY DIFFERENTIATOR
      This is the primary value proposition of the organic pillow —
      cervical ergonomics — so it gets visual emphasis.
- Bottom: DisclaimerBanner
```

**`src/pages/Export.tsx`** — Research Data Export

```
- "Export Full Participant Cohort" — downloads all sessions for a participant
- "Export Single Session" — downloads one session's high-res time series
- Loading state during download
- Info note about CSV structure for R/SPSS import
```

\---

### 3.4 Firmware — `/firmware/esp32-node/`

**`platformio.ini`** — PlatformIO config for ESP32-S3-DevKitC-1 with Arduino framework.

**`src/main.cpp`** — Skeleton placeholder. TODOs for:

* FSR, MPU6050, MAX30102 sensor integration
* Timestamped JSON payload construction
* HTTP POST to `/api/ingest` with `X-Device-Key` header
* Retry logic with exponential backoff

> The firmware is a skeleton because the hardware integration depends on the physical pillow prototype being constructed. The backend API is fully ready to receive data from it.

\---

### 3.5 Documentation — `/docs/`

|File|Contents|
|-|-|
|`SRS (3).pdf`|Original Software Requirements Specification (pre-revision)|
|`SRS\_NOTES.md`|Markdown extract of SRS key sections|
|`PROJECT\_REPORT.md`|This file — comprehensive technical reference|

\---

## 4\. DATA FLOW — END TO END

### 4.1 Data Collection Phase

```
1. Researcher creates participant:
   POST /api/participants {participant\_id: "P001", age: 24, ...}

2. Researcher starts a sleep session:
   POST /api/sessions {participant\_id: "P001", phase: "baseline",
                       pillow\_type: "standard\_fiberfill", start\_time: "..."}
   → Returns session\_id (UUID)

3. ESP32 collects sensor data at \~1 reading/minute and POSTs:
   POST /api/ingest
   Headers: X-Device-Key: dev-device-key
   Body: {session\_id, timestamp, pressure\_1, pressure\_2,
          pressure\_cervical\_zone, motion\_x/y/z, heart\_rate, spo2}

   - Idempotency: duplicate (session\_id + timestamp) returns existing reading
   - Rate limiting: max 10 requests/second/device

4. Researcher ends the session in the morning:
   PATCH /api/sessions/{id}/end {end\_time: "..."}
   → Triggers compute\_session\_metrics() automatically
```

### 4.2 Analysis Pipeline (triggered on session end)

```
sensor\_readings\[] → estimate\_sleep\_onset\_and\_wake()
                     ├→ onset timestamp
                     └→ wake timestamp
                          ↓
                   compute\_waso\_minutes()
                     └→ WASO in minutes
                          ↓
                   calculate\_sleep\_efficiency()
                     └→ SE = (TST-WASO)/TIB × 100
                          ↓
                   calculate\_hrv\_features()
                     └→ RMSSD, SDNN, LF/HF ratio
                          ↓
                   RuleBasedStageEstimator.estimate()
                     └→ {light, deep, rem\_proxy} minutes + confidence + disclaimer
                          ↓
                   calculate\_sqi()
                     └→ 0-100 composite score (re-weighted for present sensors)
                          ↓
                   All results → derived\_metrics table
```

### 4.3 Comparison Phase

```
GET /api/participants/{id}/compare
  ↓
Fetches all sessions for participant
  ↓
Splits into baseline\_sessions\[] and intervention\_sessions\[]
  ↓
Extracts SQI scores for each group
  ↓
paired\_comparison(baseline\_scores, intervention\_scores)
  ├→ Shapiro-Wilk normality test
  ├→ Auto-selects paired t-test or Wilcoxon
  ├→ Returns p-value, effect size, 95% CI
  └→ Also returns VAS/NDI subjective outcome scores
```

\---

## 5\. KEY DESIGN DECISIONS (Panel-Defensible)

|Decision|Rationale|
|-|-|
|**Multi-signal onset detection** (motion + HR + pressure)|Any single sensor is unreliable. Motion alone can't distinguish rest from sleep; HR alone misses position changes; pressure alone is binary. Combining all three follows the actigraphy + auxiliary sensor literature.|
|**WASO requires BOTH motion AND HR spike**|Reduces false positives from benign position shifts during sleep. An actual awakening involves sympathetic activation (elevated HR).|
|**SQI weight rebalancing**|If MAX30102 is absent, SQI should still be computed from available sensors. Static weights would produce biased scores. Dynamic renormalization across present sensors ensures fair comparison.|
|**Auto-selection of statistical test**|Small n (5–15 participants) makes normality assumptions risky. Shapiro-Wilk test determines whether to use parametric (paired t) or non-parametric (Wilcoxon) automatically.|
|**Cohen's κ disclaimer on every stage output**|Without EEG, rule-based staging is an approximation. Transparency about accuracy ceiling (0.4–0.7) is ethically necessary and academically honest.|
|**Cervical zone as distinct pressure channel**|The pillow is evaluated specifically for cervical ergonomics/neck pain. Separating cervical-zone FSR from general head FSRs enables direct comparison of the value proposition.|
|**Idempotent ingestion**|ESP32 with intermittent Wi-Fi will retry failed POSTs. Without deduplication, the same reading could appear multiple times, skewing all derived metrics.|
|**`psycopg` v3 dialect**|The `requirements.txt` uses `psycopg\[binary]` (v3), not `psycopg2`. SQLAlchemy requires `postgresql+psycopg://` dialect prefix for v3 compatibility.|

\---

## 6\. SENSORS USED vs REMOVED

|Sensor|Status|Purpose|
|-|-|-|
|**FSR (×3)**|✅ Active|2 general head pressure + 1 cervical zone|
|**MPU6050**|✅ Active|3-axis accelerometer for head movement|
|**MAX30102**|✅ Active (optional)|PPG heart rate + SpO2|
|~~DHT22~~|❌ Removed|~~Ambient temperature \& humidity~~ — removed post-SRS|
|~~MEMS Mic~~|❌ Removed|~~Snore/breathing detection~~ — removed post-SRS|

\---

## 7\. HOW TO RUN

```bash
# 1. Start infrastructure (from project root)
cd \~/projects/Sleep\_Tracking
sudo docker compose down -v          # Clean slate
sudo docker compose up --build -d    # Build \& start (DB healthcheck ensures order)

# 2. Wait for DB, then stamp migration
sudo docker compose exec backend alembic stamp head

# 3. Seed demo data
sudo docker compose exec backend bash -c "PYTHONPATH=/app python scripts/seed\_data.py"

# 4. Start frontend
cd frontend
npx vite --host

# 5. Open browser
# Frontend: http://localhost:5173
# Backend Swagger: http://localhost:8000/docs
```

\---

## 8\. HOW TO ADD A NEW SENSOR

1. **Model** (`backend/app/models/entities.py`): Add column to `SensorReading`
2. **Migration** (`alembic revision --autogenerate`): Generate + apply
3. **Schema** (`backend/app/schemas/common.py`): Add to `SensorReadingCreate`
4. **Ingest** (`backend/app/api/ingest.py`): Map payload field to ORM object
5. **Firmware** (`firmware/esp32-node/src/main.cpp`): Add to JSON POST body

\---

## 9\. TEAM OWNERSHIP

|Track|Scope|Key Files|
|-|-|-|
|**Hardware \& Firmware**|ESP32, sensor wiring, Wi-Fi reliability|`firmware/`, ingest endpoint|
|**Algorithms \& Backend**|Detection logic, SQI, stats, DB|`backend/app/services/`, `config.py`, models|
|**Dashboard \& Protocols**|Visualizations, UX, export, clinical protocol|`frontend/src/`, export endpoint|



