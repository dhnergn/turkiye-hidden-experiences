/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Experience Detail Modal with Provider Trust Indicators, Safe Geography & Incident Reporting
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Users,
  Compass,
  Bookmark,
  AlertTriangle,
  Send,
  Leaf,
} from 'lucide-react';
import { PublicExperienceDTO } from '../types/database';
import { ReportReason } from '../types/database';

interface ExperienceDetailModalProps {
  experience: PublicExperienceDTO | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onReport: (expId: string, reason: ReportReason, details: string) => void;
  lang: 'tr' | 'en';
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  experience,
  onClose,
  isSaved,
  onToggleSave,
  onReport,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'provider' | 'report'>('details');
  const [reportReason, setReportReason] = useState<ReportReason>('OVERCROWDED_TOURIST_TRAP');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!experience) return null;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportDetails.trim()) {
      onReport(experience.id, reportReason, reportDetails);
      setReportSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-stone-300 max-w-3xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>
              {experience.location.province_name_tr} / {experience.location.district_name_tr}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-emerald-700 font-sans font-semibold">
              {experience.location.precision_level === 'APPROXIMATE'
                ? lang === 'tr'
                  ? 'Gizlilik Korumalı Yaklaşık Konum'
                  : 'Privacy-Protected Approx Location'
                : 'Doğrulanmış Alan'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(experience.id)}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-[#C85A32] text-white'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? (lang === 'tr' ? 'Kaydedildi' : 'Saved') : (lang === 'tr' ? 'Geziye Ekle' : 'Add to Trip')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Visual Banner */}
          <div className="relative aspect-21/9 rounded-lg overflow-hidden bg-stone-100">
            <img
              src={experience.media[0]?.url}
              alt={experience.title}
              className="w-full h-full object-cover"
            />
            {experience.is_sustainable_certified && (
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-emerald-800 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 font-medium shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'tr' ? 'Sürdürülebilir Köy / Yerel Üretim' : 'Sustainable Local Heritage'}</span>
              </div>
            )}
          </div>

          {/* Title & Key Stats */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {experience.title}
            </h2>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3.5 rounded-lg border border-stone-200 text-xs">
              <div>
                <span className="text-stone-500 block mb-0.5">{lang === 'tr' ? 'Yaklaşık Ücret' : 'Approx Price'}</span>
                <span className="font-mono font-bold text-stone-900 text-sm">{experience.approximate_price_try} ₺</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">{lang === 'tr' ? 'Tipik Süre' : 'Duration'}</span>
                <span className="font-medium text-stone-900">{experience.duration_hours} {lang === 'tr' ? 'Saat' : 'Hours'}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">{lang === 'tr' ? 'Kalabalık Düzeyi' : 'Crowd Level'}</span>
                <span className="font-medium text-stone-900">
                  {experience.crowd_level === 'VERY_QUIET' ? (lang === 'tr' ? 'Çok Sessiz' : 'Very Quiet') : (lang === 'tr' ? 'Küçük Grup' : 'Small Group')}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">{lang === 'tr' ? 'Kapasite' : 'Group Capacity'}</span>
                <span className="font-medium text-stone-900">{experience.group_capacity_min} - {experience.group_capacity_max} {lang === 'tr' ? 'Kişi' : 'Guests'}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-3 ${
                activeTab === 'details'
                  ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {lang === 'tr' ? 'Deneyim Detayları' : 'Experience Overview'}
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`pb-2 px-3 ${
                activeTab === 'provider'
                  ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {lang === 'tr' ? 'Üretici & Güvenilirlik' : 'Host & Verification'}
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`pb-2 px-3 ${
                activeTab === 'report'
                  ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {lang === 'tr' ? 'İçerik Bildir' : 'Report Listing'}
            </button>
          </div>

          {/* Tab Content: Details */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
              <p>{experience.full_description}</p>

              <div className="pt-3 border-t border-stone-200 grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-stone-900 mb-1">{lang === 'tr' ? 'Ulaşım & Erişim' : 'Accessibility & Transit'}</h4>
                  <p className="text-stone-600">
                    {experience.transportation_accessibility.join(' · ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 mb-1">{lang === 'tr' ? 'Beslenme & İkram' : 'Dietary Options'}</h4>
                  <p className="text-stone-600">
                    {experience.dietary_options.join(' · ')}
                  </p>
                </div>
              </div>

              {/* Geographic Privacy Notice */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded text-xs text-amber-900 flex items-start gap-2">
                <Compass className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{lang === 'tr' ? 'Konum Gizliliği Bildirimi:' : 'Location Privacy Notice:'}</span>
                  <span>
                    {lang === 'tr'
                      ? 'Yerel zanaatkarlarımızın ve köy hanelerimizin mahremiyetini korumak için kesin ev adresi ve tam koordinatlar yayınlanmaz. Rezervasyon onaylandığında buluşma noktası rehberi iletilir.'
                      : 'Exact residential addresses are shielded to protect rural families. Meetup coordinates are shared exclusively upon direct verified contact.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Provider Trust */}
          {activeTab === 'provider' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] rounded-lg border border-stone-200">
                <div className="w-12 h-12 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center font-serif text-lg font-bold">
                  {experience.provider.business_or_artisan_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    {experience.provider.business_or_artisan_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {lang === 'tr' ? 'Doğrulanmış Yerel Üretici' : 'Verified Local Producer'}
                    </span>
                    <span>·</span>
                    <span>{experience.provider.years_active} {lang === 'tr' ? 'yıldır bölgede aktif' : 'years active in region'}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-stone-600 space-y-2">
                <p>
                  <strong>{lang === 'tr' ? 'Doğrulama Standardı:' : 'Verification Standard:'}</strong>{' '}
                  {lang === 'tr'
                    ? 'Bu üretici zanaatkar odası veya yerel belediye/muhtarlık kayıtları incelenerek platform moderatörleri tarafından manuel olarak onaylanmıştır. Deneyim turistik kitle acentesi tarafından değil, doğrudan üretici tarafından icra edilir.'
                    : 'This producer has been vetted by human platform moderators via artisan chamber registry and municipal records.'}
                </p>
              </div>
            </div>
          )}

          {/* Tab Content: Incident Reporting */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              {reportSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs">
                  <span className="font-semibold block mb-1">
                    {lang === 'tr' ? 'Bildiriminiz Alındı' : 'Report Received'}
                  </span>
                  <span>
                    {lang === 'tr'
                      ? 'Deneyim denetim ekibimiz tarafından incelemeye alınmıştır. Güvenilir ve otantik kalmamıza katkı sağladığınız için teşekkürler.'
                      : 'Our moderation team is investigating. Thank you for maintaining authentic standards.'}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {lang === 'tr' ? 'Bildirim Sebebi' : 'Report Reason'}
                    </label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value as ReportReason)}
                      className="w-full text-xs p-2 border border-stone-300 rounded bg-white"
                    >
                      <option value="OVERCROWDED_TOURIST_TRAP">
                        {lang === 'tr' ? 'Ticari / Kalabalık Turist Tuzağı' : 'Overcrowded Tourist Trap'}
                      </option>
                      <option value="MISLEADING_LOCATION">
                        {lang === 'tr' ? 'Yanıltıcı Konum Bilgisi' : 'Misleading Location'}
                      </option>
                      <option value="SAFETY_CONCERN">
                        {lang === 'tr' ? 'Güvenlik / Sağlık Kaygısı' : 'Safety Concern'}
                      </option>
                      <option value="FRAUD">
                        {lang === 'tr' ? 'Gerçek Olmayan Üretici / Dolandırıcılık' : 'Fraud / Fake Listing'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {lang === 'tr' ? 'Ayrıntılar' : 'Details'}
                    </label>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      placeholder={
                        lang === 'tr'
                          ? 'Karşılaştığınız uygunsuzluğu veya yanıltıcı durumu açıklayınız...'
                          : 'Describe the issue observed...'
                      }
                      className="w-full text-xs p-2 border border-stone-300 rounded"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'tr' ? 'Moderatöre İlet' : 'Submit Report'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
