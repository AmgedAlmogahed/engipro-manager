import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, FileText, Send, Handshake, Trophy, XCircle,
  GitBranch, History, FolderKanban, Lock
} from 'lucide-react';
import { QuoteChangeType } from '../../types';
import { LOSS_REASONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { quoteTotals } from '../../utils/quote';
import {
  QuoteStatusBadge, EmptyState, Modal, Field, inputClass, formatMoney, Badge
} from './shared';
import { OfferBuilder } from './OfferBuilder';

const STEPS = ['Ready', 'Sent', 'Negotiation'] as const;
const CHANGE_TYPES: QuoteChangeType[] = ['Price', 'Scope', 'Timeline'];

/** B4: the offer in front of the client. Never deleted — only its status moves. */
export const QuotationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const {
    getQuotation, getRfq, sendQuotation, startNegotiation, createRevision, markWon, markLost,
  } = useSales();

  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [showLost, setShowLost] = useState(false);

  const quote = getQuotation(id || '');

  if (!quote) {
    return (
      <EmptyState
        icon={<FileText size={22} />}
        title={t('sales.detail.notFound')}
        action={<button onClick={() => navigate('/quotations')} className="text-sm text-blue-600 font-medium">{t('sales.quotations.title')}</button>}
      />
    );
  }

  const rfq = getRfq(quote.rfqId);
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const totals = quoteTotals(quote);
  const closed = quote.status === 'Won' || quote.status === 'Lost';
  const stepIndex = STEPS.indexOf(quote.status as typeof STEPS[number]);
  /** Sales cannot send an offer the approval chain has not cleared. */
  const approvalCleared = !rfq || rfq.status === 'Approved' || rfq.status === 'Quoted';

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-800">
        <BackIcon size={16} className="me-1.5" /> {t('common.back')}
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-400">{quote.id} · v{quote.version}</p>
            <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
              <button onClick={() => navigate(`/clients/${quote.clientId}`)} className="text-blue-600 hover:underline">
                {quote.clientName}
              </button>
              <button onClick={() => navigate(`/rfqs/${quote.rfqId}`)} className="text-gray-500 hover:underline font-mono text-xs">
                {quote.rfqId}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <QuoteStatusBadge status={quote.status} />
              <span className="text-xs text-gray-500">{t('sales.quote.owner')}: {quote.owner.name}</span>
            </div>
          </div>

          <div className="text-end shrink-0">
            <p className="text-xs text-gray-500">{t('sales.offer.grandTotal')}</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(totals.total)}</p>
            {quote.validUntil && <p className="text-xs text-gray-400 mt-1">{t('sales.offer.validUntil')}: {quote.validUntil}</p>}
          </div>
        </div>

        {!closed && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
            {STEPS.map((step, i) => {
              const done = stepIndex >= i;
              const current = quote.status === step;
              return (
                <React.Fragment key={step}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                    current ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : done ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${current ? 'bg-blue-500' : done ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {t(`sales.quoteStatus.${step}`)}
                  </div>
                  <div className="h-px w-4 bg-gray-200 shrink-0" />
                </React.Fragment>
              );
            })}
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-400 whitespace-nowrap">
              {t('sales.quoteStatus.Won')} / {t('sales.quoteStatus.Lost')}
            </div>
          </div>
        )}
      </div>

      {/* Stage actions */}
      {quote.status === 'Ready' && (
        <Panel
          tone={approvalCleared ? 'blue' : 'amber'}
          title={approvalCleared ? t('sales.quote.readyTitle') : t('sales.quote.awaitingApproval')}
          description={approvalCleared ? t('sales.quote.readyDesc') : t('sales.quote.awaitingApprovalDesc')}
          actions={
            <button
              onClick={() => sendQuotation(quote.id)}
              disabled={!approvalCleared}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approvalCleared ? <Send size={16} className="me-2" /> : <Lock size={16} className="me-2" />}
              {t('sales.actions.sendToClient')}
            </button>
          }
        />
      )}

      {(quote.status === 'Sent' || quote.status === 'Negotiation') && (
        <Panel
          tone={quote.status === 'Negotiation' ? 'amber' : 'blue'}
          title={quote.status === 'Negotiation' ? t('sales.quote.negotiationTitle') : t('sales.quote.sentTitle')}
          description={quote.status === 'Negotiation' ? quote.negotiationNote : t('sales.quote.sentDesc')}
          actions={
            <>
              <button
                onClick={() => markWon(quote.id)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Trophy size={16} className="me-2" /> {t('sales.actions.markWon')}
              </button>
              {quote.status === 'Sent' && (
                <button
                  onClick={() => setShowNegotiate(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-amber-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50"
                >
                  <Handshake size={16} className="me-2" /> {t('sales.actions.negotiate')}
                </button>
              )}
              {quote.status === 'Negotiation' && (
                <button
                  onClick={() => setShowRevision(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  <GitBranch size={16} className="me-2" /> {t('sales.actions.newVersion')}
                </button>
              )}
              <button
                onClick={() => setShowLost(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
              >
                <XCircle size={16} className="me-2" /> {t('sales.actions.markLost')}
              </button>
            </>
          }
        />
      )}

      {quote.status === 'Won' && (
        <Panel
          tone="green"
          title={t('sales.quote.wonTitle')}
          description={t('sales.quote.wonDesc')}
          actions={
            quote.projectId ? (
              <button
                onClick={() => navigate(`/projects/${quote.projectId}`)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                <FolderKanban size={16} className="me-2" /> {t('sales.actions.openProject')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/projects/new')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                <FolderKanban size={16} className="me-2" /> {t('sales.actions.convertToProject')}
              </button>
            )
          }
        >
          <p className="mt-2 font-mono text-lg font-bold text-green-800">{quote.poId}</p>
          <p className="text-xs text-green-700 mt-1">{t('sales.quote.wonNext')}</p>
        </Panel>
      )}

      {quote.status === 'Lost' && (
        <Panel tone="red" title={t('sales.quote.lostTitle')} description={quote.lostReason}>
          <p className="text-xs mt-1">{t('sales.quote.lostKept')}</p>
        </Panel>
      )}

      {/* Version history */}
      {quote.versionHistory.length > 0 && (
        <Section title={t('sales.quote.versions')}>
          <ul className="divide-y divide-gray-100">
            {[...quote.versionHistory].reverse().map(version => (
              <li key={version.version} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    v{version.version}
                    <Badge className="bg-slate-100 text-slate-600">{t(`sales.changeType.${version.changeType}`)}</Badge>
                  </p>
                  {version.note && <p className="text-sm text-gray-600 mt-0.5">{version.note}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{version.date} · {version.user.name}</p>
                </div>
                <span className="text-sm text-gray-700 whitespace-nowrap">{formatMoney(version.totalAmount)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* The offer document itself */}
      <OfferBuilder quote={quote} editable={quote.status === 'Ready' && !closed} />

      <Section title={t('sales.tabs.history')}>
        <ol className="space-y-4">
          {[...quote.history].reverse().map(event => (
            <li key={event.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                <History size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-900">{event.action}</p>
                {event.note && <p className="text-sm text-gray-600 mt-0.5">{event.note}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{event.date} · {event.user.name}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {showNegotiate && (
        <NoteModal
          title={t('sales.actions.negotiate')}
          label={t('sales.quote.negotiationNote')}
          confirmClass="bg-amber-600 hover:bg-amber-700"
          onClose={() => setShowNegotiate(false)}
          onConfirm={note => { startNegotiation(quote.id, note); setShowNegotiate(false); }}
        />
      )}

      {showRevision && (
        <RevisionModal
          onClose={() => setShowRevision(false)}
          onConfirm={(changeType, note) => { createRevision(quote.id, changeType, note); setShowRevision(false); }}
        />
      )}

      {showLost && (
        <LostModal
          onClose={() => setShowLost(false)}
          onConfirm={reason => { markLost(quote.id, reason); setShowLost(false); }}
        />
      )}
    </div>
  );
};

const TONES: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  red: 'bg-red-50 border-red-200 text-red-900',
};

const Panel: React.FC<{
  tone: keyof typeof TONES;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ tone, title, description, actions, children }) => (
  <div className={`rounded-xl border p-5 ${TONES[tone]}`}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm mt-1 opacity-90">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{title}</p>
    {children}
  </div>
);

const NoteModal: React.FC<{
  title: string;
  label: string;
  confirmClass: string;
  onClose: () => void;
  onConfirm: (note: string) => void;
}> = ({ title, label, confirmClass, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [note, setNote] = useState('');
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(note.trim())}
            disabled={!note.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${confirmClass}`}
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={label} required>
        <textarea rows={3} className={inputClass} value={note} onChange={e => setNote(e.target.value)} />
      </Field>
    </Modal>
  );
};

const RevisionModal: React.FC<{ onClose: () => void; onConfirm: (changeType: QuoteChangeType, note: string) => void }> = ({ onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [changeType, setChangeType] = useState<QuoteChangeType>('Price');
  const [note, setNote] = useState('');
  return (
    <Modal
      title={t('sales.actions.newVersion')}
      subtitle={t('sales.quote.versionHint')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(changeType, note.trim())}
            disabled={!note.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={t('sales.quote.changeType')} required>
        <div className="flex flex-wrap gap-2">
          {CHANGE_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setChangeType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                changeType === type ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {t(`sales.changeType.${type}`)}
            </button>
          ))}
        </div>
      </Field>
      <Field label={t('sales.statusChange.note')} required>
        <textarea rows={3} className={inputClass} value={note} onChange={e => setNote(e.target.value)} />
      </Field>
    </Modal>
  );
};

const LostModal: React.FC<{ onClose: () => void; onConfirm: (reason: string) => void }> = ({ onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [code, setCode] = useState(LOSS_REASONS[0]);
  const [detail, setDetail] = useState('');
  const valid = code !== 'Other' || !!detail.trim();
  return (
    <Modal
      title={t('sales.actions.markLost')}
      subtitle={t('sales.quote.lostHint')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm([code, detail.trim()].filter(Boolean).join(' — '))}
            disabled={!valid}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={t('sales.statusChange.reason')} required>
        <select value={code} onChange={e => setCode(e.target.value)} className={inputClass}>
          {LOSS_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      <Field label={t('sales.statusChange.detail')} required={code === 'Other'}>
        <textarea rows={3} className={inputClass} value={detail} onChange={e => setDetail(e.target.value)} />
      </Field>
    </Modal>
  );
};
