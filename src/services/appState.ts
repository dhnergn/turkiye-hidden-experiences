/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * In-Memory State Manager & Repository (Zero External Cost Target)
 * 
 * Implements RBAC, verification auditing, security logging, and KVKK exports.
 */

import {
  PublicExperienceDTO,
  User,
  Provider,
  Review,
  Report,
  AuditLog,
  SecurityEvent,
  VerificationStatus,
  ContentStatus,
} from '../types/database';
import { INITIAL_EXPERIENCES } from '../data/seedData';
import { CreateExperienceDTO, CreateReportDTO } from '../types/api';

// Current session user simulation
export interface CurrentSessionUser {
  id: string;
  email: string;
  role: 'TRAVELLER' | 'PROVIDER' | 'ADMIN';
  display_name: string;
  provider_id?: string;
}

class AppStateRepository {
  private experiences: PublicExperienceDTO[] = [...INITIAL_EXPERIENCES];
  private favorites: Set<string> = new Set(['exp-01-kayakoy-soap']); // pre-seed one for demo
  private savedTrip: { id: string; title: string; items: { experienceId: string; day: number; notes: string }[] } = {
    id: 'trip-1',
    title: 'Ege & Marmara Saklı Rota',
    items: [
      { experienceId: 'exp-01-kayakoy-soap', day: 1, notes: 'Öğleden sonra taş ev sabun atölyesi' },
      { experienceId: 'exp-03-kazdaglari-herb-cheese', day: 2, notes: 'Sabah köy yürüyüşü ve ot toplama' },
    ],
  };

  private auditLogs: AuditLog[] = [
    {
      id: 'audit-01',
      actor_id: 'admin-01',
      actor_role: 'ADMIN',
      action: 'APPROVE_VERIFICATION',
      resource_type: 'PROVIDER',
      resource_id: 'prov-01-fatma-ana',
      ip_hash: 'e3b0c44298fc1c149afbf4c8996fb924',
      details: { reason: 'Geleneksel üretici belgesi onaylandı' },
      created_at: '2026-09-20T10:00:00Z',
    },
    {
      id: 'audit-02',
      actor_id: 'admin-01',
      actor_role: 'ADMIN',
      action: 'APPROVE_EXPERIENCE',
      resource_type: 'EXPERIENCE',
      resource_id: 'exp-02-camlihemsin-tea-honey',
      ip_hash: 'e3b0c44298fc1c149afbf4c8996fb924',
      details: { reason: 'Yerel çay hasadı lokasyon gizliliği kontrol edildi' },
      created_at: '2026-09-22T14:30:00Z',
    },
  ];

  private reports: Report[] = [
    {
      id: 'rep-01',
      reporter_id: 'user-traveller-02',
      target_type: 'EXPERIENCE',
      target_id: 'exp-04-kutahya-cini-clay',
      reason: 'MISLEADING_LOCATION',
      details: 'Harita konumu atölyenin yaklaşık 3km uzağını gösteriyor, servis dolmuş durağı netleşmeli.',
      status: 'INVESTIGATING',
      created_at: '2026-09-24T09:15:00Z',
    },
  ];

  private securityEvents: SecurityEvent[] = [
    {
      id: 'sec-01',
      event_type: 'EXIF_METADATA_STRIPPED',
      severity: 'INFO',
      ip_hash: '9a81c44298fc1c149afbf4c8996fb111',
      metadata: { filename: 'kayakoy-avlusu.jpg', stripped_tags: ['GPSLatitude', 'GPSLongitude', 'CameraSerial'] },
      created_at: '2026-09-25T11:20:00Z',
    },
  ];

  // Current logged in demo persona
  private currentUser: CurrentSessionUser = {
    id: 'user-01-deniz',
    email: 'deniz.gezgin@example.com',
    role: 'TRAVELLER',
    display_name: 'Deniz Yılmaz',
  };

  // Getters
  getExperiences(): PublicExperienceDTO[] {
    return this.experiences.filter(e => e.content_status === 'APPROVED');
  }

  getAllExperiencesForAdmin(): PublicExperienceDTO[] {
    return this.experiences;
  }

  getCurrentUser(): CurrentSessionUser {
    return this.currentUser;
  }

  setCurrentRole(role: 'TRAVELLER' | 'PROVIDER' | 'ADMIN') {
    if (role === 'TRAVELLER') {
      this.currentUser = {
        id: 'user-01-deniz',
        email: 'deniz.gezgin@example.com',
        role: 'TRAVELLER',
        display_name: 'Deniz Yılmaz (Gezgin)',
      };
    } else if (role === 'PROVIDER') {
      this.currentUser = {
        id: 'user-02-fatma',
        email: 'fatma.sabun@example.com',
        role: 'PROVIDER',
        display_name: 'Fatma Hanım (Yerel Üretici)',
        provider_id: 'prov-01-fatma-ana',
      };
    } else {
      this.currentUser = {
        id: 'user-admin-01',
        email: 'moderasyon@saklideneyimler.com',
        role: 'ADMIN',
        display_name: 'Moderatör / Admin',
      };
    }
  }

  // Favorites
  getFavorites(): string[] {
    return Array.from(this.favorites);
  }

  toggleFavorite(experienceId: string): boolean {
    if (this.favorites.has(experienceId)) {
      this.favorites.delete(experienceId);
      return false;
    } else {
      this.favorites.add(experienceId);
      return true;
    }
  }

  // Saved Trip / Itinerary
  getSavedTrip() {
    return this.savedTrip;
  }

  addToTrip(experienceId: string, day: number = 1, notes: string = '') {
    const existing = this.savedTrip.items.find(i => i.experienceId === experienceId);
    if (!existing) {
      this.savedTrip.items.push({ experienceId, day, notes });
    }
  }

  removeFromTrip(experienceId: string) {
    this.savedTrip.items = this.savedTrip.items.filter(i => i.experienceId !== experienceId);
  }

  // Experience Submission (Provider)
  createExperience(dto: CreateExperienceDTO): PublicExperienceDTO {
    const newExp: PublicExperienceDTO = {
      id: `exp-${Date.now()}`,
      provider_id: this.currentUser.provider_id || 'prov-new',
      location_id: `loc-${Date.now()}`,
      title: dto.title,
      slug: dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: dto.category,
      short_description: dto.short_description,
      full_description: dto.full_description,
      content_status: 'PENDING_REVIEW', // Mandatory moderation queue
      budget_tier: dto.budget_tier,
      approximate_price_try: dto.approximate_price_try,
      duration_hours: dto.duration_hours,
      crowd_level: dto.crowd_level,
      activity_level: dto.activity_level,
      travel_styles: dto.travel_styles,
      suitable_interests: dto.suitable_interests,
      transportation_accessibility: dto.transportation_accessibility,
      dietary_options: dto.dietary_options,
      group_capacity_min: dto.group_capacity_min,
      group_capacity_max: dto.group_capacity_max,
      is_sustainable_certified: true,
      is_demo_seed: false,
      rating_avg: 5.0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location: {
        province_name_tr: 'Yerel Bölge',
        province_name_en: 'Local Region',
        district_name_tr: dto.locality_name,
        district_name_en: dto.locality_name,
        locality_name: dto.locality_name,
        public_lat: 38.0 + (Math.random() - 0.5) * 2, // Fuzzed
        public_lng: 30.0 + (Math.random() - 0.5) * 2,
        precision_level: 'APPROXIMATE',
      },
      provider: {
        business_or_artisan_name: this.currentUser.display_name,
        provider_type: 'ARTISAN',
        verification_status: 'VERIFIED',
        trust_tier: 'COMMUNITY_VERIFIED',
        years_active: 5,
      },
      media: (dto.media_urls || []).map((url, i) => ({
        id: `m-${i}`,
        experience_id: `exp-${Date.now()}`,
        url,
        caption: dto.title,
        is_primary: i === 0,
        exif_stripped: true,
        created_at: new Date().toISOString(),
      })),
    };

    this.experiences.unshift(newExp);

    // Audit log
    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor_id: this.currentUser.id,
      actor_role: this.currentUser.role,
      action: 'SUBMIT_EXPERIENCE',
      resource_type: 'EXPERIENCE',
      resource_id: newExp.id,
      ip_hash: 'hashed_provider_ip',
      details: { title: newExp.title },
      created_at: new Date().toISOString(),
    });

    return newExp;
  }

  // Admin Actions
  updateExperienceStatus(id: string, status: ContentStatus, notes?: string) {
    const exp = this.experiences.find(e => e.id === id);
    if (exp) {
      exp.content_status = status;
      this.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actor_id: this.currentUser.id,
        actor_role: 'ADMIN',
        action: `SET_STATUS_${status}`,
        resource_type: 'EXPERIENCE',
        resource_id: id,
        ip_hash: 'admin_ip_secure_hash',
        details: { notes },
        created_at: new Date().toISOString(),
      });
    }
  }

  // Reports
  createReport(dto: CreateReportDTO) {
    const report: Report = {
      id: `rep-${Date.now()}`,
      reporter_id: this.currentUser.id,
      target_type: dto.target_type,
      target_id: dto.target_id,
      reason: dto.reason,
      details: dto.details,
      status: 'OPEN',
      created_at: new Date().toISOString(),
    };
    this.reports.unshift(report);
  }

  getReports(): Report[] {
    return this.reports;
  }

  resolveReport(id: string, resolutionNotes: string) {
    const rep = this.reports.find(r => r.id === id);
    if (rep) {
      rep.status = 'RESOLVED';
      rep.resolved_by = this.currentUser.id;
      rep.resolution_notes = resolutionNotes;
      rep.resolved_at = new Date().toISOString();
    }
  }

  // Audit and Security Logs
  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  getSecurityEvents(): SecurityEvent[] {
    return this.securityEvents;
  }

  // KVKK / GDPR Data Export
  exportPersonalData() {
    return {
      export_version: '1.0-KVKK-GDPR',
      timestamp: new Date().toISOString(),
      user: this.currentUser,
      saved_favorites: Array.from(this.favorites),
      saved_trip: this.savedTrip,
      audit_records: this.auditLogs.filter(a => a.actor_id === this.currentUser.id),
      disclaimer: 'Bu veri paketi KVKK 11. Madde ve GDPR 20. Madde uyarınca şeffaflık amacıyla oluşturulmuştur.',
    };
  }
}

export const appState = new AppStateRepository();
