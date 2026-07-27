# ⚓ Lighthouse AI: Autonomous PropTech Marketing Suite

**Lighthouse AI** is a high-performance marketing and analysis engine designed for the modern real estate landscape. By bridging the gap between creative storytelling and technical investment logic, Lighthouse transforms a simple property URL into a complete, cross-platform marketing kit in seconds.

### 🚀 Live Demo: [here](https://lighthouse-ui.netlify.app/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/ec54b8c0-3560-468c-9ce9-a91351a950e0/deploy-status)](https://app.netlify.com/projects/lighthouse-ui/deploys)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router) with Turbopack.
- **AI Orchestration:** Vercel AI SDK.
- **Inference:** GPT-OSS 120B running on **Groq LPUs** (Low-latency, high-throughput).
- **Data Extraction:** **Firecrawl** (Autonomous web scraping and markdown conversion).
- **Validation:** Zod-based schema enforcement for consistent API responses.
- **Styling:** Tailwind CSS with a "Glassmorphic" Blueprint aesthetic.

---

## ✨ Key Features

- **Autonomous Scraping:** Enter a Zillow, Realtor.com, or Redfin URL to automatically ingest property specs and descriptions.
- **Multi-Channel Output:** Generates official MLS drafts, Instagram captions, and TikTok storyboards simultaneously.
- **Feature Chip Extraction:** Intelligently identifies top-selling points (e.g., "Quartz Countertops", "New HVAC") for quick-glance UI.
- **Adaptive UI:** A "Lighthouse" blueprint background with a glassmorphic interface that responds to the selected persona.

---

## 🏁 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/codelikeagirl29/lighthouse.git
cd lighthouse
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root:

```env
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
FIRECRAWL_API_KEY=your_firecrawl_key
```

### 3. Install and Run

```bash
npm install
npm run dev
```

---

## 📈 Roadmap

- [ ] **Virtual Staging Integration:** Connecting the _Shadow + Slate_ canvas engine for automated floorplan visualization.
- [ ] **Direct Social API:** One-click posting to Instagram and Facebook Business suites.
- [ ] **PDF Export:** Generation of professional "Listing Flyers" for open house events.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

\*\*Developed by [Lindsey Howard](https://github.com/codelikeagirl29)
