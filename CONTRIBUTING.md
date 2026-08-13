# Contributing Guidelines

This document outlines the ownership expectations and workflows for the 3-person student team building this research platform.

## Role Organization

For the faculty panel defense, ownership of the system is split into three core tracks, each led by one team member. 

### 1. Hardware & Firmware (Device Layer)
**Focus:** ESP32-S3 integration, sensor validation, Wi-Fi robustness.
* **Responsibilities:** 
  * Maintaining `firmware/esp32-node/` code structure.
  * Ensuring fault-tolerant HTTP POST requests (exponential backoff) under intermittent Wi-Fi.
  * Sensor calibration (MPU6050 noise filtering, FSR weight tuning, MAX30102 PPG reliability).
  * Validating power consumption/battery life.

### 2. Algorithms & Backend (Data Pipeline)
**Focus:** Sleep staging logic, database architecture, derived metrics integrity.
* **Responsibilities:**
  * Implementing and tuning heuristic parameters in `backend/app/core/config.py`.
  * Verifying API idempotency and avoiding data duplication in `ingest.py`.
  * Defending the SQI equation weights (efficiency, movement, stability, snoring).
  * Managing Postgres schema migrations via Alembic.
  * Ensuring graceful degradation when optional sensors fail.

### 3. Dashboard & Operations (Frontend & Protocols)
**Focus:** UI/UX, statistical comparison charts, clinical protocol adherence. 
* **Responsibilities:**
  * Enhancing `frontend/` components (Tailwind, Recharts) to highlight key differentiators (e.g., Cervical vs General head pressure).
  * Visualizing Baseline vs Intervention side-by-side using valid statistical tests (Paired T-test / Wilcoxon).
  * Integrating subjective (VAS/NDI) outcome measures with objective (SQI) data.
  * Research export packaging into single bundled CSVs tailored for academic paper submission. 

## Code Standards
- **Wait on Scope:** Do NOT introduce enterprise CI/CD, K8s, or complex auth unless officially requested by the faculty supervisor. The platform remains an academic prototype.
- **Defensible Decisions:** Every parameter (hr threshold, sensor weight) must have a brief Python docstring/comment explaining *why* it was chosen for faculty review.
- **Transparency:** The system relies on proxies (actigraphy/PPG) instead of EEG. The Cohen's kappa limitation disclaimer must remain visible on analytical views.
