/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Safe Natural-Language Travel Request Preference Extractor
 * 
 * Uses deterministic keyword tokenization as primary engine and fallback
 * to guarantee safety against prompt injections and LLM API downtime.
 */

import { ExtractedTravelPreferencesDTO } from '../types/api';

export function extractPreferencesFromPrompt(prompt: string): ExtractedTravelPreferencesDTO {
  const p = prompt.toLowerCase();
  const extracted: ExtractedTravelPreferencesDTO = {
    transportation: [],
    travel_styles: [],
    activities: [],
    food_preferences: [],
  };

  // 1. Destination / Region Detection
  if (p.includes('ege') || p.includes('muğla') || p.includes('fethiye') || p.includes('izmir') || p.includes('bodrum') || p.includes('kayaköy')) {
    extracted.destination = 'EGE';
  } else if (p.includes('karadeniz') || p.includes('rize') || p.includes('çamlıhemşin') || p.includes('artvin') || p.includes('şavşat') || p.includes('trabzon')) {
    extracted.destination = 'KARADENIZ';
  } else if (p.includes('akdeniz') || p.includes('antalya') || p.includes('kaş') || p.includes('kalkan')) {
    extracted.destination = 'AKDENIZ';
  } else if (p.includes('iç anadolu') || p.includes('kapadokya') || p.includes('nevşehir') || p.includes('ürgüp') || p.includes('mustafapaşa')) {
    extracted.destination = 'IC_ANADOLU';
  } else if (p.includes('marmara') || p.includes('çanakkale') || p.includes('kazdağları') || p.includes('ayvacık') || p.includes('yeşilyurt')) {
    extracted.destination = 'MARMARA';
  } else if (p.includes('güneydoğu') || p.includes('mardin') || p.includes('midyat') || p.includes('antep') || p.includes('urfa')) {
    extracted.destination = 'GUNEYDOGU';
  } else if (p.includes('doğu anadolu') || p.includes('kars') || p.includes('boğatepe') || p.includes('van')) {
    extracted.destination = 'DOGU_ANADOLU';
  } else {
    extracted.destination = 'FLEXIBLE';
  }

  // 2. Budget Detection
  if (p.includes('düşük') || p.includes('ucuz') || p.includes('öğrenci') || p.includes('az para') || p.includes('1000') || p.includes('2000')) {
    extracted.budget_tier = 'VERY_LOW';
  } else if (p.includes('5000') || p.includes('3000') || p.includes('4000') || p.includes('bütçeli') || p.includes('uygun')) {
    extracted.budget_tier = 'BUDGET';
  } else if (p.includes('lüks') || p.includes('butik otel') || p.includes('premium') || p.includes('üst segment')) {
    extracted.budget_tier = 'COMFORTABLE';
  } else {
    extracted.budget_tier = 'MODERATE';
  }

  // 3. Duration Detection
  if (p.includes('günübirlik') || p.includes('1 gün') || p.includes('tek gün')) {
    extracted.trip_duration = 'DAY_TRIP';
  } else if (p.includes('hafta sonu') || p.includes('2 gün')) {
    extracted.trip_duration = 'WEEKEND';
  } else if (p.includes('3 gün') || p.includes('4 gün') || p.includes('5 gün')) {
    extracted.trip_duration = '3_5_DAYS';
  } else if (p.includes('hafta') || p.includes('7 gün')) {
    extracted.trip_duration = 'ONE_WEEK';
  } else {
    extracted.trip_duration = '3_5_DAYS';
  }

  // 4. Crowd Tolerance
  if (p.includes('sakin') || p.includes('sessiz') || p.includes('kalabalıktan uzak') || p.includes('turist olmayan') || p.includes('kendi halimde')) {
    extracted.crowd_tolerance = 'VERY_QUIET';
  } else if (p.includes('küçük grup') || p.includes('az kişi')) {
    extracted.crowd_tolerance = 'SMALL_CROWDS';
  } else if (p.includes('canlı') || p.includes('hareketli')) {
    extracted.crowd_tolerance = 'LIVELY';
  } else {
    extracted.crowd_tolerance = 'VERY_QUIET';
  }

  // 5. Transportation
  if (p.includes('arabam yok') || p.includes('arabasız') || p.includes('toplu taşıma') || p.includes('otobüs') || p.includes('dolmuş') || p.includes('yürüyerek')) {
    extracted.transportation?.push('PUBLIC_TRANSIT', 'WALKING');
  } else if (p.includes('arabayla') || p.includes('araçla') || p.includes('kendi arabam')) {
    extracted.transportation?.push('CAR');
  } else {
    extracted.transportation?.push('PUBLIC_TRANSIT', 'CAR');
  }

  // 6. Activities & Interests
  if (p.includes('yemek') || p.includes('tat') || p.includes('lezzet') || p.includes('peynir') || p.includes('ekmek') || p.includes('mutfak')) {
    extracted.activities?.push('LOCAL_FOOD', 'COOKING');
    extracted.travel_styles?.push('FOOD_TRAVELLER');
  }
  if (p.includes('atölye') || p.includes('zanaat') || p.includes('çömlek') || p.includes('seramik') || p.includes('el sanat') || p.includes('sabun') || p.includes('gümüş')) {
    extracted.activities?.push('CRAFTS', 'WORKSHOPS', 'POTTERY');
    extracted.travel_styles?.push('ARTISAN_CRAFT');
  }
  if (p.includes('köy') || p.includes('çiftlik') || p.includes('hasat') || p.includes('tarla') || p.includes('bal')) {
    extracted.activities?.push('VILLAGE_LIFE', 'FARMING');
    extracted.travel_styles?.push('RURAL', 'SLOW_TRAVEL');
  }
  if (p.includes('doğa') || p.includes('yürüyüş') || p.includes('orman') || p.includes('göl') || p.includes('yayla') || p.includes('dağ')) {
    extracted.activities?.push('NATURE', 'HIKING');
    extracted.travel_styles?.push('NATURE');
    extracted.activity_level = 'MODERATE';
  } else {
    extracted.activity_level = 'LOW';
  }

  // Default fallback styles if empty
  if (extracted.travel_styles?.length === 0) {
    extracted.travel_styles?.push('SLOW_TRAVEL');
  }

  return extracted;
}
