/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Main Application Shell integrating All Modules & Verification
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TravelRequestHero } from './components/TravelRequestHero';
import { ExperienceCard } from './components/ExperienceCard';
import { ExperienceDetailModal } from './components/ExperienceDetailModal';
import { PrivacyMap } from './components/PrivacyMap';
import { ItineraryView } from './components/ItineraryView';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PrivacyModal } from './components/PrivacyModal';
import { appState, CurrentSessionUser } from './services/appState';
import { extractPreferencesFromPrompt } from './services/travelRequestService';
import { rankExperiencesWithDiversity } from './services/recommendationEngine';
import { PublicExperienceDTO, ContentStatus, ReportReason } from './types/database';
import { ExtractedTravelPreferencesDTO, CreateExperienceDTO } from './types/api';
import { Compass, ShieldCheck, Heart, Sliders, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'explore' | 'map' | 'itinerary' | 'provider' | 'admin'>('explore');
  const [currentUser, setCurrentUser] = useState<CurrentSessionUser>(appState.getCurrentUser());
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Experience Data State
  const [allExperiences, setAllExperiences] = useState<PublicExperienceDTO[]>(appState.getAllExperiencesForAdmin());
  const [savedFavorites, setSavedFavorites] = useState<string[]>(appState.getFavorites());
  const [savedTrip, setSavedTrip] = useState(appState.getSavedTrip());
  const [selectedExperience, setSelectedExperience] = useState<PublicExperienceDTO | null>(null);

  // Recommendations State
  const [currentPreferences, setCurrentPreferences] = useState<ExtractedTravelPreferencesDTO | null>(null);
  const [rankedExperiences, setRankedExperiences] = useState<PublicExperienceDTO[]>(appState.getExperiences());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Handle Natural Language Search Request
  const handleNaturalSearch = (prompt: string) => {
    const extracted = extractPreferencesFromPrompt(prompt);
    setCurrentPreferences(extracted);
    const rankedMatches = rankExperiencesWithDiversity(appState.getExperiences(), extracted, undefined, lang);
    setRankedExperiences(rankedMatches.map(m => m.experience));
    setCurrentTab('explore');
  };

  // Handle Preference Questionnaire Apply
  const handleApplyPreferences = (prefs: ExtractedTravelPreferencesDTO) => {
    setCurrentPreferences(prefs);
    const rankedMatches = rankExperiencesWithDiversity(appState.getExperiences(), prefs, undefined, lang);
    setRankedExperiences(rankedMatches.map(m => m.experience));
    setCurrentTab('explore');
  };

  // Role Simulation Switcher
  const handleRoleChange = (role: 'TRAVELLER' | 'PROVIDER' | 'ADMIN') => {
    appState.setCurrentRole(role);
    setCurrentUser(appState.getCurrentUser());
  };

  // Favorite / Save to Trip Toggles
  const handleToggleSave = (expId: string) => {
    const isNowSaved = appState.toggleFavorite(expId);
    setSavedFavorites(appState.getFavorites());
    if (isNowSaved) {
      appState.addToTrip(expId, 1, 'Kişisel rota durağı');
    } else {
      appState.removeFromTrip(expId);
    }
    setSavedTrip({ ...appState.getSavedTrip() });
  };

  const handleRemoveFromTrip = (expId: string) => {
    appState.removeFromTrip(expId);
    setSavedFavorites(appState.getFavorites());
    setSavedTrip({ ...appState.getSavedTrip() });
  };

  // Provider Submissions
  const handleCreateExperience = (dto: CreateExperienceDTO) => {
    appState.createExperience(dto);
    setAllExperiences([...appState.getAllExperiencesForAdmin()]);
  };

  // Admin Moderation
  const handleUpdateStatus = (id: string, status: ContentStatus, notes?: string) => {
    appState.updateExperienceStatus(id, status, notes);
    setAllExperiences([...appState.getAllExperiencesForAdmin()]);
    setRankedExperiences([...appState.getExperiences()]);
  };

  const handleResolveReport = (id: string, notes: string) => {
    appState.resolveReport(id, notes);
  };

  // Report Submission
  const handleReport = (expId: string, reason: ReportReason, details: string) => {
    appState.createReport({ target_type: 'EXPERIENCE', target_id: expId, reason, details });
  };

  // Filter Active Catalog
  const displayedExperiences = rankedExperiences.filter(exp => {
    if (activeCategoryFilter === 'ALL') return true;
    return exp.category === activeCategoryFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans antialiased selection:bg-[#C85A32]/20 selection:text-[#9C3D1B]">
      {/* Top Application Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        savedCount={savedFavorites.length}
        lang={lang}
        setLang={setLang}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'explore' && (
          <div>
            {/* Natural-Language Travel Request Hero & Questionnaire */}
            <TravelRequestHero
              onSearchPrompt={handleNaturalSearch}
              onApplyPreferences={handleApplyPreferences}
              lang={lang}
            />

            {/* Catalog Grid Section with Anti-Slop Unboxed Filter Controls */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                    {currentPreferences
                      ? (lang === 'tr' ? 'Size Özel Eşleşen Saklı Deneyimler' : 'Personalized Recommendations for You')
                      : (lang === 'tr' ? 'Öne Çıkan Yerel Rotalar' : 'Featured Local Routes')}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === 'tr'
                      ? 'Ticari acentelerden uzak, doğrudan yerel halk ve zanaatkarlar tarafından yürütülen rotalar.'
                      : 'Authentic workshops and rural experiences managed directly by local families.'}
                  </p>
                </div>

                {/* Category Filter Controls */}
                <div className="flex flex-wrap gap-1 text-xs">
                  {[
                    { id: 'ALL', tr: 'Tüm Kategoriler', en: 'All' },
                    { id: 'CRAFTS', tr: 'Zanaat & Atölye', en: 'Crafts' },
                    { id: 'LOCAL_FOOD', tr: 'Yerel Gastronomi', en: 'Food' },
                    { id: 'RURAL_LIFE', tr: 'Köy & Çiftlik', en: 'Rural' },
                    { id: 'NATURE_HIKING', tr: 'Doğa & Yürüyüş', en: 'Nature' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategoryFilter(c.id)}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        activeCategoryFilter === c.id
                          ? 'bg-[#C85A32] text-white shadow-xs'
                          : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {lang === 'tr' ? c.tr : c.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedExperiences.map(exp => (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    isSaved={savedFavorites.includes(exp.id)}
                    onToggleSave={handleToggleSave}
                    onSelect={setSelectedExperience}
                    lang={lang}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {currentTab === 'map' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                {lang === 'tr' ? 'Türkiye Saklı Rota Haritası' : 'Türkiye Hidden Routes Map'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {lang === 'tr'
                  ? 'Yerel zanaatkarlarımızın mahremiyetini korumak için yaklaşık konum centroid’leri gösterilmektedir.'
                  : 'Displaying approximate location centroids to protect the privacy of local hosts and farms.'}
              </p>
            </div>

            <PrivacyMap
              experiences={allExperiences.filter(e => e.content_status === 'APPROVED')}
              onSelectExperience={setSelectedExperience}
              lang={lang}
            />
          </section>
        )}

        {currentTab === 'itinerary' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ItineraryView
              savedTrip={savedTrip}
              allExperiences={allExperiences}
              onRemoveItem={handleRemoveFromTrip}
              onSelectExperience={setSelectedExperience}
              lang={lang}
            />
          </section>
        )}

        {currentTab === 'provider' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProviderDashboard
              onSubmitExperience={handleCreateExperience}
              lang={lang}
            />
          </section>
        )}

        {currentTab === 'admin' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminDashboard
              allExperiences={allExperiences}
              onUpdateStatus={handleUpdateStatus}
              auditLogs={appState.getAuditLogs()}
              reports={appState.getReports()}
              securityEvents={appState.getSecurityEvents()}
              onResolveReport={handleResolveReport}
              lang={lang}
            />
          </section>
        )}
      </main>

      {/* Experience Deep-Dive Modal */}
      <ExperienceDetailModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        isSaved={selectedExperience ? savedFavorites.includes(selectedExperience.id) : false}
        onToggleSave={handleToggleSave}
        onReport={handleReport}
        lang={lang}
      />

      {/* Privacy & KVKK Center Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang={lang}
      />

      {/* Footer & Defensible Location Statement */}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C85A32]" />
            <span className="font-serif font-bold text-white tracking-wide">
              Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-white transition-colors"
            >
              {lang === 'tr' ? 'KVKK Aydınlatma Metni & Gizlilik' : 'KVKK & Privacy Policy'}
            </button>
            <span>·</span>
            <span>{lang === 'tr' ? 'Sıfır Altyapı Maliyetli MVP' : 'Zero-Cost MVP Architecture'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
