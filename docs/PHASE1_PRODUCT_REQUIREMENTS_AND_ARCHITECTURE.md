# Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
## Phase 1: Product Requirements and System Architecture Specification

---

### 1. Executive Summary & Product Vision
**Türkiye Hidden Experiences** is a trusted discovery and matching platform designed to connect conscious travellers with authentic, verified, and lesser-known local experiences, artisans, family farms, cultural workshops, and rural communities across Türkiye.

Unlike conventional mass-tourism aggregators that incentivize overcrowded hotspots and commercialized tours, this platform prioritizes:
- **Authenticity over Volume**: Uncovering forgotten culinary traditions, village stays, artisan workshops, and sustainable rural experiences.
- **Privacy-First Geography**: Obfuscating residential and private coordinates to protect local providers while providing actionable approximate regions.
- **Transparent, Grounded Recommendations**: Explicit weighted matching rather than black-box AI rankings, always answering: *"Why does this experience match you?"*
- **Rigorous Verification & Trust**: Explicit provider verification tiers without sensationalized "100% safe" claims.

**Core User Promise**:
> *"Tell us what kind of traveller you are, and we will find the Türkiye that fits you."*

---

### 2. User Personas & Detailed Functional Requirements

#### A. Traveller
- **Onboarding & Profiling**:
  - Quick questionnaire (skippable, progressive profiling).
  - Explicit preferences: Preferred crowd tolerance (very quiet, small crowds, moderate, lively), budget tiers (₺ to ₺₺₺₺), duration, travel styles (slow travel, artisan/craft, food, rural, nature, backpacker, etc.), activity level, transportation mode (public transport, walking, rental car, etc.), food dietary requirements.
- **Natural-Language Travel Request**:
  - Unstructured input (e.g., *"I have 3 days and 5,000 TL in the Aegean region, want quiet nature, local food, and no car"*).
  - Parsed into structured parameters without executing raw queries.
- **Personalized Recommendations**:
  - Scored transparently across 8 core dimensions with clear explanation badges.
  - Multi-region discovery to prevent popularity bias / echo chambers.
- **Trip Planner & Saves**:
  - Save experiences to custom itineraries or wishlists.
- **Trust & Reporting**:
  - Post authentic reviews with attended experience verification.
  - Report problematic or fraudulent listings.

#### B. Local Experience Provider (Artisans, Farmers, Village Hosts, Guides)
- **Verified Provider Profile**:
  - Legal business or verified community identity tier.
  - Verification document submission (municipality licenses, artisan guild certificate, agricultural registry).
  - Explicit privacy controls: exact coordinates hidden by default; public representation at district/village approximate level.
- **Experience Management**:
  - Structured experience submissions: title, category, description, duration, approximate pricing, capacity, requirements, accessibility, seasonal availability.
  - Privacy-safe photo upload with metadata/EXIF stripping.
- **Traveller Inquiries & Bookings (V1 Preparation)**:
  - Direct inquiry channel without revealing personal phone/email publicly.
- **Reputation Management**:
  - Ability to post public responses to reviews.

#### C. Administrator / Content Moderator
- **Verification Workflow**:
  - Review submitted identity/business evidence in a secure, non-public vault.
  - Provider status transitions: `UNVERIFIED` → `PENDING` → `VERIFIED` / `REJECTED` / `SUSPENDED`.
  - Experience moderation: `DRAFT` → `PENDING_REVIEW` → `APPROVED` / `REJECTED` / `SUSPENDED`.
- **Audit & Compliance**:
  - Immutable audit logs for all moderation and verification decisions.
  - Review flagged content and reports.
- **Platform Health & Security Monitoring**:
  - Review recommendation quality metrics and anomalous activity (e.g., suspicious review velocity, brute-force attempts).

---

### 3. System Architecture & Topology

To meet the constraint of **zero startup budget**, high performance, and rapid deployment without vendor lock-in, the system is architected as a **Modular Monolith** with clear domain boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Presentation Layer                       │
│      React 19 SPA (Vite) + Tailwind CSS + Lucide Icons + Motion        │
│  - Responsive Mobile-First Web UI                                      │
│  - Turkish (Primary) & English Bilingual Support                       │
│  - Privacy-Safe Interactive Map (Approximate Geofenced Markers)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (JSON / REST API)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API & Middleware Layer                          │
│                      Node.js / Express Server                          │
│  - Security Headers (Helmet/CSP, CORS, SameSite/HttpOnly Cookies)      │
│  - Tiered Rate Limiters (Auth, Search, Upload, Admin)                  │
│  - Request ID Tracing & Input Sanitization/Validation (Zod schemas)    │
│  - RBAC Guard (Traveller, Provider, Admin/Moderator)                   │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
       Internal Bus │                  Internal Bus │
                    ▼                               ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│            Core Services             │  │      Ancillary Engines       │
│ - AuthService (Argon2/Bcrypt, JWT)   │  │ - Recommendation Engine      │
│ - ExperienceService (CRUD, Filter)   │  │   (Deterministic Weighted    │
│ - ProviderVerificationService        │  │    Multi-Factor Matcher)     │
│ - GeoHierarchyService (Turkey Geo)   │  │ - Safe AI Extraction Service │
│ - Review & Reporting Service         │  │   (Gemini API with strict    │
│ - Audit & Security Event Logger      │  │    output schema validation) │
│ - Media Sanitizer (EXIF Strip, Size) │  │ - Moderation Guard           │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │                                    │
                    └─────────────────┬──────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Data Storage Layer                              │
│ - Normalized Relational Schema (Users, Providers, Experiences, Geo,    │
│   Verifications, Reviews, AuditLogs, SecurityEvents)                   │
│ - File Storage: Local/S3-compatible bucket with content-type gating    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Geographic Hierarchy & Location Privacy Architecture

Türkiye has 7 geographical regions, 81 provinces, and 973 districts with thousands of traditional villages and localities.

```
Country: Türkiye (TR)
  └── Region (e.g., Ege, Karadeniz, Akdeniz, İç Anadolu, Marmara, Doğu Anadolu, Güneydoğu Anadolu)
        └── Province (e.g., Muğla, Trabzon, Çanakkale, Nevşehir, Kütahya, Artvin, Gaziantep)
              └── District (e.g., Fethiye, Çamlıhemşin, Ayvacık, Ürgüp, Tavşanlı, Şavşat)
                    └── Locality / Village (e.g., Kayaköy, Şenyuva, Yeşilyurt, Mustafapaşa)
                          └── Approximate Coordinate Bounds (±2–5km radius offset)
                                └── [STRICT ACCESS ONLY] Exact Coordinate / Address
```

#### Privacy Rules:
1. **Public APIs & Client Bundles**: ONLY receive Region, Province, District, Locality Name, and an obfuscated/jittered coordinate centroid.
2. **Exact Coordinates & Physical Street Addresses**: Locked behind authorized booking confirmation or verified provider status. Never serialized in public GET endpoints.
3. **EXIF Sanitization**: Any uploaded photo is stripped of GPS tags (`GPSLatitude`, `GPSLongitude`, `Camera Serial`) on the server before storage.

---

### 5. Recommendation Engine Principles

Recommendations are generated using a **deterministic, configurable weighted matching model**, ensuring transparency and auditability:

| Dimension | Default Weight | Description |
|---|---|---|
| **Destination / Geo Match** | 25% | Direct match or neighboring district proximity |
| **Budget Compatibility** | 20% | Traveller budget tier vs. approximate experience cost |
| **Interest & Categories** | 20% | Overlap in crafts, food, rural life, nature, workshops |
| **Crowd Level Tolerance** | 10% | Preference for very quiet / low crowd destinations |
| **Travel Style Alignment** | 10% | Slow travel, backpacker, family, artisan, eco-tourism |
| **Transportation Fit** | 5% | Accessibility via public transit vs car requirement |
| **Activity Level Fit** | 5% | Low / Moderate / High physical exertion alignment |
| **Food Preference Match** | 5% | Vegetarian, vegan, farm-to-table, local cuisine |

**Discovery Diversity Guarantee**:
- Popularity dampener: Verified hidden gems receive an intentional discovery boost.
- Echo chamber mitigation: At least 20% of returned suggestions originate from adjacent non-dominant districts within the matching region.
- Explainability String: Each recommendation returns a human-readable match rationale (e.g., *"Matched because you selected quiet rural settings, farm-to-table dining, and public transit accessibility"*).

---

### 6. Verification & Trust Lifecycle

```
Provider Registration
         │
         ▼
[ Status: UNVERIFIED ]
         │ (Submits Gov/Artisan/Community Documentation)
         ▼
[ Status: PENDING_REVIEW ] ──(Admin Review & Audit Log)──► [ Status: REJECTED ]
         │                                                        │
         ▼ (Approved by Human Moderator)                          │ (Appeal/Resubmit)
[ Status: VERIFIED ] ◄────────────────────────────────────────────┘
         │
         ▼ (Reports / Fraud Detection)
[ Status: SUSPENDED ]
```

**Trust Badges**:
- `Kimlik Doğrulandı` (Identity Verified)
- `Yerel Üretici / Zanaatkar Onaylı` (Local Producer / Artisan Certified)
- `Topluluk Referanslı` (Community Endorsed)
- `Deneyim Denetlendi` (Experience Inspected)
- `Yeni Katılımcı` (New Provider - Grace Period)

---

### 7. MVP Scope Matrix (V1 vs V2)

| Feature | Included in V1 (MVP) | Deferred to V2 |
|---|:---:|:---:|
| User Registration & Role Selection (Traveller, Provider, Admin) | Yes | - |
| Traveller Questionnaire & Progressive Profiling | Yes | - |
| Natural Language Request (AI Extraction via Schema) | Yes | - |
| Deterministic Weighted Recommendation Engine | Yes | - |
| Experience Catalog & Multi-Filter Search | Yes | - |
| Privacy-Safe Interactive Map (Centroid Clustering) | Yes | - |
| Experience Detail Page with Match Explanation | Yes | - |
| Saved Experiences & Custom Itinerary Builder | Yes | - |
| Provider Onboarding & Privacy-Preserving Experience Creation | Yes | - |
| Document Submission for Verification | Yes | - |
| Admin Verification Dashboard & Audit Log Viewer | Yes | - |
| Content Moderation & Problematic Listing Reporting | Yes | - |
| KVKK / GDPR Data Export & Account Erasure Requests | Yes | - |
| Direct In-App Payment Escrow | - | Yes |
| Instant Real-Time WebSocket Chat | - | Yes |
| Complex Loyalty Points / Tokenomics | - | Excluded |
| Native iOS/Android Binaries | - | Yes (PWA first) |

---

### 8. Technology Stack & Zero-Cost Rationale

- **Runtime & Full-Stack Engine**: Node.js + Express with Vite middleware mounting (`server.ts` integration).
- **Frontend Framework**: React 19 (TypeScript), Tailwind CSS v4, Lucide React icons, Motion animations.
- **Data Persistence**: In-memory relational state engine with persistent JSON / SQLite backing for local development and rapid portability to PostgreSQL/Cloud SQL when ready.
- **AI Integration**: `@google/genai` TypeScript SDK using `gemini-2.5-flash` strictly for JSON-schema-constrained preference extraction and natural summary translation.
- **Zero Cost Target**: Zero external paid SaaS dependencies required to run and test the complete end-to-end MVP.
