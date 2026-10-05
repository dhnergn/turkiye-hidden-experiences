/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Natural-Language Travel Request Hero & Intelligent Questionnaire Modal
 */

import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import { ExtractedTravelPreferencesDTO } from '../types/api';
import { CrowdTolerance, BudgetTier, ActivityLevel } from '../types/database';

interface TravelRequestHeroProps {
  onSearchPrompt: (prompt: string) => void;
  onApplyPreferences: (prefs: ExtractedTravelPreferencesDTO) => void;
  lang: 'tr' | 'en';
}

export const TravelRequestHero: React.FC<TravelRequestHeroProps> = ({
  onSearchPrompt,
  onApplyPreferences,
  lang,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Questionnaire States
  const [qDestination, setQDestination] = useState<string>('FLEXIBLE');
  const [qBudget, setQBudget] = useState<BudgetTier>('BUDGET');
  const [qCrowd, setQCrowd] = useState<CrowdTolerance>('VERY_QUIET');
  const [qActivity, setQActivity] = useState<ActivityLevel>('LOW');
  const [qStyles, setQStyles] = useState<string[]>(['SLOW_TRAVEL', 'ARTISAN_CRAFT']);
  const [qTransport, setQTransport] = useState<string[]>(['PUBLIC_TRANSIT']);

  const samplePrompts = [
    lang === 'tr'
      ? '3 günüm var, 5.000 TL bütçem var. Ege tarafında sakin, arabasız gidilebilecek, geleneksel yemek ve atölye olan bir yer arıyorum.'
      : '3 days, 5,000 TL budget. Looking for a quiet spot in Aegean with traditional workshops, local food, and no car.',
    lang === 'tr'
      ? 'Karadeniz vadilerinde sisli bir köyde karakovan balı ve çay hasadı görmek istiyorum. Kalabalıklardan çok uzağım.'
      : 'Want to witness wild honey harvesting and tea plucking in a misty Black Sea village away from crowds.',
    lang === 'tr'
      ? 'Kapadokya balon kalabalığından uzakta, kaya oymalarında ekmek pişiren ve tarihi anlatan sakin bir köy.'
      : 'A quiet village away from Cappadocia balloon crowds with traditional stone oven baking and oral history.',
  ];

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSearchPrompt(prompt.trim());
    }
  };

  const toggleStyle = (style: string) => {
    setQStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleTransport = (t: string) => {
    setQTransport(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleApplyQuestionnaire = () => {
    onApplyPreferences({
      destination: qDestination,
      budget_tier: qBudget,
      crowd_tolerance: qCrowd,
      activity_level: qActivity,
      travel_styles: qStyles,
      transportation: qTransport,
    });
    setIsModalOpen(false);
  };

  return (
    <section className="relative bg-[#FAF8F5] border-b border-stone-200 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Anti-Slop Authentic Heading */}
        <span className="text-xs uppercase tracking-widest text-[#C85A32] font-semibold mb-2 block">
          {lang === 'tr' ? 'Türkiye Saklı Deneyimler' : 'Türkiye Hidden Experiences'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
          {lang === 'tr'
            ? 'Bize nasıl bir seyahat istediğini anlat, sana uygun Türkiye’yi bulalım.'
            : 'Describe the trip you want, and we will find the Türkiye that fits you.'}
        </h1>
        <p className="mt-3 text-base text-stone-600 max-w-2xl mx-auto">
          {lang === 'tr'
            ? 'Turistik kalabalıklardan ve ticari turlardan uzak; asırlık zeytinlikler, taş atölyeler ve dağ köylerinde doğrudan yerel üreticiyle buluşun.'
            : 'Far from mass-tourist hubs; connect directly with artisans, family olive groves, and mountain villages.'}
        </p>

        {/* Natural Language Search Bar */}
        <form onSubmit={handlePromptSubmit} className="mt-8 relative max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white rounded-xl border border-stone-300 shadow-sm focus-within:border-[#C85A32] focus-within:ring-2 focus-within:ring-[#C85A32]/20 transition-all p-1.5">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={
                lang === 'tr'
                  ? 'Örn: "3 günüm ve 5.000 TL var, arabasız gidilebilen sakin bir köyde zanaat atölyesi istiyorum..."'
                  : 'E.g. "3 days, 5,000 TL, want a quiet village with artisan crafts and no car needed..."'
              }
              className="w-full px-4 py-3 text-sm text-stone-900 placeholder-stone-400 bg-transparent focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors mr-1 shrink-0"
              title="Ayrıntılı Tercih Anketi"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="bg-[#C85A32] hover:bg-[#9C3D1B] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <span>{lang === 'tr' ? 'Eşleştir' : 'Match'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
          <span className="font-medium text-stone-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            {lang === 'tr' ? 'Örnek İstekler:' : 'Try an example:'}
          </span>
          {samplePrompts.map((pText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPrompt(pText);
                onSearchPrompt(pText);
              }}
              className="text-stone-600 hover:text-stone-900 underline underline-offset-2 decoration-stone-300 hover:decoration-stone-700 transition-colors text-left max-w-xs truncate"
            >
              "{pText.substring(0, 48)}..."
            </button>
          ))}
        </div>
      </div>

      {/* Structured Preference Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-300 max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {lang === 'tr' ? 'Seyahat Tercih Anketi' : 'Travel Preferences Questionnaire'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'tr'
                    ? 'İstediğiniz soruları yanıtlayabilir veya esnek bırakabilirsiniz.'
                    : 'Answer what matters to you or leave items flexible.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-sm">
              {/* Destination */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">
                  {lang === 'tr' ? '1. Bölge / Destinasyon' : '1. Preferred Region'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'FLEXIBLE', tr: 'Tüm Türkiye (Esnek)', en: 'All Türkiye' },
                    { id: 'EGE', tr: 'Ege Bölgesi', en: 'Aegean' },
                    { id: 'KARADENIZ', tr: 'Karadeniz', en: 'Black Sea' },
                    { id: 'AKDENIZ', tr: 'Akdeniz', en: 'Mediterranean' },
                    { id: 'MARMARA', tr: 'Marmara (Kazdağları)', en: 'Marmara' },
                    { id: 'IC_ANADOLU', tr: 'İç Anadolu (Kapadokya)', en: 'Central' },
                    { id: 'GUNEYDOGU', tr: 'Güneydoğu (Mardin)', en: 'Southeast' },
                    { id: 'DOGU_ANADOLU', tr: 'Doğu Anadolu (Kars)', en: 'Eastern' },
                  ].map(reg => (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => setQDestination(reg.id)}
                      className={`p-2 text-left rounded border transition-colors ${
                        qDestination === reg.id
                          ? 'border-[#C85A32] bg-[#FAF8F5] text-[#C85A32] font-semibold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {lang === 'tr' ? reg.tr : reg.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crowd Tolerance */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">
                  {lang === 'tr' ? '2. Kalabalık Toleransı' : '2. Crowd Tolerance'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'VERY_QUIET', tr: 'Çok Sessiz & İzole (1-4 kişi)', en: 'Very Quiet & Isolated' },
                    { id: 'SMALL_CROWDS', tr: 'Küçük Gruplar Uygun (5-8 kişi)', en: 'Small Groups OK' },
                    { id: 'MODERATE', tr: 'Ilımlı Hareketlilik', en: 'Moderate Crowds' },
                    { id: 'LIVELY', tr: 'Canlı & Köy Pazarı Havası', en: 'Lively / Local Market' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setQCrowd(c.id as CrowdTolerance)}
                      className={`p-2 rounded border text-left transition-colors ${
                        qCrowd === c.id
                          ? 'border-[#C85A32] bg-[#FAF8F5] text-[#C85A32] font-semibold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {lang === 'tr' ? c.tr : c.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">
                  {lang === 'tr' ? '3. Bütçe Seviyesi' : '3. Budget Level'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs text-center">
                  {[
                    { id: 'VERY_LOW', tr: '₺ Çok Düşük', en: '₺ Very Low' },
                    { id: 'BUDGET', tr: '₺₺ Uygun Bütçe', en: '₺₺ Budget' },
                    { id: 'MODERATE', tr: '₺₺₺ Dengeli', en: '₺₺₺ Moderate' },
                    { id: 'COMFORTABLE', tr: '₺₺₺₺ Rahat', en: '₺₺₺₺ Comfy' },
                    { id: 'PREMIUM', tr: '₺₺₺₺₺ Özel', en: '₺₺₺₺₺ Premium' },
                  ].map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setQBudget(b.id as BudgetTier)}
                      className={`p-2 rounded border transition-colors ${
                        qBudget === b.id
                          ? 'border-[#C85A32] bg-[#FAF8F5] text-[#C85A32] font-semibold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {lang === 'tr' ? b.tr : b.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Styles (Multiple Select) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">
                  {lang === 'tr' ? '4. Seyahat Tarzı (Çoklu Seçim)' : '4. Travel Style (Multi)'}
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'SLOW_TRAVEL', tr: 'Yavaş Seyahat (Slow Travel)', en: 'Slow Travel' },
                    { id: 'ARTISAN_CRAFT', tr: 'Zanaat & Atölye', en: 'Crafts & Workshops' },
                    { id: 'FOOD_TRAVELLER', tr: 'Yerel Gastronomi', en: 'Food / Culinary' },
                    { id: 'RURAL', tr: 'Köy & Çiftlik Hayatı', en: 'Rural & Farm' },
                    { id: 'NATURE', tr: 'Doğa & Yürüyüş', en: 'Nature & Hiking' },
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleStyle(st.id)}
                      className={`px-3 py-1.5 rounded border transition-colors ${
                        qStyles.includes(st.id)
                          ? 'border-[#C85A32] bg-[#FAF8F5] text-[#C85A32] font-medium'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {lang === 'tr' ? st.tr : st.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transportation */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">
                  {lang === 'tr' ? '5. Ulaşım Durumu' : '5. Transportation'}
                </label>
                <div className="flex gap-2 text-xs">
                  {[
                    { id: 'PUBLIC_TRANSIT', tr: 'Arabam Yok (Toplu Taşıma / Yürüme)', en: 'No Car (Public Transit)' },
                    { id: 'CAR', tr: 'Kendi Aracım Var', en: 'Private Car' },
                  ].map(trItem => (
                    <button
                      key={trItem.id}
                      type="button"
                      onClick={() => toggleTransport(trItem.id)}
                      className={`px-3 py-2 rounded border flex-1 text-center transition-colors ${
                        qTransport.includes(trItem.id)
                          ? 'border-[#C85A32] bg-[#FAF8F5] text-[#C85A32] font-semibold'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {lang === 'tr' ? trItem.tr : trItem.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                {lang === 'tr' ? 'Vazgeç' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleApplyQuestionnaire}
                className="px-5 py-2 text-xs font-semibold bg-[#C85A32] hover:bg-[#9C3D1B] text-white rounded-lg shadow-xs transition-colors"
              >
                {lang === 'tr' ? 'Eşleşen Deneyimleri Getir' : 'Show Matching Experiences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
