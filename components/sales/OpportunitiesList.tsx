import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, ClipboardCheck, AlertOctagon, FileOutput } from 'lucide-react';
import { Department, OpportunityStatus } from '../../types';
import { MOCK_USERS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { OppStatusBadge, PriorityBadge, KpiCard, EmptyState, formatMoney, inputClass } from './shared';

const STATUSES: OpportunityStatus[] = ['Submitted', 'Under Review', 'Incomplete', 'Assigned', 'RFQ Raised', 'Cancelled'];
const DEPARTMENTS: Department[] = ['Architecture', 'Civil', 'Safety', 'Surveying', 'Modern', 'Khitbrah'];

/** B2 queue: every quote request between "client asked" and "RFQ raised". */
export const OpportunitiesList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { opportunities } = useSales();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');

  const filtered = useMemo(() => opportunities.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      o.title.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.clientName.toLowerCase().includes(q) ||
      (o.rfqId || '').toLowerCase().includes(q);
    return matchesSearch &&
      (!statusFilter || o.status === statusFilter) &&
      (!deptFilter || o.departments.includes(deptFilter as Department)) &&
      (!ownerFilter || o.owner.id === ownerFilter);
  }), [opportunities, search, statusFilter, deptFilter, ownerFilter]);

  const kpis = useMemo(() => ({
    awaiting: opportunities.filter(o => o.status === 'Submitted').length,
    incomplete: opportunities.filter(o => o.status === 'Incomplete').length,
    rfq: opportunities.filter(o => o.status === 'RFQ Raised').length,
    value: opportunities
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0),
  }), [opportunities]);

  const hasFilters = search || statusFilter || deptFilter || ownerFilter;
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setDeptFilter(''); setOwnerFilter(''); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('sales.opportunities.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('sales.opportunities.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('sales.kpi.awaitingReview')} value={kpis.awaiting} icon={<ClipboardCheck size={20} />} tone="amber" />
        <KpiCard label={t('sales.kpi.incomplete')} value={kpis.incomplete} icon={<AlertOctagon size={20} />} tone="red" />
        <KpiCard label={t('sales.kpi.rfqRaised')} value={kpis.rfq} icon={<FileOutput size={20} />} tone="green" />
        <KpiCard label={t('sales.kpi.pipelineValue')} value={formatMoney(kpis.value)} icon={<Briefcase size={20} />} tone="blue" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('sales.opportunities.searchPlaceholder')}
            className={`${inputClass} ps-9`}
          />
          <Search className="absolute start-3 top-2.5 text-gray-400" size={16} />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('filters.status')}: {t('filters.all')}</option>
          {STATUSES.map(s => <option key={s} value={s}>{t(`sales.oppStatus.${s}`)}</option>)}
        </select>

        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('filters.department')}: {t('filters.all')}</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{t(`enums.departments.${d}`)}</option>)}
        </select>

        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('sales.filters.owner')}: {t('filters.all')}</option>
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
            icon={<Briefcase size={22} />}
            title={hasFilters ? t('sales.empty.filteredTitle') : t('sales.empty.opportunities')}
            description={hasFilters ? t('sales.empty.filteredDesc') : t('sales.empty.opportunitiesDesc')}
            action={hasFilters && <button onClick={clearFilters} className="text-sm text-blue-600 font-medium">{t('filters.clear')}</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{t('sales.columns.request')}</Th>
                  <Th>{t('sales.columns.client')}</Th>
                  <Th className="hidden lg:table-cell">{t('sales.columns.departments')}</Th>
                  <Th className="hidden xl:table-cell">{t('sales.columns.owner')}</Th>
                  <Th className="hidden lg:table-cell">{t('sales.columns.value')}</Th>
                  <Th>{t('sales.columns.status')}</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(opp => (
                  <tr
                    key={opp.id}
                    onClick={() => navigate(`/opportunities/${opp.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        {opp.id}{opp.rfqId && <span className="text-green-600"> → {opp.rfqId}</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{opp.clientName}</p>
                      <p className="text-xs font-mono text-gray-400">{opp.clientId}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {opp.departments.map(d => (
                          <span key={d} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600 border border-gray-200">
                            {t(`enums.departments.${d}`)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <div className="flex items-center">
                        <img src={opp.owner.avatar} className="w-6 h-6 rounded-full me-2" alt="" />
                        <span className="text-xs text-gray-600">{opp.owner.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-900">{formatMoney(opp.estimatedValue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <OppStatusBadge status={opp.status} />
                        <PriorityBadge priority={opp.priority} />
                      </div>
                    </td>
                  </tr>
                ))}
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
