/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Provider Dashboard: Privacy-Safe Experience Submission & Verification
 */

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Upload, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';
import { CreateExperienceDTO } from '../types/api';
import { ExperienceCategory, CrowdTolerance, BudgetTier, ActivityLevel } from '../types/database';

interface ProviderDashboardProps {
  onSubmitExperience: (dto: CreateExperienceDTO) => void;
  lang: 'tr' | 'en';
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  onSubmitExperience,
  lang,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExperienceCategory>('CRAFTS');
  const [district, setDistrict] = useState('Fethiye (Kayaköy)');
  const [price, setPrice] = useState(650);
  const [duration, setDuration] = useState(2.5);
  const [crowd, setCrowd] = useState<CrowdTolerance>('VERY_QUIET');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && shortDesc.trim()) {
      onSubmitExperience({
        title,
        category,
        district_id: 'LOCAL_DIST',
        locality_name: district,
        budget_tier: 'BUDGET',
        approximate_price_try: Number(price),
        duration_hours: Number(duration),
        crowd_level: crowd,
        activity_level: 'LOW',
        travel_styles: ['SLOW_TRAVEL', 'ARTISAN_CRAFT'],
        suitable_interests: ['CRAFTS', 'VILLAGE_LIFE'],
        transportation_accessibility: ['PUBLIC_TRANSIT', 'WALKING'],
        dietary_options: ['LOCAL_PRODUCE'],
        short_description: shortDesc,
        full_description: fullDesc || shortDesc,
        group_capacity_min: 1,
        group_capacity_max: 6,
        media_urls: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80'],
      });
      setSubmittedSuccess(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Provider Status Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Fatma Hanım ve Aile Sabunevi
              </h2>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {lang === 'tr' ? 'Onaylı Üretici' : 'Verified Host'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'tr'
                ? 'Muğla / Fethiye · Zanaatkar Odası Kaydı Onaylandı · 14 yıldır aktif'
                : 'Mugla / Fethiye · Artisan Chamber Registry Verified · 14 yrs active'}
            </p>
          </div>
        </div>

        <button className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg font-medium transition-colors">
          {lang === 'tr' ? 'Belge Güncelle' : 'Update Docs'}
        </button>
      </div>

      {/* Location Privacy Guarantee Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm">
            {lang === 'tr' ? 'Konum Gizliliği ve Mahremiyet Güvencesi' : 'Privacy & Address Shielding'}
          </span>
          <p className="mt-1 leading-relaxed text-emerald-800">
            {lang === 'tr'
              ? 'Atölyenizin veya aile çiftliğinizin açık adresi asla internette veya haritada herkese açık gösterilmez. Sadece ilçe ve köy adı üzerinden yaklaşık alan (±3km) işaretlenir. Rezervasyon onaylanana dek ev/çiftlik gizliliğiniz korunur.'
              : 'Your residential workshop address will never be exposed on public maps. Public pins only show approximate locality centroids (±3km offset).'}
          </p>
        </div>
      </div>

      {/* Submit New Experience Form */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-[#C85A32]" />
          {lang === 'tr' ? 'Yeni Saklı Deneyim Gönder' : 'Submit New Hidden Experience'}
        </h3>
        <p className="text-xs text-stone-500 mb-6">
          {lang === 'tr'
            ? 'Gönderdiğiniz deneyim, platform kalite ve otantiklik ilkelerimiz gereği moderatör onayından geçtikten sonra yayına alınır.'
            : 'Submissions are reviewed by human moderators before publishing to guarantee local authenticity.'}
        </p>

        {submittedSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-serif font-bold text-emerald-900 text-base">
              {lang === 'tr' ? 'Deneyim İncelemeye Gönderildi!' : 'Experience Submitted for Review!'}
            </h4>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              {lang === 'tr'
                ? 'Deneyiminiz denetim sırasına alındı. Moderatörümüz 24 saat içinde içeriği inceleyip yayına alacaktır.'
                : 'Your submission is queued for moderator review. It will be vetted within 24 hours.'}
            </p>
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              {lang === 'tr' ? 'Başka Deneyim Ekle' : 'Add Another Experience'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === 'tr' ? 'Deneyim Başlığı' : 'Experience Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={lang === 'tr' ? 'Örn: Asırlık Taş Evde Zeytinyağı Sabun Yapımı' : 'E.g. Traditional Olive Soap Crafting in Stone House'}
                className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'tr' ? 'Kategori' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ExperienceCategory)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
                >
                  <option value="CRAFTS">{lang === 'tr' ? 'Geleneksel Zanaat & Atölye' : 'Crafts & Workshops'}</option>
                  <option value="LOCAL_FOOD">{lang === 'tr' ? 'Yerel Gastronomi & Üretim' : 'Local Food & Producer'}</option>
                  <option value="RURAL_LIFE">{lang === 'tr' ? 'Köy & Çiftlik Hayatı' : 'Rural & Village Life'}</option>
                  <option value="NATURE_HIKING">{lang === 'tr' ? 'Doğa Yürüyüşü' : 'Nature & Trails'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'tr' ? 'Bölge / Köy (Yaklaşık Görünür)' : 'Locality / Village'}
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="Fethiye (Kayaköy)"
                  className="w-full p-2.5 border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'tr' ? 'Fiyat (TL)' : 'Price (TL)'}
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'tr' ? 'Süre (Saat)' : 'Duration (Hours)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full p-2.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'tr' ? 'Kalabalık' : 'Crowd Level'}
                </label>
                <select
                  value={crowd}
                  onChange={e => setCrowd(e.target.value as CrowdTolerance)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
                >
                  <option value="VERY_QUIET">{lang === 'tr' ? 'Çok Sessiz' : 'Very Quiet'}</option>
                  <option value="SMALL_CROWDS">{lang === 'tr' ? 'Küçük Grup' : 'Small Group'}</option>
                  <option value="MODERATE">{lang === 'tr' ? 'Ilımlı' : 'Moderate'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === 'tr' ? 'Kısa Açıklama' : 'Short Description'}
              </label>
              <textarea
                required
                rows={2}
                value={shortDesc}
                onChange={e => setShortDesc(e.target.value)}
                placeholder={lang === 'tr' ? 'Deneyimin 1-2 cümlelik özeti...' : 'Summary of the authentic experience...'}
                className="w-full p-2.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === 'tr' ? 'Detaylı Hikaye & Program' : 'Full Story & Program'}
              </label>
              <textarea
                rows={4}
                value={fullDesc}
                onChange={e => setFullDesc(e.target.value)}
                placeholder={lang === 'tr' ? 'Geleneksel üretim yönteminiz, ikramlar ve ne yapılacağı...' : 'Traditional crafting methods, what guests will do...'}
                className="w-full p-2.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#9C3D1B] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>{lang === 'tr' ? 'Onaya Gönder' : 'Submit for Moderation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
