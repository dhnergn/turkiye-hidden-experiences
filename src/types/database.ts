/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Unified Relational Database TypeScript Definitions & Enums
 */

// --- RBAC & Accounts ---
export type UserRole = 'TRAVELLER' | 'PROVIDER' | 'ADMIN' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string; // UUIDv4
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  mfa_enabled: boolean;
  failed_login_attempts: number;
  lockout_until?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  preferred_language: 'tr' | 'en';
  currency: 'TRY' | 'USD' | 'EUR';
  created_at: string;
  updated_at: string;
}

// --- Travel Preferences ---
export type BudgetTier = 'VERY_LOW' | 'BUDGET' | 'MODERATE' | 'COMFORTABLE' | 'PREMIUM';
export type TripDuration = 'DAY_TRIP' | 'WEEKEND' | '3_5_DAYS' | 'ONE_WEEK' | 'TWO_WEEKS_PLUS';
export type CrowdTolerance = 'VERY_QUIET' | 'SMALL_CROWDS' | 'MODERATE' | 'LIVELY';
export type ActivityLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface TravelPreferences {
  id: string;
  user_id: string;
  destination_preference: string; // Region or Province code, or 'FLEXIBLE'
  budget_tier: BudgetTier;
  trip_duration: TripDuration;
  crowd_tolerance: CrowdTolerance;
  travel_styles: string[]; // 'SLOW_TRAVEL', 'ARTISAN_CRAFT', 'FOOD_TRAVELLER', etc.
  activities: string[]; // 'HIKING', 'POTTERY', 'COOKING', 'FARMING', etc.
  transportation: string[]; // 'PUBLIC_TRANSIT', 'WALKING', 'CAR', etc.
  food_preferences: string[]; // 'LOCAL_CUISINE', 'FARM_TO_TABLE', 'VEGETARIAN', etc.
  activity_level: ActivityLevel;
  created_at: string;
  updated_at: string;
}

// --- Geography & Location Privacy ---
export type TurkishRegionId = 'EGE' | 'KARADENIZ' | 'AKDENIZ' | 'IC_ANADOLU' | 'MARMARA' | 'DOGU_ANADOLU' | 'GUNEYDOGU_ANADOLU';

export interface Region {
  id: TurkishRegionId;
  name_tr: string;
  name_en: string;
  slug: string;
}

export interface Province {
  id: string; // e.g. 'MUGLA'
  region_id: TurkishRegionId;
  name_tr: string;
  name_en: string;
  plate_code: number;
}

export interface District {
  id: string; // e.g. 'FETHIYE'
  province_id: string;
  name_tr: string;
  name_en: string;
  center_lat: number;
  center_lng: number;
}

export type LocationPrecision = 'LOCALITY' | 'APPROXIMATE' | 'EXACT';

export interface LocationRecord {
  id: string;
  district_id: string;
  locality_name: string; // e.g. "Kayaköy", "Şenyuva"
  precision_level: LocationPrecision;
  // Public coordinates (Jittered centroid for map view)
  public_lat: number;
  public_lng: number;
  // Exact coordinates (Locked behind strict authorization)
  exact_lat?: number | null;
  exact_lng?: number | null;
  exact_address_encrypted?: string | null;
  created_at: string;
}

// --- Providers & Trust ---
export type ProviderType = 'ARTISAN' | 'FARMER' | 'VILLAGE_HOST' | 'LOCAL_GUIDE' | 'FAMILY_BUSINESS' | 'PRODUCER';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
export type TrustTier = 'NEW_PROVIDER' | 'IDENTITY_VERIFIED' | 'COMMUNITY_VERIFIED' | 'MASTER_ARTISAN';

export interface Provider {
  id: string;
  user_id: string;
  business_or_artisan_name: string;
  provider_type: ProviderType;
  verification_status: VerificationStatus;
  trust_tier: TrustTier;
  years_active: number;
  verified_at?: string | null;
  verified_by?: string | null;
  public_phone?: string | null;
  languages_spoken: string[];
  bio: string;
  created_at: string;
  updated_at: string;
}

export type VerificationDocType = 'IDENTITY_DOC' | 'TAX_CERTIFICATE' | 'ARTISAN_CHAMBER_REGISTRY' | 'MUNICIPALITY_PERMIT' | 'COMMUNITY_REFERENCE';
export type DocStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface VerificationDocument {
  id: string;
  provider_id: string;
  document_type: VerificationDocType;
  file_path: string;
  original_filename_hash: string;
  status: DocStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

// --- Experiences ---
export type ExperienceCategory = 'LOCAL_FOOD' | 'CRAFTS' | 'RURAL_LIFE' | 'NATURE_HIKING' | 'CULTURAL_HERITAGE';
export type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface ExperienceMedia {
  id: string;
  experience_id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  exif_stripped: boolean;
  created_at: string;
}

export interface Experience {
  id: string;
  provider_id: string;
  location_id: string;
  title: string;
  slug: string;
  category: ExperienceCategory;
  short_description: string;
  full_description: string;
  content_status: ContentStatus;
  budget_tier: BudgetTier;
  approximate_price_try: number;
  duration_hours: number;
  crowd_level: CrowdTolerance;
  activity_level: ActivityLevel;
  travel_styles: string[];
  suitable_interests: string[];
  transportation_accessibility: string[];
  dietary_options: string[];
  group_capacity_min: number;
  group_capacity_max: number;
  is_sustainable_certified: boolean;
  is_demo_seed: boolean; // Flags safe fictional mock data
  rating_avg: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

// Public Representation of an Experience (with joined details and privacy-safe location)
export interface PublicExperienceDTO extends Experience {
  location: {
    province_name_tr: string;
    province_name_en: string;
    district_name_tr: string;
    district_name_en: string;
    locality_name: string;
    public_lat: number;
    public_lng: number;
    precision_level: LocationPrecision;
  };
  provider: {
    business_or_artisan_name: string;
    provider_type: ProviderType;
    verification_status: VerificationStatus;
    trust_tier: TrustTier;
    years_active: number;
  };
  media: ExperienceMedia[];
  match_explanation?: string; // Generated per-traveller
  match_score?: number; // 0-100 internally calculated
}

// --- Reviews, Trips, Favorites & Reports ---
export interface Review {
  id: string;
  experience_id: string;
  traveller_id: string;
  traveller_name: string;
  rating: number; // 1-5
  comment: string;
  attended_date: string;
  verified_booking: boolean;
  provider_response?: string | null;
  provider_responded_at?: string | null;
  status: 'PUBLISHED' | 'FLAGGED' | 'REMOVED';
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  experience_id: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  target_region?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripItem {
  id: string;
  trip_id: string;
  experience_id: string;
  day_number: number;
  order_index: number;
  notes?: string | null;
  created_at: string;
}

export type ReportReason = 'MISLEADING_LOCATION' | 'OVERCROWDED_TOURIST_TRAP' | 'SAFETY_CONCERN' | 'FRAUD' | 'OFFENSIVE';
export type ReportStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'EXPERIENCE' | 'PROVIDER' | 'REVIEW';
  target_id: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

// --- Auditing & Security Logs ---
export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_hash: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: 'FAILED_LOGIN' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_VELOCITY' | 'EXIF_METADATA_STRIPPED' | 'UNAUTHORIZED_ACCESS';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ip_hash: string;
  user_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}
