# SwasthyaSetu AI (स्वास्थ्य सेतु)

> Predict shortages. Coordinate care. Protect communities. An explainable, offline-first health resilience copilot for Primary Health Centres and district health officers.

---

## Overview

**SwasthyaSetu AI** is a clinical decision-support and logistics resilience system tailored for district health administrations (specifically modeled around Meerut and Baghpat districts in Uttar Pradesh, India). It bridges grassroot Primary Health Centres (PHCs) with district medical officers to anticipate medicine stock-outs, coordinate emergency redistributions, mitigate expired medication waste, and trigger rapid epidemic surge responses.

---

## Key Features

1. **District Operational Situation Room & Live GIS**:
   - Integrated Google Maps Platform (`@vis.gl/react-google-maps`) displaying 20 PHCs with real-world coordinates.
   - Dynamic risk categorization pins (`Critical`, `High Risk`, `Monitoring`, `Safe`, `Expiry Opportunity`).
   - Live command post geolocation and road network transit calculations (real driving distance in km and transit ETA).
   - Visual transfer corridors between surplus facilities and critical deficit clinics (e.g. PHC A to PHC B via NH-58).

2. **Early Warning Radar & Stock-Out Forecasting**:
   - Multi-signal detection combining fever OPD surges (+46%), consumption velocity spikes, and buffer thresholds.
   - Data Trust Scoring (0-100) reflecting data freshness, completeness, verification, consistency, and sync status.

3. **Human-in-the-Loop Medicine Redistribution**:
   - Algorithmic donor-recipient matching (surplus PHCs to stock-out clinics).
   - Cold-chain preservation window calculations and vehicle recommendations.
   - Mandatory human approval gates with tamper-evident audit logs and reason capture.

4. **Expiry Rescue (FEFO Optimizer)**:
   - Identifies batches approaching expiry (e.g. within 60-90 days) in low-consumption facilities.
   - Matches them with high-velocity PHCs to ensure 100% medicine utilization before expiry.

5. **District Emergency & Epidemic Surge Protocol**:
   - One-click protocol escalation (Viral Outbreak, Heatwave, Waterborne, Post-Monsoon).
   - Dynamic OPD surge multipliers and human authorization checkpoints.

6. **Explainable Gemini AI Copilot**:
   - Grounded conversational assistant powered by Google GenAI (`gemini-2.5-flash`).
   - Explainable clinical rationale, stock extraction from paper registers, and offline audio transcription.

7. **Offline-First Resilience**:
   - Zero-blockage architecture: operations continue uninterrupted during network outages with local queueing and automatic sync upon reconnection.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Runtime & Language**: Node.js, [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Mapping & GIS**: [Google Maps Platform](https://developers.google.com/maps) (`@vis.gl/react-google-maps`)
- **Artificial Intelligence**: [Google GenAI SDK](https://github.com/google-gemini/deprecations) (`@google/genai`)
- **Backend & Database**: Firebase Authentication, Cloud Firestore (optional cloud sync)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm` or `yarn` / `pnpm`
- Google Maps Platform API key (Maps JavaScript API)
- Google Gemini API key (from Google AI Studio)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/swasthyasetu-ai.git
   cd swasthyasetu-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and fill in your keys:
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_key"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Building for Production

```bash
npm run build
npm run start
```

---

## Simulated Data Notice

> **Notice**: All patient footfall data, clinic rosters, medicine batch numbers, and stock level figures in this application are **synthetic and simulated** for clinical decision-support demonstration and operational evaluation. No real personal health information (PHI) or identifiable patient records are stored or processed.

---

## License

This project is licensed under the Apache 2.0 License.
