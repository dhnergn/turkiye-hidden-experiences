/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Privacy-Preserving Interactive Regional & District Map
 * 
 * Enforces location privacy rules: Pins are rendered at jittered district/locality
 * centroids (±2-5km offset). Never reveals private residential coordinates.
 */

import React, { useState } from 'react';
import { MapPin, ShieldCheck, Sparkles, Compass } from 'lucide-react';
import { PublicExperienceDTO } from '../types/database';

interface PrivacyMapProps {
  experiences: PublicExperienceDTO[];
  onSelectExperience: (exp: PublicExperienceDTO) => void;
  lang: 'tr' | 'en';
}

export const PrivacyMap: React.FC<PrivacyMapProps> = ({
  experiences,
  onSelectExperience,
  lang,
}) => {
  const [selectedPin, setSelectedPin] = useState<PublicExperienceDTO | null>(null);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');

  // Filter experiences by region if requested
  const filtered = selectedRegionFilter === 'ALL'
    ? experiences
    : experiences.filter(e => {
        const prov = e.location.province_name_tr.toUpperCase();
        if (selectedRegionFilter === 'EGE') return ['MUĞLA', 'KÜTAHYA'].includes(prov);
        if (selectedRegionFilter === 'KARADENIZ') return ['RİZE', 'ARTVİN'].includes(prov);
        if (selectedRegionFilter === 'MARMARA') return ['ÇANAKKALE'].includes(prov);
        if (selectedRegionFilter === 'IC_ANADOLU') return ['NEVŞEHİR'].includes(prov);
        if (selectedRegionFilter === 'GUNEYDOGU') return ['MARDİN'].includes(prov);
        if (selectedRegionFilter === 'DOGU_ANADOLU') return ['KARS'].includes(prov);
        return true;
      });

  // Calculate SVG projection coordinates based on Turkish bounding box
  // Lat: 35.8 to 42.3, Lng: 25.5 to 44.8
  const projectToSVG = (lat: number, lng: number) => {
    const minLng = 25.5;
    const maxLng = 45.0;
    const minLat = 35.5;
    const maxLat = 42.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 400;

    return { x: Math.round(x), y: Math.round(y) };
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar & Privacy Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700">
            {lang === 'tr' ? 'Bölgeye Göre Göster:' : 'Filter Region:'}
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'ALL', label: lang === 'tr' ? 'Tümü' : 'All' },
              { id: 'EGE', label: 'Ege' },
              { id: 'KARADENIZ', label: 'Karadeniz' },
              { id: 'MARMARA', label: 'Marmara' },
              { id: 'IC_ANADOLU', label: 'İç Anadolu' },
              { id: 'GUNEYDOGU', label: 'Güneydoğu' },
              { id: 'DOGU_ANADOLU', label: 'Doğu Anadolu' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegionFilter(r.id)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedRegionFilter === r.id
                    ? 'bg-[#C85A32] text-white font-medium'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'tr' ? 'Fuzzy Centroid Koruma (±3km)' : 'Fuzzy Centroid Shield (±3km)'}</span>
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div className="relative bg-[#FAF8F5] border border-stone-300 rounded-xl overflow-hidden aspect-2/1 w-full max-h-[520px] shadow-inner flex items-center justify-center">
        {/* Stylized Turkey Coastline & Regional Outlines SVG */}
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full select-none"
          aria-label="Türkiye Haritası"
        >
          {/* Subtle Map Grid Lines */}
          <line x1="0" y1="100" x2="800" y2="100" stroke="#E7E5E4" strokeDasharray="4 4" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#E7E5E4" strokeDasharray="4 4" />
          <line x1="0" y1="300" x2="800" y2="300" stroke="#E7E5E4" strokeDasharray="4 4" />
          <line x1="200" y1="0" x2="200" y2="400" stroke="#E7E5E4" strokeDasharray="4 4" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="#E7E5E4" strokeDasharray="4 4" />
          <line x1="600" y1="0" x2="600" y2="400" stroke="#E7E5E4" strokeDasharray="4 4" />

          {/* Abstract Anatolian Landmass Silhouette */}
          <path
            d="M 60,110 Q 110,95 180,105 T 320,80 T 520,70 T 700,90 T 760,140 T 740,240 T 660,280 T 520,290 T 360,330 T 220,330 T 130,280 T 70,200 Z"
            fill="#F3EFEA"
            stroke="#D6D3D1"
            strokeWidth="1.5"
          />

          {/* Regional Labels */}
          <text x="140" y="190" fill="#A8A29E" fontSize="11" fontWeight="600" fontFamily="sans-serif">EGE</text>
          <text x="480" y="90" fill="#A8A29E" fontSize="11" fontWeight="600" fontFamily="sans-serif">KARADENİZ</text>
          <text x="260" y="320" fill="#A8A29E" fontSize="11" fontWeight="600" fontFamily="sans-serif">AKDENİZ</text>
          <text x="370" y="190" fill="#A8A29E" fontSize="11" fontWeight="600" fontFamily="sans-serif">İÇ ANADOLU</text>
          <text x="640" y="270" fill="#A8A29E" fontSize="11" fontWeight="600" fontFamily="sans-serif">GÜNEYDOĞU</text>
          <text x="690" y="160" fill="#A8A29E" fontSize="11" fontWeight="600" fontFamily="sans-serif">DOĞU ANADOLU</text>

          {/* Render Privacy-Preserved Experience Pins */}
          {filtered.map(exp => {
            const { x, y } = projectToSVG(exp.location.public_lat, exp.location.public_lng);
            const isHovered = selectedPin?.id === exp.id;

            return (
              <g
                key={exp.id}
                className="cursor-pointer transition-transform"
                onClick={() => setSelectedPin(exp)}
                onMouseEnter={() => setSelectedPin(exp)}
              >
                {/* Obfuscation Radius Halo (Illustrates location privacy) */}
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill="#C85A32"
                  fillOpacity={isHovered ? '0.22' : '0.1'}
                  stroke="#C85A32"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />

                {/* Central Pin */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '6.5' : '4.5'}
                  fill={isHovered ? '#9C3D1B' : '#C85A32'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="shadow-sm"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Selected Pin Info Card */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-stone-300 shadow-lg text-xs animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-wider block font-semibold">
                  {selectedPin.location.province_name_tr} · {selectedPin.location.district_name_tr}
                </span>
                <h4 className="font-serif font-bold text-stone-900 text-sm mt-0.5 line-clamp-1">
                  {selectedPin.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <p className="mt-1 text-stone-600 line-clamp-2 text-[11px]">
              {selectedPin.short_description}
            </p>

            <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between">
              <span className="font-mono font-bold text-stone-800">
                {selectedPin.approximate_price_try} ₺
              </span>
              <button
                onClick={() => onSelectExperience(selectedPin)}
                className="px-3 py-1 bg-[#C85A32] hover:bg-[#9C3D1B] text-white rounded font-medium text-xs transition-colors"
              >
                {lang === 'tr' ? 'Detayları İncele' : 'View Details'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Educational Notice on Location Obfuscation */}
      <div className="text-[11px] text-stone-500 flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-stone-400" />
          {lang === 'tr'
            ? 'Harita işaretleri ±3 km hata payı ile dağıtılarak aile işletmeleri ve tarım arazilerinin gizliliği korunur.'
            : 'Map centroids include a ±3km randomized offset to safeguard private rural workshops.'}
        </span>
        <span>{filtered.length} {lang === 'tr' ? 'saklı deneyim listeleniyor' : 'hidden experiences found'}</span>
      </div>
    </div>
  );
};
