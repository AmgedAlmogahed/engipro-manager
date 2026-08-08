import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Send, Handshake, Trophy } from 'lucide-react';
import { QuotationStatus } from '../../types';
import { MOCK_USERS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { quoteTotals } from '../../utils/quote';
import { QuoteStatusBadge, KpiCard, EmptyState, formatMoney, inputClass } from './shared';

const STATUSES: QuotationStatus[] = ['Ready', 'Sent', 'Negotiation', 'Won', 'Lost'];

/** B4 register: every offer that exists, at whatever point of its life. */
export const QuotationsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { quotations } = useSales();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');

  const filtered = useMemo(() => quotations.filter(q => {
    const term = search.toLowerCase();
    const matchesSearch = !term ||
      q.id.toLowerCase().includes(term) ||
      q.title.toLowerCase().includes(term) ||
      q.clientName.toLowerCase().includes(term) ||
      (q.poId || '').toLowerCase().includes(term);
    return matchesSearch &&
      (!statusFilter || q.status === statusFilter) &&
      (!ownerFilter || q.owner.id === ownerFilter);
  }), [quotations, search, statusFilter, ownerFilter]);

  const kpis = useMemo(() => {
    const won = quotations.filter(q => q.status === 'Won');
    const decided = quotations.filter(q => q.status === 'Won' || q.status === 'Lost');
    return {
      open: quotations.filter(q => q.status === 'Ready' || q.status === 'Sent' || q.status === 'Negotiation').length,
      negotiating: quotations.filter(q => q.status === 'Negotiation').length,
      wonValue: won.reduce((sum, q) => sum + quoteTotals(q).total, 0),
      winRate: decided.length ? Math.round((won.length / decided.length) * 100) : 0,
    };
  }, [quotations]);

  const hasFilters = search || statusFilter || ownerFilter;
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setOwnerFilter(''); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('sales.quotations.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('sales.quotations.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('sales.kpi.openQuotes')} value={kpis.open} icon={<FileText size={20} />} tone="blue" />
        <KpiCard label={t('sales.kpi.negotiating')} value={kpis.negotiating} icon={<Handshake size={20} />} tone="amber" />
        <KpiCard label={t('sales.kpi.wonValue')} value={formatMoney(kpis.wonValue)} icon={<Trophy size={20} />} tone="green" />
        <KpiCard label={t('sales.kpi.winRate')} value={`${kpis.winRate}%`} icon={<Send size={20} />} tone="violet" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('sales.quotations.searchPlaceholder')}
            className={`${inputClass} ps-9`}
          />
          <Search className="absolute start-3 top-2.5 text-gray-400" size={16} />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('filters.status')}: {t('filters.all')}</option>
          {STATUSES.map(s => <option key={s} value={s}>{t(`sales.quoteStatus.${s}`)}</option>)}
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
            icon={<FileText size={22} />}
            title={hasFilters ? t('sales.empty.filteredTitle') : t('sales.empty.quotations')}
            description={hasFilters ? t('sales.empty.filteredDesc') : t('sales.empty.quotationsDesc')}
            action={hasFilters && <button onClick={clearFilters} className="text-sm text-blue-600 font-medium">{t('filters.clear')}</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{t('sales.columns.quotation')}</Th>
                  <Th>{t('sales.columns.client')}</Th>
                  <Th className="hidden lg:table-cell">{t('sales.columns.owner')}</Th>
                  <Th className="hidden xl:table-cell">{t('sales.offer.grandTotal')}</Th>
                  <Th>{t('sales.columns.status')}</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(quote => (
                  <tr
                    key={quote.id}
                    onClick={() => navigate(`/quotations/${quote.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{quote.title}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        {quote.id} · v{quote.version}
                        {quote.poId && <span className="text-green-600"> → {quote.poId}</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{quote.clientName}</p>
                      <p className="text-xs font-mono text-gray-400">{quote.rfqId}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center">
                        <img src={quote.owner.avatar} className="w-6 h-6 rounded-full me-2" alt="" />
                        <span className="text-xs text-gray-600">{quote.owner.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell text-sm font-medium text-gray-900">
                      {formatMoney(quoteTotals(quote).total)}
                    </td>
                    <td className="px-6 py-4"><QuoteStatusBadge status={quote.status} /></td>
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
