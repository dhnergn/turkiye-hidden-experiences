# Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
## Phase 5: Frontend Design Constitution & Component Architecture

---

### 1. Aesthetic Direction & Domain-Native Design Philosophy

**Türkiye Hidden Experiences** avoids generic modern "AI-slop" aesthetics (floating rounded-2xl pastel gradient cards, arbitrary pill clusters, and generic purple gradients). Instead, it adopts an artisanal, grounded Mediterranean and Anatolian visual identity inspired by:
- **Earthy Terracotta, Warm Ochre & Aegean Olive Tones**: Reminiscent of Anatolian pottery, ancient stone villages (Kayaköy, Mardin, Safranbolu), and Aegean olive groves.
- **Typographic Hierarchy & Zero-Pill Discipline**: Metadata (provinces, durations, crowd indicators, seasons) is rendered as clean unboxed typography separated by subtle typographic dividers (`·` or `/`), never surrounded by candy badges.
- **Authentic Local Photography**: Real architectural and landscape textures rather than stock photos.
- **Bilingual Interface**: Native Turkish (`tr`) as the default language with full English (`en`) localization.

---

### 2. View Hierarchy & Route State Management

The frontend is structured as a responsive single-page application with modular views, mobile-first touch ergonomics ($\ge 44\text{px}$ targets), and zero external routing bloat:

```
[ Root Viewport: App Shell ]
  ├── Navigation Bar
  │     ├── Brand Logo & Region Selector (All Regions, Ege, Karadeniz, Akdeniz, etc.)
  │     ├── Primary Nav Links (Keşfet / Explore, Saklı Harita / Map, Gezi Planım / Saved)
  │     ├── Role Switcher / Demo Persona Selector (Gezgin / Traveller, Yerel Üretici / Provider, Admin)
  │     └── Language Switcher (TR / EN)
  │
  ├── Viewport Views (Active View State)
  │     ├── [VIEW: LANDING & NATURAL REQUEST HERO]
  │     │     ├── Hero: "Bize nasıl bir Türkiye aradığını anlat..."
  │     │     ├── Natural Language Prompt Input Bar (e.g. "3 gün, 5000 TL, sakin, arabasız...")
  │     │     ├── Quick Filter Toggles & Onboarding Questionnaire Modal
  │     │     └── Curated Hidden Gem Collections
  │     │
  │     ├── [VIEW: RECOMMENDATIONS & EXPLORE FEED]
  │     │     ├── Transparent Match Badges ("Neden bu deneyim size uyuyor?")
  │     │     ├── Experience Card Grid with Verified Provider Badges
  │     │     └── Multi-Dimension Sidebar Filter (Bütçe, Kalabalık, Ulaşım, Tarz)
  │     │
  │     ├── [VIEW: PRIVACY-PRESERVING INTERACTIVE MAP]
  │     │     ├── Jittered District Centroids (No residential doxxing)
  │     │     ├── Cluster Pin Summary Cards
  │     │     └── Regional Boundary Filters
  │     │
  │     ├── [VIEW: EXPERIENCE DETAIL & PROVIDER TRUST]
  │     │     ├── High-Res Photography Gallery (EXIF-stripped)
  │     │     ├── Provider Trust Tier (Kimlik Onaylı, Zanaatkar Odası Kayıtlı)
  │     │     ├── Practical Details (Süre, Kapasite, Ulaşım, Yaklaşık Fiyat)
  │     │     ├── Verified Reviews & Host Response Thread
  │     │     └── Action Bar (Geziye Ekle / Save to Trip, Bildir / Report)
  │     │
  │     ├── [VIEW: PROVIDER DASHBOARD & VERIFICATION VAULT]
  │     │     ├── Provider Status Overview (Onay Bekliyor / Verified)
  │     │     ├── Experience Submission Form with Location Privacy Warning
  │     │     └── Document Upload for Artisan/Farm Verification
  │     │
  │     └── [VIEW: ADMIN & MODERATION DASHBOARD]
  │           ├── Verification Audit Queue
  │           ├── Listing Moderation (Onayla / Reddet)
  │           ├── Incident Reports Review
  │           └── Real-Time Security & Audit Event Log Viewer
  │
  └── Footer & KVKK / Privacy Controls
        ├── Privacy Policy & KVKK Aydınlatma Metni Modal
        ├── Data Export (Verilerimi İndir)
        └── Defensible Location Privacy Disclosure
```

---

### 3. Component Inventory

| Component Name | Responsibility | Zero-Pill & Accessibility Compliance |
|---|---|---|
| `Navbar` | Navigation, role simulation, language toggle, saved count | Clean text links with bottom active indicators |
| `TravelRequestInput` | Natural language text bar with sample prompt quick-insert | High-contrast input field with focus ring |
| `OnboardingModal` | Progressive 6-step questionnaire with skip options | Segmented button choices, no dead clicks |
| `ExperienceCard` | Renders experience preview, approximate price, crowd level | Clean unboxed text metadata, explainability drawer |
| `ExperienceDetailModal` | Deep dive into provider backstory, location info, reviews | High-contrast typography, verified badges |
| `PrivacyMap` | Interactive SVG/Canvas map of Turkish regions with jittered pins | Accessible fallback table, rate-limited panning |
| `TripPlannerDrawer` | Multi-day trip itinerary builder with reordering | Drag-and-drop or simple sequential day sorting |
| `ProviderDashboard` | Submission form with district picker, image upload | Privacy banner reminding providers coordinates will be obfuscated |
| `AdminDashboard` | Verification review, audit log table, report resolution | Monospace audit IDs, red/green action triggers |
| `PrivacyDataModal` | KVKK data export and account erasure triggers | Accessible confirmation modal |

---

### 4. Color Palette & Typography Specifications

- **Primary Brand Terracotta**: `#C85A32` (Stone & Clay), `#9C3D1B` (Deep Ochre)
- **Secondary Aegean Olive**: `#4A5D4E` (Aegean Flora & Olive Grove)
- **Backgrounds**: Warm Stone Canvas `#FAF8F5`, Surface Card `#FFFFFF`, Muted `#F3EFEA`
- **Text & Contrast (WCAG AA compliant)**:
  - Primary Headlines & Titles: `#1C1917` (Stone 900)
  - Secondary Copy & Descriptions: `#44403C` (Stone 700)
  - Muted Metadata & Dividers: `#78716C` (Stone 500)
  - Borders: Subtle warm slate `#E7E5E4` (Stone 200)
- **Zero-Pill Rule Enforcement**:
  - Tags are rendered as: `Ege · Köy Hayatı · Sakin · ₺₺ · 3 Saat`
  - Active interactive filters use clean segmented backgrounds (`bg-stone-200 text-stone-900`) without pill enclosures.
