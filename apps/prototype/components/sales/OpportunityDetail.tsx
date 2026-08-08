import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Briefcase, CheckCircle2, XCircle, FileOutput, Paperclip,
  Route, User as UserIcon, History, Ban, Send
} from 'lucide-react';
import { AssignmentRoute, User } from '../../types';
import { MOCK_USERS, QUOTE_REQUEST_CHECKLIST } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales, departmentHead } from '../../contexts/SalesContext';
import { OppStatusBadge, PriorityBadge, EmptyState, formatMoney, inputClass, Modal, Field } from './shared';

const STEPS = ['Submitted', 'Under Review', 'Assigned', 'RFQ Raised'] as const;

/** B2 detail: manager review → completeness gate → assignment → RFQ raised. */
export const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const { getOpportunity, reviewOpportunity, assignOpportunity, raiseRfq, updateOpportunity, cancelOpportunity } = useSales();

  const [showIncomplete, setShowIncomplete] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const opp = getOpportunity(id || '');

  if (!opp) {
    return (
      <EmptyState
        icon={<Briefcase size={22} />}
        title={t('sales.detail.notFound')}
        action={<button onClick={() => navigate('/opportunities')} className="text-sm text-blue-600 font-medium">{t('sales.opportunities.title')}</button>}
      />
    );
  }

  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const stepIndex = STEPS.indexOf(opp.status as typeof STEPS[number]);
  const route: AssignmentRoute = opp.departments.length > 1 ? 'Project Manager' : 'Department Head';
  const suggested = opp.departments.length === 1 ? departmentHead(opp.departments[0]) : undefined;
  const closed = opp.status === 'Cancelled';

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-800">
        <BackIcon size={16} className="me-1.5" /> {t('common.back')}
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-400">{opp.id}</p>
            <h1 className="text-2xl font-bold text-gray-900">{opp.title}</h1>
            <button
              onClick={() => navigate(`/clients/${opp.clientId}`)}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              {opp.clientName} · <span className="font-mono">{opp.clientId}</span>
            </button>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <OppStatusBadge status={opp.status} />
              <PriorityBadge priority={opp.priority} />
              {opp.city && <span className="text-xs text-gray-500">{opp.city}</span>}
            </div>
          </div>

          <div className="text-end shrink-0">
            <p className="text-xs text-gray-500">{t('sales.columns.value')}</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(opp.estimatedValue)}</p>
            {opp.expectedDecisionDate && (
              <p className="text-xs text-gray-400 mt-1">{t('sales.fields.expectedDecision')}: {opp.expectedDecisionDate}</p>
            )}
          </div>
        </div>

        {/* Step rail */}
        {!closed && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
            {STEPS.map((step, i) => {
              const done = stepIndex >= i;
              const current = opp.status === step;
              const blocked = opp.status === 'Incomplete' && i === 1;
              return (
                <React.Fragment key={step}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                    blocked ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : current ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : done ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      blocked ? 'bg-orange-500' : current ? 'bg-blue-500' : done ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    {blocked ? t('sales.oppStatus.Incomplete') : t(`sales.oppStatus.${step}`)}
                  </div>
                  {i < STEPS.length - 1 && <div className="h-px w-4 bg-gray-200 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Action panel — what this record is waiting for right now */}
      {opp.status === 'Submitted' && (
        <Panel
          tone="amber"
          title={t('sales.opp.reviewTitle')}
          description={t('sales.opp.reviewDesc')}
          actions={
            <>
              <button
                onClick={() => reviewOpportunity(opp.id, true, t('sales.opp.reviewComplete'))}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <CheckCircle2 size={16} className="me-2" /> {t('sales.actions.markComplete')}
              </button>
              <button
                onClick={() => setShowIncomplete(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-white border border-orange-300 rounded-lg hover:bg-orange-50"
              >
                <XCircle size={16} className="me-2" /> {t('sales.actions.returnIncomplete')}
              </button>
            </>
          }
        />
      )}

      {opp.status === 'Incomplete' && (
        <Panel
          tone="orange"
          title={t('sales.opp.incompleteTitle')}
          description={opp.reviewNotes}
          actions={
            <button
              onClick={() => updateOpportunity(opp.id, { status: 'Submitted', missingItems: [] }, 'Resubmitted for review')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Send size={16} className="me-2" /> {t('sales.actions.resubmit')}
            </button>
          }
        >
          {!!opp.missingItems?.length && (
            <ul className="mt-3 space-y-1">
              {opp.missingItems.map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-orange-900">
                  <XCircle size={14} className="shrink-0" /> {item}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {opp.status === 'Under Review' && (
        <Panel
          tone="blue"
          title={t('sales.opp.assignTitle')}
          description={route === 'Project Manager' ? t('sales.newOpportunity.routePm') : t('sales.newOpportunity.routeHead')}
          actions={
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Route size={16} className="me-2" /> {t('sales.actions.assign')}
            </button>
          }
        >
          <p className="mt-2 text-sm text-blue-900">
            {opp.departments.map(d => t(`enums.departments.${d}`)).join(' · ')}
            {suggested && ` → ${suggested.name}`}
          </p>
        </Panel>
      )}

      {opp.status === 'Assigned' && (
        <Panel
          tone="violet"
          title={t('sales.opp.assignedTitle')}
          description={`${opp.assignee?.name || '—'} · ${opp.assignmentRoute === 'Project Manager' ? t('sales.opp.routePmShort') : t('sales.opp.routeHeadShort')}`}
          actions={
            <button
              onClick={() => raiseRfq(opp.id)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              <FileOutput size={16} className="me-2" /> {t('sales.actions.raiseRfq')}
            </button>
          }
        />
      )}

      {opp.status === 'RFQ Raised' && (
        <Panel
          tone="green"
          title={t('sales.opp.rfqTitle')}
          description={t('sales.opp.rfqDesc')}
        >
          <p className="mt-2 font-mono text-lg font-bold text-green-800">{opp.rfqId}</p>
          <p className="text-xs text-green-700 mt-1">{t('sales.opp.rfqNext')}</p>
        </Panel>
      )}

      {closed && (
        <Panel tone="gray" title={t('sales.oppStatus.Cancelled')} description={opp.cancelReason} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Request summary */}
          <Section title={t('sales.opp.summary')}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('sales.fields.services')}</p>
                <div className="flex flex-wrap gap-2">
                  {opp.services.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700 border border-gray-200">
                      {t(`enums.services.${s}`)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('sales.fields.scope')}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{opp.scope}</p>
              </div>
            </div>
          </Section>

          {/* Documents */}
          <Section title={t('sales.opp.documents')}>
            <ul className="divide-y divide-gray-100">
              {QUOTE_REQUEST_CHECKLIST.map(category => {
                const doc = opp.documents.find(d => d.category === category);
                return (
                  <li key={category} className="py-2.5 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                      <Paperclip size={14} className={doc ? 'text-green-600' : 'text-gray-300'} />
                      <span className="truncate">{category}</span>
                    </span>
                    {doc
                      ? <span className="text-xs text-green-700 font-medium whitespace-nowrap">{doc.name}</span>
                      : <span className="text-xs text-gray-400 whitespace-nowrap">{t('sales.opp.missing')}</span>}
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Timeline */}
          <Section title={t('sales.tabs.history')}>
            <ol className="space-y-4">
              {[...opp.history].reverse().map(event => (
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
        </div>

        {/* Side rail */}
        <div className="space-y-4">
          <Section title={t('sales.detail.ownership')}>
            <div className="flex items-center gap-2 py-1">
              <img src={opp.owner.avatar} className="w-8 h-8 rounded-full" alt="" />
              <div>
                <p className="text-sm font-medium text-gray-900">{opp.owner.name}</p>
                <p className="text-xs text-gray-500">{t('sales.opp.owner')}</p>
              </div>
            </div>
            {opp.assignee && (
              <div className="flex items-center gap-2 py-1 mt-2 pt-2 border-t border-gray-100">
                <img src={opp.assignee.avatar} className="w-8 h-8 rounded-full" alt="" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{opp.assignee.name}</p>
                  <p className="text-xs text-gray-500">
                    {opp.assignmentRoute === 'Project Manager' ? t('sales.opp.routePmShort') : t('sales.opp.routeHeadShort')}
                  </p>
                </div>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-sm">
              <RailRow label={t('sales.detail.created')} value={opp.createdAt} />
              {opp.reviewedAt && <RailRow label={t('sales.opp.reviewedBy')} value={`${opp.reviewedBy?.name} · ${opp.reviewedAt}`} />}
              {opp.rfqRaisedAt && <RailRow label={t('sales.opp.rfqRaisedAt')} value={opp.rfqRaisedAt} />}
            </div>
          </Section>

          {!closed && opp.status !== 'RFQ Raised' && (
            <button
              onClick={() => setShowCancel(true)}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
            >
              <Ban size={16} className="me-2" /> {t('sales.actions.cancelRequest')}
            </button>
          )}
        </div>
      </div>

      {showIncomplete && (
        <IncompleteModal
          onClose={() => setShowIncomplete(false)}
          onConfirm={(items, note) => { reviewOpportunity(opp.id, false, note, items); setShowIncomplete(false); }}
        />
      )}

      {showAssign && (
        <AssignModal
          route={route}
          suggested={suggested}
          onClose={() => setShowAssign(false)}
          onConfirm={user => { assignOpportunity(opp.id, route, user); setShowAssign(false); }}
        />
      )}

      {showCancel && (
        <ReasonModal
          title={t('sales.actions.cancelRequest')}
          onClose={() => setShowCancel(false)}
          onConfirm={reason => { cancelOpportunity(opp.id, reason); setShowCancel(false); }}
        />
      )}
    </div>
  );
};

const TONES: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  orange: 'bg-orange-50 border-orange-200 text-orange-900',
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  violet: 'bg-violet-50 border-violet-200 text-violet-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
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

const RailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-gray-900 truncate">{value}</span>
  </div>
);

const IncompleteModal: React.FC<{ onClose: () => void; onConfirm: (items: string[], note: string) => void }> = ({ onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const toggle = (item: string) => setItems(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]));

  return (
    <Modal
      title={t('sales.actions.returnIncomplete')}
      subtitle={t('sales.opp.incompleteHint')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(items, note)}
            disabled={items.length === 0 && !note.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={t('sales.opp.missingItems')}>
        <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {QUOTE_REQUEST_CHECKLIST.map(item => (
            <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={items.includes(item)}
                onChange={() => toggle(item)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {item}
            </label>
          ))}
        </div>
      </Field>
      <Field label={t('sales.statusChange.note')}>
        <textarea rows={3} className={inputClass} value={note} onChange={e => setNote(e.target.value)} />
      </Field>
    </Modal>
  );
};

const AssignModal: React.FC<{
  route: AssignmentRoute;
  suggested?: User;
  onClose: () => void;
  onConfirm: (user: User) => void;
}> = ({ route, suggested, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [userId, setUserId] = useState(suggested?.id || MOCK_USERS[0].id);

  return (
    <Modal
      title={t('sales.actions.assign')}
      subtitle={route === 'Project Manager' ? t('sales.newOpportunity.routePm') : t('sales.newOpportunity.routeHead')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0])}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={route === 'Project Manager' ? t('sales.opp.pickPm') : t('sales.opp.pickHead')} required>
        <select value={userId} onChange={e => setUserId(e.target.value)} className={inputClass}>
          {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
        </select>
      </Field>
      {suggested && (
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <UserIcon size={13} /> {t('sales.opp.suggested')}: {suggested.name}
        </p>
      )}
    </Modal>
  );
};

const ReasonModal: React.FC<{ title: string; onClose: () => void; onConfirm: (reason: string) => void }> = ({ title, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
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
            onClick={() => onConfirm(reason.trim())}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={t('sales.statusChange.reason')} required>
        <textarea rows={3} className={inputClass} value={reason} onChange={e => setReason(e.target.value)} />
      </Field>
    </Modal>
  );
};
