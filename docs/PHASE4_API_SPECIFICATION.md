# Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
## Phase 4: REST API Specification & Endpoint Contracts

---

### 1. Architectural Conventions & Global Standards

- **Base URL Prefix**: `/api/v1`
- **Wire Format**: Strict `application/json` (UTF-8).
- **Authentication**:
  - `Authorization: Bearer <access_token>` header for stateless requests.
  - Refresh tokens exchanged via `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Uniform Error Envelope**:
  All non-2xx responses return a standardized, non-leaking JSON envelope:
  ```json
  {
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "The requested experience does not exist or has been suspended.",
      "request_id": "req-9b81-42e1-8a90",
      "timestamp": "2026-09-26T11:40:00Z"
    }
  }
  ```
- **Correlation ID**: Every incoming HTTP request is assigned an `X-Request-Id` UUID header echoed in every response and security log.
- **Privacy Guarantees**: Public endpoints **never** serialize `exact_lat`, `exact_lng`, `exact_address_encrypted`, `password_hash`, or verification file paths.

---

### 2. Tiered Rate Limiting Schedule

| Endpoint Category | Window | Max Requests | Enforcement Strategy |
|---|---|---|---|
| **Authentication** (`/auth/login`, `/auth/register`) | 15 min | 5 per IP / Account | Lockout counter, generic error message |
| **AI Travel Request** (`/travel-requests/parse`) | 10 min | 10 per IP / Account | Tokenizer fallback if quota exceeded |
| **Search & Discovery** (`/experiences`, `/map/clusters`) | 1 min | 60 per IP | Cached cluster boundary responses |
| **Experience CRUD & Media Upload** (`/experiences`, `/upload`) | 10 min | 20 per Provider | File signature & MIME inspection |
| **Reviews & Reporting** (`/reviews`, `/reports`) | 1 hour | 10 per Traveller | Velocity check against spam |
| **Administrative & Moderation** (`/admin/*`) | 1 min | 120 per Admin | Session audit & IP monitoring |

---

### 3. API Endpoints Specification

#### A. Authentication & User Profile (`/auth`, `/me`)

##### 1. `POST /api/v1/auth/register`
- **Access**: Public
- **Rate Limit**: Auth Tier
- **Request Body**:
  ```json
  {
    "email": "traveller@example.com",
    "password": "SecurePassword123!",
    "display_name": "Deniz Yılmaz",
    "role": "TRAVELLER" // 'TRAVELLER' or 'PROVIDER' (ADMIN strictly rejected)
  }
  ```
- **Responses**:
  - `201 Created`: `{ "user": { "id": "...", "email": "...", "role": "TRAVELLER" }, "token": "..." }`
  - `400 Bad Request`: Validation failure (weak password, invalid email).
  - `409 Conflict`: Generic response: `"Registration failed. Please check your credentials or try logging in."` (Mitigates account enumeration).

##### 2. `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "traveller@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "user": { "id": "...", "email": "...", "role": "...", "display_name": "..." }, "token": "..." }`
  - `401 Unauthorized`: Constant-time generic error `"Invalid email or password"`.

##### 3. `GET /api/v1/me`
- **Access**: Authenticated
- **Returns**: Current profile, role, preferences, and provider status if applicable.

##### 4. `PATCH /api/v1/me/preferences`
- **Access**: Authenticated (Traveller)
- **Request Body**: Partial `TravelPreferences` (budget, crowd tolerance, duration, styles, activities, transport, dietary).

---

#### B. Natural Language Travel Requests & Preferences (`/travel-requests`)

##### 1. `POST /api/v1/travel-requests/parse`
- **Description**: Parses an unstructured Turkish or English travel wish into structured criteria, queries the deterministic recommendation engine, and returns matched experiences with explainability strings.
- **Access**: Public / Authenticated
- **Rate Limit**: AI Request Tier
- **Request Body**:
  ```json
  {
    "prompt": "3 günüm var, 5000 TL bütçem var. Ege tarafında sakin, arabasız gidilebilecek, geleneksel yemek ve atölye olan bir yer istiyorum."
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "request_id": "req-8b9a12c4",
      "extracted_preferences": {
        "destination": "EGE",
        "budget_tier": "BUDGET",
        "trip_duration": "3_5_DAYS",
        "crowd_tolerance": "VERY_QUIET",
        "transportation": ["PUBLIC_TRANSIT", "WALKING"],
        "travel_styles": ["SLOW_TRAVEL", "ARTISAN_CRAFT", "FOOD_TRAVELLER"],
        "activities": ["COOKING", "POTTERY", "VILLAGE_LIFE"],
        "activity_level": "LOW"
      },
      "recommendations": [
        {
          "experience": { "id": "exp-1", "title": "Geleneksel Çömlek Atölyesi", "..." : "..." },
          "match_score": 92,
          "match_explanation": "Sakin ve kalabalıktan uzak tercihinize, toplu taşımayla erişilebilirliğe ve el sanatları ilginize uyduğu için önerildi."
        }
      ]
    }
    ```

---

#### C. Experience Catalog & Recommendations (`/experiences`)

##### 1. `GET /api/v1/experiences`
- **Access**: Public
- **Query Parameters**:
  - `region`: (e.g. `EGE`, `KARADENIZ`)
  - `category`: (e.g. `LOCAL_FOOD`, `CRAFTS`, `RURAL_LIFE`, `NATURE_HIKING`, `CULTURAL_HERITAGE`)
  - `budget_tier`: (`VERY_LOW`, `BUDGET`, `MODERATE`, `COMFORTABLE`, `PREMIUM`)
  - `crowd_level`: (`VERY_QUIET`, `SMALL_GROUP`, `MODERATE`)
  - `search`: Full-text search term
  - `page`: Default 1, `limit`: Default 20
- **Returns**: Array of `PublicExperienceDTO` with fuzzy/approximate geographic coordinates.
- **Privacy Enforcement**: Experiences in `DRAFT` or `PENDING_REVIEW` are hidden from public queries.

##### 2. `GET /api/v1/experiences/:id`
- **Access**: Public
- **Returns**: Detailed `PublicExperienceDTO`, provider trust badges, reviews summary, and fuzzy coordinates.

##### 3. `POST /api/v1/experiences`
- **Access**: Authenticated (Provider or Admin)
- **Request Body**:
  ```json
  {
    "title": "Kayaköy Taş Evinde Zeytinyağı ve Sabun Atölyesi",
    "category": "CRAFTS",
    "district_id": "FETHIYE",
    "locality_name": "Kayaköy Köyü",
    "budget_tier": "MODERATE",
    "approximate_price_try": 650,
    "duration_hours": 3.0,
    "crowd_level": "VERY_QUIET",
    "activity_level": "LOW",
    "travel_styles": ["SLOW_TRAVEL", "RURAL", "ARTISAN_CRAFT"],
    "suitable_interests": ["OLIVE_FARMING", "SOAP_MAKING", "VILLAGE_LIFE"],
    "transportation_accessibility": ["PUBLIC_BUS", "WALKING_DISTANCE"],
    "dietary_options": ["LOCAL_PRODUCE", "VEGETARIAN_FRIENDLY"],
    "short_description": "Asırlık zeytin ağaçları arasında geleneksel soğuk sıkım sabun yapımı.",
    "full_description": "...",
    "group_capacity_min": 2,
    "group_capacity_max": 6,
    "media_urls": ["/uploads/exp-1.webp"]
  }
  ```
- **Returns**: `201 Created` with `content_status: "PENDING_REVIEW"`. Automatically schedules moderator review.

##### 4. `PATCH /api/v1/experiences/:id`
- **Access**: Authenticated (Owner Provider or Admin)
- **IDOR Check**: Validates `experience.provider.user_id === req.user.id || req.user.role === 'ADMIN'`.

---

#### D. Map & Spatial Privacy Endpoints (`/map`)

##### 1. `GET /api/v1/map/clusters`
- **Access**: Public
- **Query Parameters**: `bbox` (minLat, minLng, maxLat, maxLng), `zoom`
- **Security & Privacy Behavior**:
  - Does NOT return raw coordinates.
  - Groups experiences into privacy-safe regional/district cluster centroids.
  - Individual pins feature randomized 2-3km centroid jitter, preventing reverse-engineering of private farms.

---

#### E. Reviews, Favorites & Reports (`/reviews`, `/favorites`, `/reports`)

##### 1. `POST /api/v1/experiences/:id/reviews`
- **Access**: Authenticated (Traveller)
- **Validation**: Rating (1-5), comment (min 10 chars, max 2000 chars), attended date.

##### 2. `POST /api/v1/experiences/:id/favorite`
- **Access**: Authenticated (Traveller)
- **Returns**: Toggle status `{ "favorited": true }`.

##### 3. `POST /api/v1/reports`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "target_type": "EXPERIENCE",
    "target_id": "exp-123",
    "reason": "OVERCROWDED_TOURIST_TRAP",
    "details": "Listed as quiet village craft but was a crowded commercial bus tour."
  }
  ```
- **Returns**: `201 Created`, opens incident for moderation.

---

#### F. Provider Verification Workflow (`/providers/verification`)

##### 1. `POST /api/v1/providers/verification/submit`
- **Access**: Authenticated (Provider)
- **Request Body**:
  ```json
  {
    "document_type": "ARTISAN_CHAMBER_REGISTRY",
    "file_path": "/uploads/private/vault-doc-9a81.pdf"
  }
  ```
- **Audit Action**: Transitions provider `verification_status` to `PENDING` and logs audit entry.

---

#### G. Admin & Moderation Operations (`/admin`)

##### 1. `GET /api/v1/admin/verifications`
- **Access**: Admin / Moderator
- **Returns**: Pending provider verification queues and documents.

##### 2. `PATCH /api/v1/admin/verifications/:id`
- **Access**: Admin / Moderator
- **Request Body**: `{ "status": "APPROVED", "notes": "Artisan chamber registration verified." }`
- **Audit Action**: Generates immutable `audit_logs` record with reviewer ID, IP hash, and diff.

##### 3. `GET /api/v1/admin/reports`
- **Access**: Admin / Moderator
- **Returns**: Open community reports.

##### 4. `GET /api/v1/admin/audit-logs`
- **Access**: Admin
- **Returns**: Paginated security and moderation audit trail.

---

#### H. Privacy, Data Export & Account Deletion (`/privacy`)

##### 1. `GET /api/v1/privacy/export`
- **Access**: Authenticated
- **Returns**: Machine-readable JSON package of user profile, saved trips, preferences, and reviews under KVKK/GDPR.

##### 2. `POST /api/v1/privacy/delete-account`
- **Access**: Authenticated
- **Returns**: Anonymizes user PII, removes verification documents, flags status `DELETED`.
