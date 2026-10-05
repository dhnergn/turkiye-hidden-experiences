/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * API Request / Response Types & Zod-Ready DTO Definitions
 */

import {
  PublicExperienceDTO,
  TravelPreferences,
  UserRole,
  VerificationStatus,
  ReportReason,
  AuditLog,
  Report,
} from './database';

// Global API Response Envelope
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    request_id: string;
    timestamp: string;
  };
}

// Auth DTOs
export interface RegisterRequestDTO {
  email: string;
  password: string;
  display_name: string;
  role: 'TRAVELLER' | 'PROVIDER';
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface AuthSuccessDTO {
  user: {
    id: string;
    email: string;
    role: UserRole;
    display_name: string;
    avatar_url?: string;
    provider_id?: string;
  };
  token: string;
}

// Travel Request DTOs
export interface TravelRequestParseDTO {
  prompt: string;
}

export interface ExtractedTravelPreferencesDTO {
  destination?: string;
  budget_tier?: 'VERY_LOW' | 'BUDGET' | 'MODERATE' | 'COMFORTABLE' | 'PREMIUM';
  trip_duration?: 'DAY_TRIP' | 'WEEKEND' | '3_5_DAYS' | 'ONE_WEEK' | 'TWO_WEEKS_PLUS';
  crowd_tolerance?: 'VERY_QUIET' | 'SMALL_CROWDS' | 'MODERATE' | 'LIVELY';
  transportation?: string[];
  travel_styles?: string[];
  activities?: string[];
  food_preferences?: string[];
  activity_level?: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface RecommendationMatchDTO {
  experience: PublicExperienceDTO;
  match_score: number; // 0-100
  match_explanation: string;
  dimension_scores: {
    destination: number;
    budget: number;
    interests: number;
    crowd: number;
    travel_style: number;
    transportation: number;
    activity: number;
    food: number;
  };
}

export interface TravelRequestResponseDTO {
  request_id: string;
  extracted_preferences: ExtractedTravelPreferencesDTO;
  recommendations: RecommendationMatchDTO[];
}

// Experience Creation DTO
export interface CreateExperienceDTO {
  title: string;
  category: 'LOCAL_FOOD' | 'CRAFTS' | 'RURAL_LIFE' | 'NATURE_HIKING' | 'CULTURAL_HERITAGE';
  district_id: string;
  locality_name: string;
  budget_tier: 'VERY_LOW' | 'BUDGET' | 'MODERATE' | 'COMFORTABLE' | 'PREMIUM';
  approximate_price_try: number;
  duration_hours: number;
  crowd_level: 'VERY_QUIET' | 'SMALL_CROWDS' | 'MODERATE' | 'LIVELY';
  activity_level: 'LOW' | 'MODERATE' | 'HIGH';
  travel_styles: string[];
  suitable_interests: string[];
  transportation_accessibility: string[];
  dietary_options: string[];
  short_description: string;
  full_description: string;
  group_capacity_min: number;
  group_capacity_max: number;
  media_urls?: string[];
}

// Report DTO
export interface CreateReportDTO {
  target_type: 'EXPERIENCE' | 'PROVIDER' | 'REVIEW';
  target_id: string;
  reason: ReportReason;
  details: string;
}

// Admin DTOs
export interface UpdateVerificationDTO {
  status: VerificationStatus;
  rejection_reason?: string;
  notes?: string;
}

export interface AdminDashboardDataDTO {
  pending_verifications: number;
  pending_experiences: number;
  open_reports: number;
  total_users: number;
  recent_audit_logs: AuditLog[];
  open_reports_list: Report[];
}
