import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Phone, Mail, MapPin, Star, MessageSquarePlus, FileText,
  Ban, ChevronRight, Briefcase, History, Paperclip, Sparkles, FolderKanban, Building2
} from 'lucide-react';
import { CLIENT_STATUS_FLOW, MOCK_PROJECTS } from '../../constants';
import { ClientStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { quoteTotals } from '../../utils/quote';
import {
  StatusBadge, PriorityBadge, SlaBadge, ChannelChip, OppStatusBadge, QuoteStatusBadge,
  InteractionIcon, EmptyState, formatMoney, daysSince
} from './shared';
import { LogInteractionModal } from './LogInteractionModal';
import { StatusChangeModal } from './StatusChangeModal';
import { NewOpportunityModal } from './NewOpportunityModal';

type Tab = 'overview' | 'interactions' | 'documents' | 'opportunities' | 'quotations' | 'projects' | 'history';

/** Client card 360° — the same record whether it is still a lead or already a client. */
export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const { getClient, opportunitiesForClient, quotationsForClient, changeClientStatus } = useSales();

  const [tab, setTab] = useState<Tab>('overview');
  const [showLog, setShowLog] = useState(false);
  const [statusTarget, setStatusTarget] = useState<ClientStatus | null>(null);
  const [showOpportunity, setShowOpportunity] = useState(false);

  const client = getClient(id || '');

  if (!client) {
    return (
      <EmptyState
        icon={<Building2 size={22} />}
        title={t('sales.detail.notFound')}
        action={<button onClick={() => navigate('/leads')} className="text-sm text-blue-600 font-medium">{t('sales.leads.title')}</button>}
      />
    );
  }

  const opportunities = opportunitiesForClient(client.id);
  const quotations = quotationsForClient(client.id);
  const projects = MOCK_PROJECTS.filter(p => p.client.id === client.id);

  const stageIndex = CLIENT_STATUS_FLOW.indexOf(client.status);
  const nextStatus = stageIndex >= 0 && stageIndex < CLIENT_STATUS_FLOW.length - 1
    ? CLIENT_STATUS_FLOW[stageIndex + 1]
    : undefined;
  const isTerminal = client.status === 'Disqualified';
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: t('sales.tabs.overview') },
    { key: 'interactions', label: t('sales.tabs.interactions'), count: client.interactions.length },
    { key: 'documents', label: t('sales.tabs.documents'), count: client.documents.length },
    { key: 'opportunities', label: t('sales.tabs.opportunities'), count: opportunities.length },
    { key: 'quotations', label: t('sales.tabs.quotations'), count: quotations.length },
    { key: 'projects', label: t('sales.tabs.projects'), count: projects.length },
    { key: 'history', label: t('sales.tabs.history'), count: client.statusHistory.length },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-800">
        <BackIcon size={16} className="me-1.5" /> {t('common.back')}
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shrink-0">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-gray-400">{client.id}</p>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="truncate">{client.name}</span>
                {client.isVip && <Star size={18} className="text-amber-500 fill-amber-400 shrink-0" />}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <StatusBadge status={client.status} />
                <PriorityBadge priority={client.priority} />
                <ChannelChip channel={client.channel} />
                {client.slaStatus && <SlaBadge sla={client.slaStatus} />}
              </div>
            </div>
          </div>

          {/* Lifecycle actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setShowLog(true)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <MessageSquarePlus size={16} className="me-2" /> {t('sales.actions.logInteraction')}
            </button>

            {nextStatus && !isTerminal && (
              <button
                onClick={() => setStatusTarget(nextStatus)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <ChevronRight size={16} className="me-1 rtl:rotate-180" />
                {t('sales.actions.moveTo')} {t(`sales.status.${nextStatus}`)}
              </button>
            )}

            {(client.status === 'Qualified' || client.status === 'Client') && (
              <button
                onClick={() => setShowOpportunity(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                <FileText size={16} className="me-2" /> {t('sales.actions.requestOffer')}
              </button>
            )}

            {client.status === 'Dormant' && (
              <button
                onClick={() => changeClientStatus(client.id, 'Client', 'Reactivated')}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Sparkles size={16} className="me-2" /> {t('sales.actions.reactivate')}
              </button>
            )}

            {!isTerminal && (
              <button
                onClick={() => setStatusTarget('Disqualified')}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Ban size={16} className="me-2" /> {t('sales.actions.disqualify')}
              </button>
            )}
          </div>
        </div>

        {/* Lifecycle rail */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          {isTerminal ? (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <Ban size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t('sales.status.Disqualified')}</p>
                <p className="text-xs mt-0.5">{client.disqualifyReason || '—'} · {t('sales.detail.recordKept')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CLIENT_STATUS_FLOW.map((stage, i) => {
                const done = stageIndex >= i;
                const current = client.status === stage;
                return (
                  <React.Fragment key={stage}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                      current ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : done ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${current ? 'bg-blue-500' : done ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {t(`sales.status.${stage}`)}
                    </div>
                    {i < CLIENT_STATUS_FLOW.length - 1 && <div className="h-px w-4 bg-gray-200 shrink-0" />}
                  </React.Fragment>
                );
              })}
              {client.status === 'Dormant' && (
                <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 border border-amber-300 text-amber-800 whitespace-nowrap">
                  {t('sales.status.Dormant')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left rail */}
        <div className="space-y-4">
          <Card title={t('sales.detail.contact')}>
            <Row icon={<Phone size={14} />} value={client.phone || '—'} />
            <Row icon={<Mail size={14} />} value={client.email || '—'} />
            <Row icon={<MapPin size={14} />} value={[client.district, client.city, client.region].filter(Boolean).join(', ') || '—'} />
          </Card>

          <Card title={t('sales.detail.ownership')}>
            <div className="flex items-center gap-2 py-1">
              <img src={client.owner.avatar} className="w-8 h-8 rounded-full" alt="" />
              <div>
                <p className="text-sm font-medium text-gray-900">{client.owner.name}</p>
                <p className="text-xs text-gray-500">{client.owner.role}</p>
              </div>
            </div>
            <Row label={t('sales.detail.created')} value={client.createdAt} />
            {client.convertedAt && <Row label={t('sales.detail.converted')} value={client.convertedAt} />}
            <Row
              label={t('sales.detail.lastInteraction')}
              value={client.lastInteractionAt ? `${client.lastInteractionAt} (${daysSince(client.lastInteractionAt)} ${t('sales.misc.daysAgo')})` : '—'}
            />
          </Card>

          <Card title={t('sales.detail.commercial')}>
            <Row label={t('sales.columns.lifetimeValue')} value={formatMoney(client.lifetimeValue)} />
            <Row label={t('sales.columns.budget')} value={formatMoney(client.estimatedBudget)} />
            <Row label={t('sales.fields.clientType')} value={t(`sales.clientType.${client.type}`)} />
            {client.commercialRegistration && <Row label={t('sales.fields.cr')} value={client.commercialRegistration} />}
            {client.taxId && <Row label={t('sales.fields.taxId')} value={client.taxId} />}
          </Card>
        </div>

        {/* Tabs */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-4 flex gap-1 overflow-x-auto">
            {tabs.map(tb => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === tb.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tb.label}
                {tb.count !== undefined && tb.count > 0 && (
                  <span className="ms-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{tb.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'overview' && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('sales.fields.interestedServices')}</p>
                  <div className="flex flex-wrap gap-2">
                    {(client.interestedServices || []).length === 0
                      ? <span className="text-sm text-gray-400">—</span>
                      : client.interestedServices!.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700 border border-gray-200">
                          {t(`enums.services.${s}`)}
                        </span>
                      ))}
                  </div>
                </div>

                {client.channel === 'Government Tender' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-3">
                    <Row label={t('sales.fields.tenderPlatform')} value={client.tenderPlatform || '—'} />
                    <Row label={t('sales.fields.tenderNumber')} value={client.tenderNumber || '—'} />
                    <Row label={t('sales.fields.tenderDeadline')} value={client.tenderDeadline || '—'} />
                  </div>
                )}
                {client.channel === 'Referral' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                    <Row label={t('sales.fields.referredBy')} value={client.referredBy || '—'} />
                    <Row label={t('sales.fields.referrerPhone')} value={client.referrerPhone || '—'} />
                  </div>
                )}
                {client.channel === 'Social Media' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                    <Row label={t('sales.fields.socialPlatform')} value={client.socialPlatform || '—'} />
                    <Row label={t('sales.fields.socialProfile')} value={client.socialProfile || '—'} />
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('sales.fields.notes')}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes || '—'}</p>
                </div>
              </div>
            )}

            {tab === 'interactions' && (
              client.interactions.length === 0 ? (
                <EmptyState
                  icon={<MessageSquarePlus size={22} />}
                  title={t('sales.empty.interactions')}
                  description={t('sales.empty.interactionsDesc')}
                  action={<button onClick={() => setShowLog(true)} className="text-sm text-blue-600 font-medium">{t('sales.actions.logInteraction')}</button>}
                />
              ) : (
                <ol className="space-y-4">
                  {client.interactions.map(entry => (
                    <li key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <InteractionIcon type={entry.type} size={15} />
                        </div>
                        <div className="flex-1 w-px bg-gray-200 mt-1" />
                      </div>
                      <div className="pb-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">{entry.subject}</p>
                          <span className="text-xs text-gray-400">
                            {t(`sales.interaction.${entry.type}`)} · {t(`sales.direction.${entry.direction}`)}
                          </span>
                        </div>
                        {entry.summary && <p className="text-sm text-gray-600 mt-1">{entry.summary}</p>}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-400">
                          <span>{new Date(entry.occurredAt).toLocaleString()}</span>
                          <span>{entry.user.name}</span>
                          {entry.outcome && <span className="text-gray-600">{t('sales.fields.outcome')}: {entry.outcome}</span>}
                          {entry.followUpDate && <span className="text-amber-600">{t('sales.fields.followUp')}: {entry.followUpDate}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )
            )}

            {tab === 'documents' && (
              client.documents.length === 0
                ? <EmptyState icon={<Paperclip size={22} />} title={t('sales.empty.documents')} />
                : (
                  <ul className="divide-y divide-gray-100">
                    {client.documents.map(doc => (
                      <li key={doc.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.category} · {doc.size || '—'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{doc.uploadDate}</span>
                      </li>
                    ))}
                  </ul>
                )
            )}

            {tab === 'opportunities' && (
              opportunities.length === 0
                ? <EmptyState
                    icon={<Briefcase size={22} />}
                    title={t('sales.empty.opportunities')}
                    description={t('sales.empty.opportunitiesDesc')}
                    action={(client.status === 'Qualified' || client.status === 'Client') &&
                      <button onClick={() => setShowOpportunity(true)} className="text-sm text-blue-600 font-medium">{t('sales.actions.requestOffer')}</button>}
                  />
                : (
                  <ul className="divide-y divide-gray-100">
                    {opportunities.map(opp => (
                      <li
                        key={opp.id}
                        onClick={() => navigate(`/opportunities/${opp.id}`)}
                        className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{opp.title}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">
                            {opp.id}{opp.rfqId && ` → ${opp.rfqId}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm text-gray-700">{formatMoney(opp.estimatedValue)}</span>
                          <OppStatusBadge status={opp.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )
            )}

            {tab === 'quotations' && (
              quotations.length === 0
                ? <EmptyState icon={<FileText size={22} />} title={t('sales.empty.quotations')} description={t('sales.empty.quotationsDesc')} />
                : (
                  <ul className="divide-y divide-gray-100">
                    {quotations.map(quote => (
                      <li
                        key={quote.id}
                        onClick={() => navigate(`/quotations/${quote.id}`)}
                        className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{quote.title}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">
                            {quote.id} · v{quote.version}{quote.poId && ` → ${quote.poId}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm text-gray-700">{formatMoney(quoteTotals(quote).total)}</span>
                          <QuoteStatusBadge status={quote.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )
            )}

            {tab === 'projects' && (
              projects.length === 0
                ? <EmptyState icon={<FolderKanban size={22} />} title={t('sales.empty.projects')} />
                : (
                  <ul className="divide-y divide-gray-100">
                    {projects.map(p => (
                      <li
                        key={p.id}
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">{p.id}</p>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{p.progress}%</span>
                      </li>
                    ))}
                  </ul>
                )
            )}

            {tab === 'history' && (
              <ol className="space-y-4">
                {[...client.statusHistory].reverse().map(change => (
                  <li key={change.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                      <History size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900">
                        {change.from ? `${t(`sales.status.${change.from}`)} → ` : ''}
                        <span className="font-medium">{t(`sales.status.${change.to}`)}</span>
                      </p>
                      {change.reason && <p className="text-sm text-gray-600 mt-0.5">{change.reason}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{change.date} · {change.user.name}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {showLog && <LogInteractionModal client={client} onClose={() => setShowLog(false)} />}
      {statusTarget && <StatusChangeModal client={client} target={statusTarget} onClose={() => setStatusTarget(null)} />}
      {showOpportunity && (
        <NewOpportunityModal
          client={client}
          onClose={() => setShowOpportunity(false)}
          onCreated={oppId => navigate(`/opportunities/${oppId}`)}
        />
      )}
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{title}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

const Row: React.FC<{ label?: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    {label && <span className="text-gray-500 text-xs">{label}</span>}
    <span className="text-gray-900 flex items-center gap-2 min-w-0 truncate">
      {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
      <span className="truncate">{value}</span>
    </span>
  </div>
);
