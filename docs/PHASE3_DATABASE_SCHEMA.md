# Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
## Phase 3: Relational Database Schema & Data Models Specification

---

### 1. Schema Design Principles
To satisfy low-cost deployment, modular monolith scalability, and strict privacy requirements (KVKK/GDPR):
- **Primary Keys**: UUIDv4 (`id`) to prevent sequential resource enumeration and IDOR scraping.
- **Audit Columns**: `created_at`, `updated_at`, and `deleted_at` (soft deletes for user accounts and sensitive listings).
- **Location Privacy Split**: Separation between physical location records (exact coordinates, accessible only to authorized entities) and public geographic centroids (fuzzy coordinates, district bounds).
- **Verification Integrity**: Separation between public provider trust metrics and private, access-controlled verification evidence documents.
- **Immutability of Audit Trails**: `audit_logs` and `security_events` are append-only.

---

### 2. Entity Relationship Diagram (Conceptual Overview)

```
       ┌────────────────────────┐
       │         users          │
       └───────────┬────────────┘
                   │ 1:1
       ┌───────────▼────────────┐
       │        profiles        │
       └───────────┬────────────┘
                   │
    ┌──────────────┼──────────────────────────────┐
    │ 1:1          │ 1:M                          │ 1:M
    ▼              ▼                              ▼
┌─────────┐  ┌───────────┐                 ┌─────────────┐
│providers│  │travel_reqs│                 │saved_trips  │
└────┬────┘  └───────────┘                 └──────┬──────┘
     │                                            │ 1:M
     ├─────────────┐                       ┌──────▼──────┐
     │ 1:M         │ 1:M                   │trip_items   │
     ▼             ▼                       └─────────────┘
┌───────────┐ ┌──────────────┐
│verif_docs │ │ experiences  │◄─────────────┐
└───────────┘ └──────┬───────┘              │
                     │                      │
       ┌─────────────┼──────────────┐       │
       │ 1:M         │ 1:M          │ 1:M   │
       ▼             ▼              ▼       │
 ┌───────────┐ ┌───────────┐  ┌───────────┐ │
 │exp_media  │ │  reviews  │  │ favorites │─┘
 └───────────┘ └───────────┘  └───────────┘
```

---

### 3. Core Tables Specification (DDL Equivalent)

#### A. Identity, Accounts & RBAC

```sql
-- Core User Account
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY, -- UUIDv4
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id / PBKDF2 hash
    role VARCHAR(32) NOT NULL DEFAULT 'TRAVELLER', -- 'TRAVELLER', 'PROVIDER', 'ADMIN', 'MODERATOR'
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DELETED'
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255) NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Public & Profile Settings
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    bio TEXT NULL,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'tr', -- 'tr', 'en'
    currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Traveller Explicit Preferences Profile
CREATE TABLE travel_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_preference VARCHAR(64) NOT NULL DEFAULT 'FLEXIBLE', -- 'TURKIYE', 'AEGEAN', 'BLACK_SEA', etc.
    budget_tier VARCHAR(32) NOT NULL DEFAULT 'MODERATE', -- 'VERY_LOW', 'BUDGET', 'MODERATE', 'COMFORTABLE', 'PREMIUM'
    trip_duration VARCHAR(32) NOT NULL DEFAULT 'WEEKEND', -- 'DAY_TRIP', 'WEEKEND', '3_5_DAYS', 'ONE_WEEK', 'TWO_WEEKS_PLUS'
    crowd_tolerance VARCHAR(32) NOT NULL DEFAULT 'VERY_QUIET', -- 'VERY_QUIET', 'SMALL_CROWDS', 'MODERATE', 'LIVELY'
    travel_styles JSON NOT NULL, -- ['SLOW_TRAVEL', 'ARTISAN_CRAFT', 'FOOD_TRAVELLER', 'RURAL', 'NATURE']
    activities JSON NOT NULL, -- ['HIKING', 'COOKING', 'POTTERY', 'FARMING', 'MARKETS']
    transportation JSON NOT NULL, -- ['PUBLIC_TRANSIT', 'WALKING', 'CAR', 'RENTAL_CAR']
    food_preferences JSON NOT NULL, -- ['LOCAL_CUISINE', 'FARM_TO_TABLE', 'VEGETARIAN', 'NO_PREFERENCE']
    activity_level VARCHAR(32) NOT NULL DEFAULT 'MODERATE', -- 'LOW', 'MODERATE', 'HIGH'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### B. Natural Language Requests & Sessions

```sql
-- Traveller Natural Language Travel Requests
CREATE TABLE travel_requests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL REFERENCES users(id) ON DELETE SET NULL, -- Nullable for anonymous guests
    session_id VARCHAR(100) NOT NULL,
    raw_prompt TEXT NOT NULL, -- Original user sentence
    extracted_preferences JSON NOT NULL, -- Parsed schema { budget, crowd, region, transport, etc. }
    extraction_confidence FLOAT NOT NULL DEFAULT 1.0,
    matched_experience_ids JSON NOT NULL, -- Array of UUIDs returned
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### C. Geographic Hierarchy & Privacy-Preserving Locations

```sql
-- 7 Regions of Turkey
CREATE TABLE regions (
    id VARCHAR(32) PRIMARY KEY, -- 'EGE', 'KARADENIZ', 'AKDENIZ', 'IC_ANADOLU', 'MARMARA', 'DOGU_ANADOLU', 'GUNEYDOGU_ANADOLU'
    name_tr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL
);

-- 81 Provinces
CREATE TABLE provinces (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'MUGLA', 'TRABZON', 'KUTAHYA'
    region_id VARCHAR(32) NOT NULL REFERENCES regions(id),
    name_tr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    plate_code INT UNIQUE NOT NULL
);

-- Districts & Villages
CREATE TABLE districts (
    id VARCHAR(64) PRIMARY KEY, -- e.g. 'FETHIYE', 'CAMLIHEMSIN', 'TAVSANLI'
    province_id VARCHAR(32) NOT NULL REFERENCES provinces(id),
    name_tr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    center_lat FLOAT NOT NULL,
    center_lng FLOAT NOT NULL
);

-- Physical Location (Restricted Access) vs Public Fuzzy Centroid
CREATE TABLE locations (
    id VARCHAR(36) PRIMARY KEY,
    district_id VARCHAR(64) NOT NULL REFERENCES districts(id),
    locality_name VARCHAR(150) NOT NULL, -- e.g. "Kayaköy Köyü", "Şenyuva Mahallesi"
    precision_level VARCHAR(32) NOT NULL DEFAULT 'APPROXIMATE', -- 'LOCALITY', 'APPROXIMATE', 'EXACT'
    -- PUBLIC FUZZY COORDINATES (Displayed on map, jittered by 2-5km)
    public_lat FLOAT NOT NULL,
    public_lng FLOAT NOT NULL,
    -- EXACT RESIDENTIAL COORDINATES (Never serialized to public APIs)
    exact_lat FLOAT NULL,
    exact_lng FLOAT NULL,
    exact_address_encrypted TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### D. Local Experience Providers & Trust Architecture

```sql
CREATE TABLE providers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_or_artisan_name VARCHAR(200) NOT NULL,
    provider_type VARCHAR(64) NOT NULL, -- 'ARTISAN', 'FARMER', 'VILLAGE_HOST', 'LOCAL_GUIDE', 'FAMILY_BUSINESS', 'PRODUCER'
    verification_status VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED', -- 'UNVERIFIED', 'PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED'
    trust_tier VARCHAR(32) NOT NULL DEFAULT 'NEW_PROVIDER', -- 'NEW_PROVIDER', 'IDENTITY_VERIFIED', 'COMMUNITY_VERIFIED', 'MASTER_ARTISAN'
    years_active INT NOT NULL DEFAULT 1,
    verified_at TIMESTAMP NULL,
    verified_by VARCHAR(36) NULL REFERENCES users(id),
    public_phone VARCHAR(32) NULL, -- Optional public business contact
    languages_spoken JSON NOT NULL, -- ['tr', 'en']
    bio TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Private Verification Documents Vault (Admin Access Only)
CREATE TABLE verification_documents (
    id VARCHAR(36) PRIMARY KEY,
    provider_id VARCHAR(36) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL, -- 'IDENTITY_DOC', 'TAX_CERTIFICATE', 'ARTISAN_CHAMBER_REGISTRY', 'MUNICIPALITY_PERMIT', 'COMMUNITY_REFERENCE'
    file_path VARCHAR(500) NOT NULL,
    original_filename_hash VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'APPROVED', 'REJECTED'
    rejection_reason TEXT NULL,
    reviewed_by VARCHAR(36) NULL REFERENCES users(id),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### E. Experiences & Media

```sql
CREATE TABLE experiences (
    id VARCHAR(36) PRIMARY KEY,
    provider_id VARCHAR(36) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    location_id VARCHAR(36) NOT NULL REFERENCES locations(id),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'LOCAL_FOOD', 'CRAFTS', 'RURAL_LIFE', 'NATURE_HIKING', 'CULTURAL_HERITAGE'
    short_description VARCHAR(300) NOT NULL,
    full_description TEXT NOT NULL,
    content_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'
    
    -- Matching Criteria Attributes
    budget_tier VARCHAR(32) NOT NULL, -- 'VERY_LOW', 'BUDGET', 'MODERATE', 'COMFORTABLE', 'PREMIUM'
    approximate_price_try INT NOT NULL, -- In Turkish Lira
    duration_hours FLOAT NOT NULL, -- e.g. 2.5
    crowd_level VARCHAR(32) NOT NULL, -- 'VERY_QUIET', 'SMALL_GROUP', 'MODERATE'
    activity_level VARCHAR(32) NOT NULL, -- 'LOW', 'MODERATE', 'HIGH'
    travel_styles JSON NOT NULL, -- e.g. ['SLOW_TRAVEL', 'ARTISAN_CRAFT']
    suitable_interests JSON NOT NULL, -- e.g. ['POTTERY', 'VILLAGE_LIFE', 'HISTORY']
    transportation_accessibility JSON NOT NULL, -- e.g. ['PUBLIC_BUS', 'WALKING_DISTANCE', 'CAR_RECOMMENDED']
    dietary_options JSON NOT NULL, -- e.g. ['VEGETARIAN_FRIENDLY', 'LOCAL_PRODUCE', 'VEGAN_ON_REQUEST']
    
    group_capacity_min INT NOT NULL DEFAULT 1,
    group_capacity_max INT NOT NULL DEFAULT 8,
    is_sustainable_certified BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo_seed BOOLEAN NOT NULL DEFAULT FALSE, -- Flag for demonstration fixtures
    rating_avg FLOAT NOT NULL DEFAULT 0.0,
    review_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experience_media (
    id VARCHAR(36) PRIMARY KEY,
    experience_id VARCHAR(36) NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(255) NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    exif_stripped BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### F. Reviews, Trips, Favorites & Reports

```sql
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    experience_id VARCHAR(36) NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    traveller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    attended_date DATE NOT NULL,
    verified_booking BOOLEAN NOT NULL DEFAULT TRUE,
    provider_response TEXT NULL,
    provider_responded_at TIMESTAMP NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'FLAGGED', 'REMOVED'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experience_id VARCHAR(36) NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, experience_id)
);

CREATE TABLE trips (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    target_region VARCHAR(64) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_items (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    experience_id VARCHAR(36) NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    day_number INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36) NOT NULL REFERENCES users(id),
    target_type VARCHAR(32) NOT NULL, -- 'EXPERIENCE', 'PROVIDER', 'REVIEW'
    target_id VARCHAR(36) NOT NULL,
    reason VARCHAR(64) NOT NULL, -- 'MISLEADING_LOCATION', 'OVERCROWDED_TOURIST_TRAP', 'SAFETY_CONCERN', 'FRAUD', 'OFFENSIVE'
    details TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'
    resolved_by VARCHAR(36) NULL REFERENCES users(id),
    resolution_notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);
```

#### G. Security, Auditing & Recommendation Logging

```sql
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    actor_id VARCHAR(36) NULL, -- NULL if system action
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL, -- e.g. 'APPROVE_VERIFICATION', 'SUSPEND_LISTING', 'DELETE_USER'
    resource_type VARCHAR(64) NOT NULL, -- 'PROVIDER', 'EXPERIENCE', 'USER'
    resource_id VARCHAR(36) NOT NULL,
    ip_hash VARCHAR(64) NOT NULL, -- Anonymized one-way hash of client IP
    details JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_events (
    id VARCHAR(36) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL, -- 'FAILED_LOGIN', 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_VELOCITY', 'EXIF_METADATA_STRIPPED'
    severity VARCHAR(32) NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
    ip_hash VARCHAR(64) NOT NULL,
    user_id VARCHAR(36) NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
