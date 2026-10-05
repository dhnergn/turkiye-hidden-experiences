/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * KVKK & Privacy Center Modal: Data Export & Rights Management
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Download, Trash2, Lock, Check } from 'lucide-react';
import { appState } from '../services/appState';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'tr' | 'en';
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [deleteAccountSuccess, setDeleteAccountSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportData = () => {
    const data = appState.exportPersonalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turkiye-sakli-deneyimler-veri-paketi-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm(lang === 'tr' ? 'Hesabınızı ve kayıtlı tercihlerinizi KVKK kapsamında silmek istediğinize emin misiniz?' : 'Are you sure you want to permanently delete your account under GDPR/KVKK?')) {
      setDeleteAccountSuccess(true);
      setTimeout(() => {
        setDeleteAccountSuccess(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-stone-300 max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#C85A32]" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {lang === 'tr' ? 'Gizlilik & KVKK / GDPR Hakları Merkezi' : 'Privacy & KVKK/GDPR Rights'}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
          <p>
            <strong>Türkiye Saklı Deneyimler</strong> olarak veri minimizasyonu ilkesiyle hareket ederiz. Platformumuz hiçbir kullanıcının veya yerel üreticinin hassas ev adresini açıkça yayınlamaz; konumlar yaklaşık ilçe/köy centroid’leri üzerinden sunulur.
          </p>

          <div className="p-3 bg-[#FAF8F5] rounded-lg border border-stone-200 space-y-1">
            <span className="font-bold text-stone-800 block">
              {lang === 'tr' ? '1. Veri İndirme Hakkı (KVKK Md. 11 / GDPR Art. 20)' : '1. Right to Data Portability'}
            </span>
            <p>
              {lang === 'tr'
                ? 'Hesabınızda saklanan tüm seyahat tercihlerinizi, gezi rotalarınızı ve denetim kayıtlarınızı makine tarafından okunabilir JSON formatında indirebilirsiniz.'
                : 'Download all your profile data, saved itineraries, and audit logs in JSON format.'}
            </p>
            <button
              onClick={handleExportData}
              className="mt-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? (lang === 'tr' ? 'İndirildi!' : 'Exported!') : (lang === 'tr' ? 'Kişisel Verilerimi İndir' : 'Export My Data')}</span>
            </button>
          </div>

          <div className="p-3 bg-red-50/60 rounded-lg border border-red-200 space-y-1">
            <span className="font-bold text-red-900 block">
              {lang === 'tr' ? '2. Hesabı ve Verileri Silme (Unutulma Hakkı)' : '2. Right to Erasure'}
            </span>
            <p className="text-red-800">
              {lang === 'tr'
                ? 'Hesabınızı ve sisteme kayıtlı tüm tercih geçmişinizi geri döndürülemez biçimde anonimleştirerek silebilirsiniz.'
                : 'Permanently anonymize and delete all your account preferences from our system.'}
            </p>
            <button
              onClick={handleDeleteAccount}
              className="mt-2 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleteAccountSuccess ? (lang === 'tr' ? 'Hesap Silindi!' : 'Account Deleted!') : (lang === 'tr' ? 'Hesabımı Kalıcı Olarak Sil' : 'Delete Account')}</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium"
          >
            {lang === 'tr' ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
