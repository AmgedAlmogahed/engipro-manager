import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, UserPlus, Clock, AlertTriangle, CheckCircle2,
  Building2, Crown, Moon, Users, Star
} from 'lucide-react';
import { Client, ClientStatus, LEAD_STATUSES } from '../../types';
import { CLIENT_CHANNELS, MOCK_USERS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import {
  StatusBadge, PriorityBadge, SlaBadge, ChannelChip, KpiCard, EmptyState,
  formatMoney, daysSince, inputClass
} from './shared';
import { NewClientModal } from './NewClientModal';

/**
 * One table, two views. "Leads" filters the open statuses, "Clients" the converted ones —
 * exactly as described in module B1 of the process flow.
 */
export const ClientsList: React.FC<{ mode: 'leads' | 'clients' }> = ({ mode }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { clients } = useSales();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [showNew, setShowNew] = useState(false);

  const scopeStatuses: ClientStatus[] = mode === 'leads'
    ? LEAD_STATUSES
    : ['Client', 'Dormant'];

  const scoped = useMemo(
    () => clients.filter(c => scopeStatuses.includes(c.status) || (mode === 'leads' && c.status === 'Disqualified')),
    [clients, mode]
  );

  const filtered = useMemo(() => scoped.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      c.email.toLowerCase().includes(q);
    return matchesSearch &&
      (!statusFilter || c.status === statusFilter) &&
      (!channelFilter || c.channel === channelFilter) &&
      (!ownerFilter || c.owner.id === ownerFilter);
  }), [scoped, search, statusFilter, channelFilter, ownerFilter]);

  const kpis = useMemo(() => ({
    newLeads: scoped.filter(c => c.status === 'New Lead').length,
    overdue: scoped.filter(c => c.slaStatus === 'Overdue').length,
    qualified: scoped.filter(c => c.status === 'Qualified').length,
    active: scoped.filter(c => c.status === 'Client').length,
    vip: scoped.filter(c => c.isVip).length,
    dormant: scoped.filter(c => c.status === 'Dormant').length,
    value: scoped.reduce((sum, c) => sum + (mode === 'leads' ? (c.estimatedBudget || 0) : c.lifetimeValue), 0),
  }), [scoped, mode]);

  const hasFilters = search || statusFilter || channelFilter || ownerFilter;
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setChannelFilter(''); setOwnerFilter(''); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'leads' ? t('sales.leads.title') : t('sales.clients.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'leads' ? t('sales.leads.subtitle') : t('sales.clients.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-colors flex items-center"
        >
          <Plus size={16} className="me-2" />
          {t('sales.actions.newLead')}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mode === 'leads' ? (
          <>
            <KpiCard label={t('sales.kpi.newLeads')} value={kpis.newLeads} icon={<UserPlus size={20} />} tone="blue" />
            <KpiCard label={t('sales.kpi.qualified')} value={kpis.qualified} icon={<CheckCircle2 size={20} />} tone="violet" />
            <KpiCard label={t('sales.kpi.slaOverdue')} value={kpis.overdue} icon={<AlertTriangle size={20} />} tone="red" />
            <KpiCard label={t('sales.kpi.expectedValue')} value={formatMoney(kpis.value)} icon={<Clock size={20} />} tone="amber" />
          </>
        ) : (
          <>
            <KpiCard label={t('sales.kpi.activeClients')} value={kpis.active} icon={<Users size={20} />} tone="green" />
            <KpiCard label={t('sales.kpi.vip')} value={kpis.vip} icon={<Crown size={20} />} tone="amber" />
            <KpiCard label={t('sales.kpi.dormant')} value={kpis.dormant} icon={<Moon size={20} />} tone="violet" />
            <KpiCard label={t('sales.kpi.lifetimeValue')} value={formatMoney(kpis.value)} icon={<Building2 size={20} />} tone="blue" />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('sales.filters.searchPlaceholder')}
            className={`${inputClass} ps-9`}
          />
          <Search className="absolute start-3 top-2.5 text-gray-400" size={16} />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('filters.status')}: {t('filters.all')}</option>
          {scopeStatuses.concat(mode === 'leads' ? ['Disqualified'] : []).map(s => (
            <option key={s} value={s}>{t(`sales.status.${s}`)}</option>
          ))}
        </select>

        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className={`${inputClass} md:w-auto`}>
          <option value="">{t('sales.filters.channel')}: {t('filters.all')}</option>
          {CLIENT_CHANNELS.map(c => <option key={c} value={c}>{t(`sales.channel.${c}`)}</option>)}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={22} />}
            title={hasFilters ? t('sales.empty.filteredTitle') : t('sales.empty.title')}
            description={hasFilters ? t('sales.empty.filteredDesc') : t('sales.empty.desc')}
            action={hasFilters
              ? <button onClick={clearFilters} className="text-sm text-blue-600 font-medium">{t('filters.clear')}</button>
              : <button onClick={() => setShowNew(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">{t('sales.actions.newLead')}</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{t('sales.columns.record')}</Th>
                  <Th>{t('sales.columns.status')}</Th>
                  <Th className="hidden lg:table-cell">{t('sales.columns.channel')}</Th>
                  <Th className="hidden xl:table-cell">{t('sales.columns.owner')}</Th>
                  <Th className="hidden lg:table-cell">{mode === 'leads' ? t('sales.columns.budget') : t('sales.columns.lifetimeValue')}</Th>
                  <Th>{mode === 'leads' ? t('sales.columns.sla') : t('sales.columns.lastActivity')}</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(client => (
                  <ClientRow key={client.id} client={client} mode={mode} onOpen={() => navigate(`/clients/${client.id}`)} />
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

      {showNew && <NewClientModal onClose={() => setShowNew(false)} onCreated={id => navigate(`/clients/${id}`)} />}
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>
);

const ClientRow: React.FC<{ client: Client; mode: 'leads' | 'clients'; onOpen: () => void }> = ({ client, mode, onOpen }) => {
  const { t } = useLanguage();
  const idle = daysSince(client.lastInteractionAt);
  return (
    <tr onClick={onOpen} className="hover:bg-gray-50 transition-colors cursor-pointer">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold border border-slate-200">
            {client.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="ms-4 min-w-0">
            <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
              <span className="truncate">{client.name}</span>
              {client.isVip && <Star size={13} className="text-amber-500 fill-amber-400 shrink-0" />}
            </div>
            <div className="text-xs text-gray-500 font-mono">{client.id}</div>
            <div className="text-xs text-gray-400 mt-0.5">{client.phone || client.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={client.status} />
          <PriorityBadge priority={client.priority} />
        </div>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <ChannelChip channel={client.channel} />
        {client.city && <div className="text-xs text-gray-400 mt-1">{client.city}</div>}
      </td>
      <td className="px-6 py-4 hidden xl:table-cell">
        <div className="flex items-center">
          <img src={client.owner.avatar} className="w-6 h-6 rounded-full me-2" alt="" />
          <span className="text-xs text-gray-600">{client.owner.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-900">
        {mode === 'leads' ? formatMoney(client.estimatedBudget) : formatMoney(client.lifetimeValue)}
      </td>
      <td className="px-6 py-4">
        {mode === 'leads'
          ? <SlaBadge sla={client.slaStatus} />
          : <span className="text-xs text-gray-600">
              {idle === undefined ? '—' : `${idle} ${t('sales.misc.daysAgo')}`}
            </span>}
      </td>
    </tr>
  );
};
