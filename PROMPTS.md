# Project Prompts Log

This document records all prompts and instructions provided during the development of the **SG Carpark Live** application.

---

### Prompt 1: Initial Application Build
**Timestamp:** 2026-11-12T01:11:09-08:00

```markdown
Lets build a singapore-based carpark application that tracks real-time carpark lots availability. Build just the frontend for now, I will integrate the backend later.
```

**Implementation Summary:**
- Built full-featured Singapore carpark availability tracker.
- Integrated official `data.gov.sg` live carpark availability endpoint (`https://api.data.gov.sg/v1/transport/car-park-availability`) with client-side auto-refresh and fallback simulation.
- Designed curated dataset of 25+ major Singapore carpark hubs across Central/CBD, Orchard, Marina Bay, East, West, North, and North-East (e.g., VivoCity, Suntec City, ION Orchard, Jewel Changi, Jem, NEX, HDB MSCPs).
- Built interactive Leaflet map with custom lot count vacancy pins, region jumps, and geolocation distance calculator.
- Built Singapore Electronic Parking System (EPS) fee estimator, filtering by vehicle type (Cars, Motorcycles, Heavy), EV chargers, clearance height, and Sunday free parking.

---

### Prompt 2: GitHub Repository Push
**Timestamp:** 2026-11-12T01:18:28-08:00

```markdown
git push https://<GITHUB_TOKEN>@https://github.com/letterbets/SG_Lots.git
```
*(Token redacted for security)*

**Implementation Summary:**
- Configured local git repository on branch `main`.
- Committed all initial project files and pushed to `https://github.com/letterbets/SG_Lots.git`.
- Sanitized local git remote URL to remove plain-text token.

---

### Prompt 3: LTA DataMall Serverless Connection
**Timestamp:** 2026-11-12T01:38:45-08:00

```markdown
1. add a serverless connection that pulls live data from LTA's datamall using the following endpoint: 

# Live carpark lots (HDB, LTA and URA):
https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2

# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY>

2. store this in /api folder at project root level (not src file)

3. include /health.ts and /carparkavailability.ts within the same subfolder

4. do not hardcode any key, I will input them later
```

**Implementation Summary:**
- Created root-level `/api` folder with serverless functions:
  - `/api/health.ts`: Health-check endpoint reporting serverless gateway status and whether `LTA_ACCOUNT_KEY` is loaded.
  - `/api/carparkavailability.ts`: Proxies requests to LTA DataMall `CarParkAvailabilityv2` with `AccountKey` header, in-memory 30s cache, and pagination (`$skip`) support.
- Added `LTA_ACCOUNT_KEY` placeholder in `.env.example` without hardcoding any secrets.
- Configured Express `server.ts` to route `/api/*` endpoints and serve Vite in dev.
- Committed and pushed changes to GitHub repository.

---

### Prompt 4: Prompts Collation
**Timestamp:** 2026-11-12T01:47:08-08:00

```markdown
collate all of the prompts and store them as PROMPTS.md file
```

**Implementation Summary:**
- Created `PROMPTS.md` at root level summarizing the full project chronology, prompts, and implementations.
