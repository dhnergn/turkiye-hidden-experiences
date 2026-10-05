/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Experience Card Component adhering strictly to Universal Frontend Design
 * Constitution (Zero-Pill discipline, clean unboxed metadata, WCAG AA contrast).
 */

import React from 'react';
import { Bookmark, Sparkles, ShieldCheck, MapPin, Users, Clock, Info } from 'lucide-react';
import { PublicExperienceDTO } from '../types/database';

interface ExperienceCardProps {
  experience: PublicExperienceDTO;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (experience: PublicExperienceDTO) => void;
  lang: 'tr' | 'en';
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  isSaved,
  onToggleSave,
  onSelect,
  lang,
}) => {
  const primaryMedia = experience.media.find(m => m.is_primary) || experience.media[0];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'LOCAL_FOOD':
        return lang === 'tr' ? 'Yerel Gastronomi & Üretim' : 'Local Food & Producer';
      case 'CRAFTS':
        return lang === 'tr' ? 'Geleneksel Zanaat & Atölye' : 'Artisan Craft & Workshop';
      case 'RURAL_LIFE':
        return lang === 'tr' ? 'Köy & Çiftlik Yaşamı' : 'Rural Life & Farm';
      case 'NATURE_HIKING':
        return lang === 'tr' ? 'Doğa Yürüyüşü & Rota' : 'Nature & Trail';
      default:
        return lang === 'tr' ? 'Kültürel Miras' : 'Cultural Heritage';
    }
  };

  const getCrowdLabel = (c: string) => {
    switch (c) {
      case 'VERY_QUIET':
        return lang === 'tr' ? 'Çok Sessiz' : 'Very Quiet';
      case 'SMALL_CROWDS':
        return lang === 'tr' ? 'Küçük Grup' : 'Small Group';
      default:
        return lang === 'tr' ? 'Ilımlı' : 'Moderate';
    }
  };

  return (
    <article className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full">
      {/* Visual Asset Container with Safe Location Watermark */}
      <div className="relative aspect-16/10 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onSelect(experience)}>
        <img
          src={primaryMedia?.url}
          alt={experience.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        {/* Subtle Gradient for Overlaid Text Legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 via-transparent to-black/20" />

        {/* Top Floating Actions: Save button & Match Score (if present) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {experience.match_score ? (
            <div className="bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded flex items-center gap-1 shadow-xs pointer-events-auto">
              <Sparkles className="w-3 h-3 text-[#E68A60]" />
              <span>%{experience.match_score} {lang === 'tr' ? 'Uyum' : 'Match'}</span>
            </div>
          ) : <div />}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(experience.id);
            }}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs ${
              isSaved
                ? 'bg-[#C85A32] text-white'
                : 'bg-white/85 text-stone-700 hover:bg-white hover:text-stone-900'
            }`}
            title={isSaved ? (lang === 'tr' ? 'Kayıttan Çıkar' : 'Remove') : (lang === 'tr' ? 'Geziye Kaydet' : 'Save')}
            aria-label="Save to itinerary"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Location Indicator (Privacy Safe) */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium drop-shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-stone-200" />
            {experience.location.province_name_tr} · {experience.location.district_name_tr}
          </span>
          <span className="text-[11px] text-stone-200 font-mono drop-shadow-xs">
            {experience.approximate_price_try} ₺ / {lang === 'tr' ? 'kişi' : 'guest'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata (Zero-Pill Rule Enforcement) */}
          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wide flex items-center flex-wrap gap-1 mb-1.5">
            <span>{getCategoryLabel(experience.category)}</span>
            <span aria-hidden="true">·</span>
            <span>{getCrowdLabel(experience.crowd_level)}</span>
            <span aria-hidden="true">·</span>
            <span>{experience.duration_hours} {lang === 'tr' ? 'Saat' : 'Hours'}</span>
          </div>

          {/* Primary Title */}
          <h3
            onClick={() => onSelect(experience)}
            className="font-serif text-base font-bold text-stone-900 leading-snug hover:text-[#C85A32] cursor-pointer line-clamp-2"
          >
            {experience.title}
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {experience.short_description}
          </p>

          {/* Verified Provider Kicker */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate font-medium">{experience.provider.business_or_artisan_name}</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500 text-[11px] shrink-0">
              {experience.provider.years_active} {lang === 'tr' ? 'yıldır aktif' : 'yrs active'}
            </span>
          </div>
        </div>

        {/* Explainability Callout ("Why this matches you") */}
        {experience.match_explanation && (
          <div className="mt-3.5 pt-3 border-t border-stone-100 bg-[#FAF8F5] -mx-4 -mb-4 p-3.5 flex items-start gap-2 text-xs text-stone-700">
            <Info className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight line-clamp-2 italic text-stone-600">
              {experience.match_explanation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};
