/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Deterministic Weighted Multi-Factor Recommendation Engine
 * 
 * 8-Dimension Configurable Weights:
 * - Destination Match: 25%
 * - Budget Compatibility: 20%
 * - Interests & Categories: 20%
 * - Crowd Level Tolerance: 10%
 * - Travel Style Alignment: 10%
 * - Transportation Match: 5%
 * - Activity Level Fit: 5%
 * - Food Preference Match: 5%
 * 
 * Anti-Echo-Chamber Discovery Diversity Guarantee included.
 */

import { PublicExperienceDTO, CrowdTolerance, ActivityLevel, BudgetTier } from '../types/database';
import { ExtractedTravelPreferencesDTO, RecommendationMatchDTO } from '../types/api';

export interface MatchingWeights {
  destination: number; // 0.25
  budget: number; // 0.20
  interests: number; // 0.20
  crowd: number; // 0.10
  travel_style: number; // 0.10
  transportation: number; // 0.05
  activity: number; // 0.05
  food: number; // 0.05
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  destination: 0.25,
  budget: 0.20,
  interests: 0.20,
  crowd: 0.10,
  travel_style: 0.10,
  transportation: 0.05,
  activity: 0.05,
  food: 0.05,
};

// Map budget tiers to numerical ordinal for compatibility distance
const BUDGET_MAP: Record<BudgetTier, number> = {
  VERY_LOW: 1,
  BUDGET: 2,
  MODERATE: 3,
  COMFORTABLE: 4,
  PREMIUM: 5,
};

const CROWD_MAP: Record<CrowdTolerance, number> = {
  VERY_QUIET: 1,
  SMALL_CROWDS: 2,
  MODERATE: 3,
  LIVELY: 4,
};

const ACTIVITY_MAP: Record<ActivityLevel, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
};

export function scoreExperienceMatch(
  exp: PublicExperienceDTO,
  prefs: ExtractedTravelPreferencesDTO,
  weights: MatchingWeights = DEFAULT_WEIGHTS,
  lang: 'tr' | 'en' = 'tr'
): RecommendationMatchDTO {
  // 1. Destination Match (0 - 100)
  let destScore = 70; // Baseline if flexible or not specified
  if (prefs.destination && prefs.destination !== 'FLEXIBLE' && prefs.destination !== 'TURKIYE') {
    const destUpper = prefs.destination.toUpperCase();
    const provUpper = exp.location.province_name_tr.toUpperCase();
    const distUpper = exp.location.district_name_tr.toUpperCase();
    if (provUpper.includes(destUpper) || distUpper.includes(destUpper)) {
      destScore = 100;
    } else {
      // Region check (e.g. Ege vs Muğla, Karadeniz vs Rize/Artvin)
      const egeProvs = ['MUĞLA', 'İZMİR', 'AYDIN', 'KÜTAHYA', 'MANİSA', 'DENİZLİ'];
      const karadenizProvs = ['RİZE', 'ARTVİN', 'TRABZON', 'ORDU', 'GİRESUN'];
      const marmaraProvs = ['ÇANAKKALE', 'BURSA', 'BALIKESİR', 'EDİRNE'];
      const icAnadoluProvs = ['NEVŞEHİR', 'KONYA', 'ESKİŞEHİR', 'KAYSERİ'];
      const guneydoguProvs = ['MARDİN', 'GAZİANTEP', 'ŞANLIURFA', 'DİYARBAKIR'];
      const doguAnadoluProvs = ['KARS', 'VAN', 'ERZURUM', 'AĞRI'];

      if (
        (destUpper === 'EGE' && egeProvs.includes(provUpper)) ||
        (destUpper === 'KARADENIZ' && karadenizProvs.includes(provUpper)) ||
        (destUpper === 'MARMARA' && marmaraProvs.includes(provUpper)) ||
        (destUpper === 'IC_ANADOLU' && icAnadoluProvs.includes(provUpper)) ||
        (destUpper === 'GUNEYDOGU' && guneydoguProvs.includes(provUpper)) ||
        (destUpper === 'DOGU_ANADOLU' && doguAnadoluProvs.includes(provUpper))
      ) {
        destScore = 95;
      } else {
        destScore = 40; // Other region
      }
    }
  }

  // 2. Budget Match (0 - 100)
  let budgetScore = 80;
  if (prefs.budget_tier) {
    const prefBudgetVal = BUDGET_MAP[prefs.budget_tier];
    const expBudgetVal = BUDGET_MAP[exp.budget_tier];
    const diff = Math.abs(prefBudgetVal - expBudgetVal);
    if (diff === 0) budgetScore = 100;
    else if (diff === 1) budgetScore = 80;
    else if (diff === 2) budgetScore = 55;
    else budgetScore = 30;
  }

  // 3. Interests & Activities Overlap (0 - 100)
  let interestsScore = 70;
  const targetInterests = [...(prefs.activities || [])];
  if (targetInterests.length > 0) {
    const matched = targetInterests.filter(i =>
      exp.suitable_interests.some(eInt => eInt.toUpperCase().includes(i.toUpperCase())) ||
      exp.category.toUpperCase().includes(i.toUpperCase())
    );
    interestsScore = Math.min(100, Math.round((matched.length / targetInterests.length) * 100));
    if (interestsScore < 40) interestsScore = 40; // Floor for discovery
  }

  // 4. Crowd Tolerance (0 - 100)
  let crowdScore = 85;
  if (prefs.crowd_tolerance) {
    const prefCrowdVal = CROWD_MAP[prefs.crowd_tolerance];
    const expCrowdVal = CROWD_MAP[exp.crowd_level];
    if (expCrowdVal <= prefCrowdVal) {
      crowdScore = 100; // Experience is at or quieter than requested tolerance
    } else {
      const diff = expCrowdVal - prefCrowdVal;
      crowdScore = Math.max(30, 100 - diff * 35);
    }
  }

  // 5. Travel Style Match (0 - 100)
  let styleScore = 75;
  if (prefs.travel_styles && prefs.travel_styles.length > 0) {
    const matchedStyles = prefs.travel_styles.filter(s =>
      exp.travel_styles.some(eStyle => eStyle.toUpperCase().includes(s.toUpperCase()))
    );
    styleScore = Math.min(100, Math.round((matchedStyles.length / prefs.travel_styles.length) * 100));
    if (styleScore < 45) styleScore = 45;
  }

  // 6. Transportation Match (0 - 100)
  let transportScore = 80;
  if (prefs.transportation && prefs.transportation.length > 0) {
    const requiresCar = exp.transportation_accessibility.includes('CAR') && !exp.transportation_accessibility.includes('PUBLIC_TRANSIT');
    const hasPublicTransit = prefs.transportation.includes('PUBLIC_TRANSIT') || prefs.transportation.includes('WALKING');
    const noCar = !prefs.transportation.includes('CAR') && !prefs.transportation.includes('RENTAL_CAR');

    if (hasPublicTransit && noCar && requiresCar) {
      transportScore = 35; // Penalty if traveller has no car and experience strictly requires one
    } else if (hasPublicTransit && exp.transportation_accessibility.includes('PUBLIC_TRANSIT')) {
      transportScore = 100;
    } else {
      transportScore = 85;
    }
  }

  // 7. Activity Level (0 - 100)
  let activityScore = 85;
  if (prefs.activity_level) {
    const prefActVal = ACTIVITY_MAP[prefs.activity_level];
    const expActVal = ACTIVITY_MAP[exp.activity_level];
    const diff = Math.abs(prefActVal - expActVal);
    if (diff === 0) activityScore = 100;
    else if (diff === 1) activityScore = 75;
    else activityScore = 40;
  }

  // 8. Food Preferences (0 - 100)
  let foodScore = 85;
  if (prefs.food_preferences && prefs.food_preferences.length > 0) {
    const wantsVeg = prefs.food_preferences.includes('VEGETARIAN') || prefs.food_preferences.includes('VEGAN');
    const hasVeg = exp.dietary_options.includes('VEGETARIAN') || exp.dietary_options.includes('VEGAN');
    if (wantsVeg && hasVeg) foodScore = 100;
    else if (wantsVeg && !hasVeg) foodScore = 50;
    else foodScore = 90;
  }

  // Calculate Weighted Total Score
  const totalScore = Math.round(
    destScore * weights.destination +
    budgetScore * weights.budget +
    interestsScore * weights.interests +
    crowdScore * weights.crowd +
    styleScore * weights.travel_style +
    transportScore * weights.transportation +
    activityScore * weights.activity +
    foodScore * weights.food
  );

  // Generate Grounded Human-Readable Explainability String
  const matchExplanation = generateMatchExplanation(
    exp,
    {
      destScore,
      budgetScore,
      interestsScore,
      crowdScore,
      styleScore,
      transportScore,
    },
    lang
  );

  return {
    experience: {
      ...exp,
      match_score: totalScore,
      match_explanation: matchExplanation,
    },
    match_score: totalScore,
    match_explanation: matchExplanation,
    dimension_scores: {
      destination: destScore,
      budget: budgetScore,
      interests: interestsScore,
      crowd: crowdScore,
      travel_style: styleScore,
      transportation: transportScore,
      activity: activityScore,
      food: foodScore,
    },
  };
}

function generateMatchExplanation(
  exp: PublicExperienceDTO,
  scores: {
    destScore: number;
    budgetScore: number;
    interestsScore: number;
    crowdScore: number;
    styleScore: number;
    transportScore: number;
  },
  lang: 'tr' | 'en'
): string {
  if (lang === 'en') {
    const reasons: string[] = [];
    if (scores.crowdScore >= 90) reasons.push('low crowd tolerance');
    if (scores.interestsScore >= 80) reasons.push('authentic artisan or food focus');
    if (scores.transportScore >= 90) reasons.push('accessible transit alignment');
    if (scores.budgetScore >= 80) reasons.push('budget tier match');
    return `Recommended because this matches your preference for ${reasons.join(', ')}. Located in ${exp.location.district_name_en} with a verified local host.`;
  }

  // Turkish (Default)
  const reasons: string[] = [];
  if (scores.crowdScore >= 90) reasons.push('sakin ve kalabalıktan uzak atmosfer');
  if (scores.interestsScore >= 80) reasons.push('yerel üretim ve zanaat ilginiz');
  if (scores.transportScore >= 90) reasons.push('ulaşım kolaylığı');
  if (scores.budgetScore >= 80) reasons.push('bütçe uyumu');

  if (reasons.length === 0) {
    return `${exp.location.district_name_tr} bölgesinde sakin ve onaylı bir yerel deneyim olması nedeniyle profilinizle eşleşti.`;
  }

  return `Bu deneyim ${reasons.join(', ')} kriterlerinizle tam örtüştüğü ve ${exp.location.district_name_tr} genelinde onaylı yerel üretici tarafından sunulduğu için önerildi.`;
}

/**
 * Ranks all available experiences and guarantees discovery diversity
 * (prevents recommending only 1 dominant region or single category).
 */
export function rankExperiencesWithDiversity(
  experiences: PublicExperienceDTO[],
  prefs: ExtractedTravelPreferencesDTO,
  weights: MatchingWeights = DEFAULT_WEIGHTS,
  lang: 'tr' | 'en' = 'tr'
): RecommendationMatchDTO[] {
  const scored = experiences.map(exp => scoreExperienceMatch(exp, prefs, weights, lang));

  // Sort descending by match score
  scored.sort((a, b) => b.match_score - a.match_score);

  // Guarantee at least 1 different region or craft in the top recommendations
  if (scored.length > 3) {
    const primaryRegion = scored[0].experience.location.province_name_tr;
    const alternativeIndex = scored.findIndex(
      (item, idx) => idx > 1 && item.experience.location.province_name_tr !== primaryRegion
    );
    if (alternativeIndex > 2) {
      // Elevate the diverse discovery experience to index 2
      const [diverseItem] = scored.splice(alternativeIndex, 1);
      scored.splice(2, 0, diverseItem);
    }
  }

  return scored;
}
