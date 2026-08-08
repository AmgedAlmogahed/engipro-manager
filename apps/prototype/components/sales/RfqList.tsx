import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Inbox, Calculator, Stamp, FileCheck2 } from 'lucide-react';
import { Department, RfqStatus } from '../../types';
import { MOCK_USERS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { quoteTotals } from '../../utils/quote';
import { RfqStatusBadge, PriorityBadge, KpiCard, EmptyState, formatMoney, inputClass } from './shared';

const STATUSES: RfqStatus[] = ['Received', 'Accepted', 'Pricing', 'Offer Ready', 'In Approval', 'Approved', 'Quoted', 'Rejected'];
const DEPARTMENTS: Department[] = ['Architecture', 'Civil', 'Safety', 'Surveying', 'Modern', 'Khitbrah'];

/** B3 queue: everything the technical side owes an answer on. */
export const RfqList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { rfqs, quotations } = useSales();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [pricerFilter, setPricerFilter] = useState('');

  const valueOf = (quotationId?: string) => {
    const quote = quotations.find(q => q.id === quotationId);
    return quote ? quoteTotals(quote).total : undefined;
  };

  const filtered = useMemo(() => rfqs.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q);
    return matchesSearch &&
      (!statusFilter || r.status === statusFilter) &&
      (!deptFilter || r.departments.includes(deptFilter as Department)) &&
      (!pricerFilter || r.assignments.some(a => a.assignee.id === pricerFilter));
  }), [rfqs, search, statusFilter, deptFilter, pricerFilter]);

  const kpis = useMemo(() => ({
    incoming: rfqs.filter(r => r.status === 'Received').length,
    pricing: rfqs.filter(r => r.status === 'Pricing' || r.status === 'Offer Ready').length,
    approval: rfqs.filter(r => r.status === 'In Approval').length,
    quoted: rfqs.filter(r => r.status === 'Quoted').length,
  }), [rfqs]);

  const hasFilters = search || statusFilter || deptFilter || pricerFilter;
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setDeptFilter(''); setPricerFilter(''); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('sales.rfqs.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('sales.rfqs.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('sales.kpi.incoming')} value={kpis.incoming} icon={<Inbox size={20} />} tone="blue" />
        <KpiCard label={t('sales.kpi.inPricing')} value={kpis.pricing} icon={<Calculator size={20} />} tone="amber" />
        <KpiCard label={t('sales.kpi.inApproval')} value={kpis.approval} icon={<Stamp size={20} />} tone="violet" />
        <KpiCard label={t('sales.kpi.quoted')} value={kpis.quoted} icon={<FileCheck2 size={20} />} tone="green" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('sales.rfqs.searchPlaceholder')}
            className={`${inputClass} ps-9`}
          />
          <Search className="absolute start-3 top-2.5 text-gray-400" size={16} />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('filters.status')}: {t('filters.all')}</option>
          {STATUSES.map(s => <option key={s} value={s}>{t(`sales.rfqStatus.${s}`)}</option>)}
        </select>

        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('filters.department')}: {t('filters.all')}</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{t(`enums.departments.${d}`)}</option>)}
        </select>

        <select value={pricerFilter} onChange={e => setPricerFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('sales.rfq.pricer')}: {t('filters.all')}</option>
          {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 font-medium px-2 whitespace-nowrap">
            {t('filters.clear')}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox size={22} />}
            title={hasFilters ? t('sales.empty.filteredTitle') : t('sales.empty.rfqs')}
            description={hasFilters ? t('sales.empty.filteredDesc') : t('sales.empty.rfqsDesc')}
            action={hasFilters && <button onClick={clearFilters} className="text-sm text-blue-600 font-medium">{t('filters.clear')}</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{t('sales.columns.request')}</Th>
                  <Th>{t('sales.columns.client')}</Th>
                  <Th className="hidden lg:table-cell">{t('sales.rfq.team')}</Th>
                  <Th className="hidden xl:table-cell">{t('sales.columns.value')}</Th>
                  <Th>{t('sales.columns.status')}</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(rfq => {
                  const lead = rfq.assignments.find(a => a.isLead);
                  return (
                    <tr
                      key={rfq.id}
                      onClick={() => navigate(`/rfqs/${rfq.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">
                          {rfq.id}{rfq.quotationId && <span className="text-green-600"> → {rfq.quotationId}</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{rfq.clientName}</p>
                        <p className="text-xs font-mono text-gray-400">{rfq.clientId}</p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          {rfq.assignments.map(a => (
                            <img
                              key={a.id}
                              src={a.assignee.avatar}
                              title={`${a.assignee.name} — ${t(`enums.departments.${a.department}`)}${a.isLead ? ` (${t('sales.rfq.lead')})` : ''}`}
                              className={`w-7 h-7 rounded-full border-2 ${a.isLead ? 'border-blue-500' : 'border-white'}`}
                              alt=""
                            />
                          ))}
                        </div>
                        {lead && <p className="text-xs text-gray-500 mt-1">{t('sales.rfq.lead')}: {lead.assignee.name}</p>}
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell text-sm text-gray-900">
                        {formatMoney(valueOf(rfq.quotationId))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <RfqStatusBadge status={rfq.status} />
                          <PriorityBadge priority={rfq.priority} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
            {t('common.showing')} <span className="font-medium">{filtered.length}</span> {t('common.results')}
          </div>
        )}
      </div>
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>
);
