/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Itinerary & Trip Planner Drawer
 */

import React from 'react';
import { Bookmark, Trash2, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { PublicExperienceDTO } from '../types/database';

interface ItineraryViewProps {
  savedTrip: { id: string; title: string; items: { experienceId: string; day: number; notes: string }[] };
  allExperiences: PublicExperienceDTO[];
  onRemoveItem: (expId: string) => void;
  onSelectExperience: (exp: PublicExperienceDTO) => void;
  lang: 'tr' | 'en';
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  savedTrip,
  allExperiences,
  onRemoveItem,
  onSelectExperience,
  lang,
}) => {
  const itemsWithDetails = savedTrip.items
    .map(item => {
      const exp = allExperiences.find(e => e.id === item.experienceId);
      return exp ? { ...item, experience: exp } : null;
    })
    .filter(Boolean) as { experienceId: string; day: number; notes: string; experience: PublicExperienceDTO }[];

  const totalPrice = itemsWithDetails.reduce((acc, curr) => acc + curr.experience.approximate_price_try, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#C85A32] uppercase tracking-wider block font-semibold">
            {lang === 'tr' ? 'Kişiselleştirilmiş Gezi Planı' : 'Custom Itinerary'}
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
            {savedTrip.title}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {itemsWithDetails.length} {lang === 'tr' ? 'saklı deneyim seçildi' : 'experiences selected'}
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-stone-200 text-right sm:min-w-[180px]">
          <span className="text-[11px] text-stone-500 block">
            {lang === 'tr' ? 'Tahmini Toplam Maliyet' : 'Estimated Total'}
          </span>
          <span className="font-mono text-xl font-bold text-stone-900">
            {totalPrice} ₺
          </span>
        </div>
      </div>

      {/* Itinerary List Sorted by Days */}
      {itemsWithDetails.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-stone-300 p-8">
          <Bookmark className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <h3 className="font-serif text-base font-bold text-stone-800">
            {lang === 'tr' ? 'Henüz Gezi Planınıza Deneyim Eklenmedi' : 'No Experiences in Itinerary'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {lang === 'tr'
              ? 'Keşfet sayfasındaki deneyimlerin üzerindeki kaydet butonuna basarak kendi rotanızı oluşturabilirsiniz.'
              : 'Click the save bookmark on any experience to build your personalized Turkish journey.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {itemsWithDetails.map((item, idx) => (
            <div
              key={item.experienceId}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-stone-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold">
                    {lang === 'tr' ? 'GÜN' : 'DAY'}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#C85A32]">
                    {item.day || idx + 1}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{item.experience.location.province_name_tr} · {item.experience.location.district_name_tr}</span>
                    <span className="text-stone-300">·</span>
                    <span className="font-mono font-medium text-stone-700">{item.experience.approximate_price_try} ₺</span>
                  </div>

                  <h3
                    onClick={() => onSelectExperience(item.experience)}
                    className="font-serif font-bold text-base text-stone-900 hover:text-[#C85A32] cursor-pointer"
                  >
                    {item.experience.title}
                  </h3>

                  {item.notes && (
                    <p className="text-xs text-stone-500 italic mt-1">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => onSelectExperience(item.experience)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-medium transition-colors"
                >
                  {lang === 'tr' ? 'Detay' : 'View'}
                </button>
                <button
                  onClick={() => onRemoveItem(item.experienceId)}
                  className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Listeden Çıkar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
