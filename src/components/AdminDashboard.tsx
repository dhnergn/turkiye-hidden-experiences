/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Türkiye Hidden Experiences (Türkiye Saklı Deneyimler)
 * Admin & Moderation Dashboard: Listing Reviews, Verification Queues, Reports & Audit Trails
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  FileText,
  Lock,
  Search,
} from 'lucide-react';
import { PublicExperienceDTO, ContentStatus, AuditLog, Report, SecurityEvent } from '../types/database';

interface AdminDashboardProps {
  allExperiences: PublicExperienceDTO[];
  onUpdateStatus: (id: string, status: ContentStatus, notes?: string) => void;
  auditLogs: AuditLog[];
  reports: Report[];
  securityEvents: SecurityEvent[];
  onResolveReport: (id: string, notes: string) => void;
  lang: 'tr' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  allExperiences,
  onUpdateStatus,
  auditLogs,
  reports,
  securityEvents,
  onResolveReport,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'audit' | 'security'>('moderation');
  const [selectedExp, setSelectedExp] = useState<PublicExperienceDTO | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingExperiences = allExperiences.filter(e => e.content_status === 'PENDING_REVIEW');
  const approvedExperiences = allExperiences.filter(e => e.content_status === 'APPROVED');
  const openReports = reports.filter(r => r.status === 'OPEN' || r.status === 'INVESTIGATING');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Stat Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-medium">
            {lang === 'tr' ? 'Onay Bekleyen' : 'Pending Review'}
          </span>
          <span className="text-2xl font-bold font-mono text-amber-600">
            {pendingExperiences.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-medium">
            {lang === 'tr' ? 'Yayındaki Deneyim' : 'Active Listings'}
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {approvedExperiences.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-medium">
            {lang === 'tr' ? 'Açık Şikayetler' : 'Open Reports'}
          </span>
          <span className="text-2xl font-bold font-mono text-red-600">
            {openReports.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-medium">
            {lang === 'tr' ? 'Denetim Kayıtları' : 'Audit Logs'}
          </span>
          <span className="text-2xl font-bold font-mono text-stone-900">
            {auditLogs.length}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-stone-200 text-xs font-medium bg-[#FAF8F5]">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`py-3 px-5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'moderation'
                ? 'border-[#C85A32] text-[#C85A32] font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {lang === 'tr' ? 'Deneyim Moderasyonu' : 'Listing Moderation'}
            {pendingExperiences.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingExperiences.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'reports'
                ? 'border-[#C85A32] text-[#C85A32] font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {lang === 'tr' ? 'Gelen Şikayetler' : 'User Reports'}
            {openReports.length > 0 && (
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {openReports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'audit'
                ? 'border-[#C85A32] text-[#C85A32] font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-4 h-4" />
            {lang === 'tr' ? 'Denetim İzi (Audit Log)' : 'Audit Trail'}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'security'
                ? 'border-[#C85A32] text-[#C85A32] font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            {lang === 'tr' ? 'Güvenlik Olayları' : 'Security Events'}
          </button>
        </div>

        {/* Tab 1: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="p-6">
            {pendingExperiences.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <span className="font-semibold block text-stone-800">
                  {lang === 'tr' ? 'Onay Bekleyen Yeni İçerik Yok' : 'All Listings Moderated'}
                </span>
                <span>{lang === 'tr' ? 'Tüm yerel üretici deneyimleri denetlendi.' : 'No items awaiting review.'}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExperiences.map(exp => (
                  <div
                    key={exp.id}
                    className="p-4 border border-amber-200 bg-amber-50/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                        <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          ONAY BEKLİYOR
                        </span>
                        <span>{exp.location.province_name_tr} / {exp.location.district_name_tr}</span>
                        <span>·</span>
                        <span>{exp.provider.business_or_artisan_name}</span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-stone-900">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {exp.short_description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onUpdateStatus(exp.id, 'APPROVED', 'Moderatör tarafından doğrulanıp onaylandı')}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'tr' ? 'Onayla & Yayınla' : 'Approve'}</span>
                      </button>

                      <button
                        onClick={() => onUpdateStatus(exp.id, 'REJECTED', 'Turistik kitle turu kriterlerini aşamadı')}
                        className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'tr' ? 'Reddet' : 'Reject'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: User Reports */}
        {activeTab === 'reports' && (
          <div className="p-6">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs">
                {lang === 'tr' ? 'Kullanıcı şikayeti bulunmamaktadır.' : 'No user reports filed.'}
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(rep => (
                  <div key={rep.id} className="p-4 border border-stone-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-700 font-mono">
                        {rep.reason}
                      </span>
                      <span className="text-stone-400 font-mono text-[10px]">
                        {rep.created_at}
                      </span>
                    </div>
                    <p className="text-stone-700">{rep.details}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-stone-500">
                        Durum: <strong>{rep.status}</strong>
                      </span>
                      {rep.status !== 'RESOLVED' && (
                        <button
                          onClick={() => onResolveReport(rep.id, 'İncelendi ve giderildi')}
                          className="px-3 py-1 bg-stone-900 text-white rounded text-[11px] font-medium"
                        >
                          {lang === 'tr' ? 'Çözüldü Olarak İşaretle' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Immutable Audit Logs */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Zaman</th>
                  <th className="p-3">Aktör Rolü</th>
                  <th className="p-3">Eylem</th>
                  <th className="p-3">Kaynak Tipi</th>
                  <th className="p-3">IP Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="p-3 text-stone-500">{log.created_at.substring(0, 19).replace('T', ' ')}</td>
                    <td className="p-3 font-semibold text-stone-800">{log.actor_role}</td>
                    <td className="p-3 text-[#C85A32]">{log.action}</td>
                    <td className="p-3">{log.resource_type} ({log.resource_id.substring(0, 10)}...)</td>
                    <td className="p-3 text-stone-400">{log.ip_hash.substring(0, 12)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Security Events */}
        {activeTab === 'security' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Olay Tipi</th>
                  <th className="p-3">Önem Seviyesi</th>
                  <th className="p-3">Detay</th>
                  <th className="p-3">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {securityEvents.map(sec => (
                  <tr key={sec.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">{sec.event_type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {sec.severity}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600">{JSON.stringify(sec.metadata)}</td>
                    <td className="p-3 text-stone-400">{sec.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
