/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Responsive Navigation Header with Role Switcher & Language Support
 */

import React from 'react';
import { Compass, Map, Bookmark, ShieldCheck, UserCheck, Lock, Globe } from 'lucide-react';
import { CurrentSessionUser } from '../services/appState';

interface NavbarProps {
  currentTab: 'explore' | 'map' | 'itinerary' | 'provider' | 'admin';
  setCurrentTab: (tab: 'explore' | 'map' | 'itinerary' | 'provider' | 'admin') => void;
  currentUser: CurrentSessionUser;
  onRoleChange: (role: 'TRAVELLER' | 'PROVIDER' | 'ADMIN') => void;
  savedCount: number;
  lang: 'tr' | 'en';
  setLang: (lang: 'tr' | 'en') => void;
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onRoleChange,
  savedCount,
  lang,
  setLang,
  onOpenPrivacy,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('explore')}>
            <div className="w-10 h-10 rounded-lg bg-[#C85A32] flex items-center justify-center text-white shadow-sm">
              <Compass className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-stone-900 tracking-tight block leading-tight">
                Türkiye Saklı Deneyimler
              </span>
              <span className="text-[11px] text-stone-500 font-sans tracking-wide block uppercase">
                {lang === 'tr' ? 'Doğrulanmış Yerel Rotalar' : 'Verified Local Experiences'}
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Clean typography, zero-pill discipline) */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setCurrentTab('explore')}
              className={`text-sm font-medium transition-colors pb-1 flex items-center gap-1.5 ${
                currentTab === 'explore'
                  ? 'text-[#C85A32] border-b-2 border-[#C85A32]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              {lang === 'tr' ? 'Keşfet & Eşleş' : 'Explore & Match'}
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`text-sm font-medium transition-colors pb-1 flex items-center gap-1.5 ${
                currentTab === 'map'
                  ? 'text-[#C85A32] border-b-2 border-[#C85A32]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Map className="w-4 h-4" />
              {lang === 'tr' ? 'Saklı Harita' : 'Hidden Map'}
            </button>

            <button
              onClick={() => setCurrentTab('itinerary')}
              className={`text-sm font-medium transition-colors pb-1 flex items-center gap-1.5 ${
                currentTab === 'itinerary'
                  ? 'text-[#C85A32] border-b-2 border-[#C85A32]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {lang === 'tr' ? 'Gezi Planım' : 'My Itinerary'}
              {savedCount > 0 && (
                <span className="ml-1 text-xs bg-stone-200 text-stone-800 font-semibold px-1.5 py-0.2 rounded">
                  {savedCount}
                </span>
              )}
            </button>

            {currentUser.role === 'PROVIDER' && (
              <button
                onClick={() => setCurrentTab('provider')}
                className={`text-sm font-medium transition-colors pb-1 flex items-center gap-1.5 ${
                  currentTab === 'provider'
                    ? 'text-[#C85A32] border-b-2 border-[#C85A32]'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                {lang === 'tr' ? 'Üretici Paneli' : 'Provider Panel'}
              </button>
            )}

            {currentUser.role === 'ADMIN' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`text-sm font-medium transition-colors pb-1 flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'text-[#C85A32] border-b-2 border-[#C85A32]'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === 'tr' ? 'Moderatör Paneli' : 'Admin Panel'}
              </button>
            )}
          </nav>

          {/* Right Action Tools: Role Simulator, Privacy, Language */}
          <div className="flex items-center gap-3">
            {/* Role Simulation Switcher for Testing All 3 Required Personas */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-xs">
              <button
                onClick={() => onRoleChange('TRAVELLER')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currentUser.role === 'TRAVELLER'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Gezgin Görünümü"
              >
                {lang === 'tr' ? 'Gezgin' : 'Traveller'}
              </button>
              <button
                onClick={() => {
                  onRoleChange('PROVIDER');
                  setCurrentTab('provider');
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currentUser.role === 'PROVIDER'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Yerel Üretici / Zanaatkar Görünümü"
              >
                {lang === 'tr' ? 'Üretici' : 'Provider'}
              </button>
              <button
                onClick={() => {
                  onRoleChange('ADMIN');
                  setCurrentTab('admin');
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Yönetici ve Denetim Görünümü"
              >
                {lang === 'tr' ? 'Yönetici' : 'Admin'}
              </button>
            </div>

            {/* Privacy & KVKK Trigger */}
            <button
              onClick={onOpenPrivacy}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
              title="Gizlilik ve KVKK Ayarları"
              aria-label="Gizlilik Politikası ve KVKK"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="px-2 py-1 text-xs font-mono font-medium text-stone-700 hover:text-stone-900 border border-stone-200 rounded hover:bg-stone-100 flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              {lang.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 bg-white py-2 px-3 text-xs">
        <button
          onClick={() => setCurrentTab('explore')}
          className={`py-1 px-2 ${currentTab === 'explore' ? 'text-[#C85A32] font-bold' : 'text-stone-600'}`}
        >
          {lang === 'tr' ? 'Keşfet' : 'Explore'}
        </button>
        <button
          onClick={() => setCurrentTab('map')}
          className={`py-1 px-2 ${currentTab === 'map' ? 'text-[#C85A32] font-bold' : 'text-stone-600'}`}
        >
          {lang === 'tr' ? 'Harita' : 'Map'}
        </button>
        <button
          onClick={() => setCurrentTab('itinerary')}
          className={`py-1 px-2 ${currentTab === 'itinerary' ? 'text-[#C85A32] font-bold' : 'text-stone-600'}`}
        >
          {lang === 'tr' ? 'Gezi Planı' : 'Itinerary'} ({savedCount})
        </button>
        {currentUser.role === 'PROVIDER' && (
          <button
            onClick={() => setCurrentTab('provider')}
            className={`py-1 px-2 ${currentTab === 'provider' ? 'text-[#C85A32] font-bold' : 'text-stone-600'}`}
          >
            {lang === 'tr' ? 'Üretici' : 'Provider'}
          </button>
        )}
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`py-1 px-2 ${currentTab === 'admin' ? 'text-[#C85A32] font-bold' : 'text-stone-600'}`}
          >
            {lang === 'tr' ? 'Yönetici' : 'Admin'}
          </button>
        )}
      </div>
    </header>
  );
};
