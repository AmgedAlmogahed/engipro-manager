import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Inbox, CheckCircle2, XCircle, Calculator, Crown,
  Stamp, History, FileText, Ban, Users
} from 'lucide-react';
import { Department, RfqRejectType, User } from '../../types';
import { MOCK_USERS, RFQ_REJECT_REASONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales, departmentHead } from '../../contexts/SalesContext';
import { installmentsTotal, quoteTotals } from '../../utils/quote';
import {
  RfqStatusBadge, PriorityBadge, AssignmentStatusBadge, ApprovalStatusBadge, Badge,
  EmptyState, Modal, Field, inputClass, formatMoney
} from './shared';
import { OfferBuilder } from './OfferBuilder';

const STEPS = ['Received', 'Accepted', 'Pricing', 'Offer Ready', 'Approved', 'Quoted'] as const;

/** B3 workspace: accept → assign → price → approve → hand the quotation to sales. */
export const RfqDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const {
    getRfq, getQuotation, acceptRfq, rejectRfq, updateAssignment, addAssignment,
    startPricing, markOfferReady, sendForApproval, decideApproval,
  } = useSales();

  const [showReject, setShowReject] = useState(false);
  const [showAddPricer, setShowAddPricer] = useState(false);
  const [decision, setDecision] = useState<{ approvalId: string; approved: boolean } | null>(null);

  const rfq = getRfq(id || '');

  if (!rfq) {
    return (
      <EmptyState
        icon={<Inbox size={22} />}
        title={t('sales.detail.notFound')}
        action={<button onClick={() => navigate('/rfqs')} className="text-sm text-blue-600 font-medium">{t('sales.rfqs.title')}</button>}
      />
    );
  }

  const quote = getQuotation(rfq.quotationId || '');
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const stepIndex = STEPS.indexOf(rfq.status as typeof STEPS[number]);
  const rejected = rfq.status === 'Rejected';
  const editable = rfq.status === 'Pricing';

  const scheduleValid = quote ? Math.abs(installmentsTotal(quote) - 100) < 0.01 : false;
  const hasItems = quote ? quote.sections.some(s => s.items.length > 0) : false;
  const canBeReady = scheduleValid && hasItems;

  const pendingApproval = rfq.approvals
    .filter(a => a.status === 'Pending')
    .sort((a, b) => a.tier - b.tier)[0];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-800">
        <BackIcon size={16} className="me-1.5" /> {t('common.back')}
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-400">{rfq.id}</p>
            <h1 className="text-2xl font-bold text-gray-900">{rfq.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
              <button onClick={() => navigate(`/clients/${rfq.clientId}`)} className="text-blue-600 hover:underline">
                {rfq.clientName}
              </button>
              <button onClick={() => navigate(`/opportunities/${rfq.opportunityId}`)} className="text-gray-500 hover:underline font-mono text-xs">
                {rfq.opportunityId}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <RfqStatusBadge status={rfq.status} />
              <PriorityBadge priority={rfq.priority} />
              <span className="text-xs text-gray-500">{t('sales.rfq.receivedAt')} {rfq.receivedAt}</span>
            </div>
          </div>

          {quote && (
            <div className="text-end shrink-0">
              <p className="text-xs text-gray-500">{t('sales.offer.grandTotal')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(quoteTotals(quote).total)}</p>
              <p className="text-xs font-mono text-gray-400 mt-1">{quote.id} · v{quote.version}</p>
            </div>
          )}
        </div>

        {!rejected && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
            {STEPS.map((step, i) => {
              const inApproval = rfq.status === 'In Approval' && i === 4;
              const done = stepIndex >= i;
              const current = rfq.status === step;
              return (
                <React.Fragment key={step}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                    inApproval ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : current ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : done ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      inApproval ? 'bg-orange-500' : current ? 'bg-blue-500' : done ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    {inApproval ? t('sales.rfqStatus.In Approval') : t(`sales.rfqStatus.${step}`)}
                  </div>
                  {i < STEPS.length - 1 && <div className="h-px w-4 bg-gray-200 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Stage action panel */}
      {rfq.status === 'Received' && (
        <Panel
          tone="amber"
          title={t('sales.rfq.acceptTitle')}
          description={t('sales.rfq.acceptDesc')}
          actions={
            <>
              <button
                onClick={() => acceptRfq(rfq.id)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <CheckCircle2 size={16} className="me-2" /> {t('sales.actions.acceptRfq')}
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
              >
                <XCircle size={16} className="me-2" /> {t('sales.actions.rejectRfq')}
              </button>
            </>
          }
        />
      )}

      {rejected && (
        <Panel tone="red" title={t('sales.rfqStatus.Rejected')} description={`${rfq.rejectType} — ${rfq.rejectReason}`}>
          <p className="text-xs mt-1">{t('sales.rfq.rejectedBack')}</p>
        </Panel>
      )}

      {rfq.status === 'Accepted' && (
        <Panel
          tone="blue"
          title={t('sales.rfq.startPricingTitle')}
          description={t('sales.rfq.startPricingDesc')}
          actions={
            <button
              onClick={() => startPricing(rfq.id)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Calculator size={16} className="me-2" /> {t('sales.actions.startPricing')}
            </button>
          }
        />
      )}

      {rfq.status === 'Pricing' && (
        <Panel
          tone="amber"
          title={t('sales.rfq.pricingTitle')}
          description={canBeReady ? t('sales.rfq.pricingReady') : t('sales.rfq.pricingBlocked')}
          actions={
            <button
              onClick={() => markOfferReady(rfq.id)}
              disabled={!canBeReady}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={16} className="me-2" /> {t('sales.actions.offerReady')}
            </button>
          }
        />
      )}

      {rfq.status === 'Offer Ready' && (
        <Panel
          tone="violet"
          title={t('sales.rfq.approvalTitle')}
          description={t('sales.rfq.approvalDesc')}
          actions={
            <button
              onClick={() => sendForApproval(rfq.id)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Stamp size={16} className="me-2" /> {t('sales.actions.sendForApproval')}
            </button>
          }
        />
      )}

      {(rfq.status === 'Approved' || rfq.status === 'Quoted') && quote && (
        <Panel
          tone="green"
          title={rfq.status === 'Approved' ? t('sales.rfq.approvedTitle') : t('sales.rfq.quotedTitle')}
          description={rfq.status === 'Approved' ? t('sales.rfq.approvedDesc') : t('sales.rfq.quotedDesc')}
          actions={
            <button
              onClick={() => navigate(`/quotations/${quote.id}`)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              <FileText size={16} className="me-2" /> {t('sales.actions.openQuotation')}
            </button>
          }
        >
          <p className="mt-2 font-mono text-lg font-bold text-green-800">{quote.id}</p>
        </Panel>
      )}

      {/* Approval chain */}
      {rfq.approvals.length > 0 && (
        <Section title={t('sales.rfq.approvalChain')}>
          <ul className="divide-y divide-gray-100">
            {rfq.approvals.sort((a, b) => a.tier - b.tier).map(approval => (
              <li key={approval.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={approval.approver.avatar} className="w-8 h-8 rounded-full" alt="" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{approval.approver.name}</p>
                    <p className="text-xs text-gray-500">
                      {t('sales.rfq.tier')} {approval.tier} · {approval.approver.role}
                      {approval.comments && ` · ${approval.comments}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ApprovalStatusBadge status={approval.status} />
                  {approval.id === pendingApproval?.id && (
                    <>
                      <button
                        onClick={() => setDecision({ approvalId: approval.id, approved: true })}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        {t('sales.actions.approve')}
                      </button>
                      <button
                        onClick={() => setDecision({ approvalId: approval.id, approved: false })}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        {t('sales.actions.rejectOffer')}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Assignments */}
      <Section
        title={t('sales.rfq.assignments')}
        right={
          !rejected && (
            <button onClick={() => setShowAddPricer(true)} className="text-sm text-blue-600 font-medium hover:text-blue-800">
              + {t('sales.rfq.addPricer')}
            </button>
          )
        }
      >
        <ul className="divide-y divide-gray-100">
          {rfq.assignments.map(assignment => (
            <li key={assignment.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={assignment.assignee.avatar} className="w-8 h-8 rounded-full" alt="" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    {assignment.assignee.name}
                    {assignment.isLead && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Crown size={11} className="me-1" /> {t('sales.rfq.lead')}
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{t(`enums.departments.${assignment.department}`)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={assignment.assignee.id}
                  onChange={e => {
                    const user = MOCK_USERS.find(u => u.id === e.target.value);
                    if (user) updateAssignment(rfq.id, assignment.id, { assignee: user });
                  }}
                  className={`${inputClass} w-auto text-xs py-1`}
                >
                  {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select
                  value={assignment.status}
                  onChange={e => updateAssignment(rfq.id, assignment.id, { status: e.target.value as typeof assignment.status })}
                  className={`${inputClass} w-auto text-xs py-1`}
                >
                  {(['Not Started', 'In Progress', 'Submitted'] as const).map(s => (
                    <option key={s} value={s}>{t(`sales.assignmentStatus.${s}`)}</option>
                  ))}
                </select>
                {!assignment.isLead && (
                  <button
                    onClick={() => updateAssignment(rfq.id, assignment.id, { isLead: true })}
                    className="text-xs text-blue-600 font-medium hover:text-blue-800 whitespace-nowrap"
                  >
                    {t('sales.rfq.makeLead')}
                  </button>
                )}
                <AssignmentStatusBadge status={assignment.status} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Request summary */}
      <Section title={t('sales.opp.summary')}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {rfq.services.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700 border border-gray-200">
                {t(`enums.services.${s}`)}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{rfq.scope}</p>
        </div>
      </Section>

      {/* Offer document */}
      {quote && <OfferBuilder quote={quote} editable={editable} />}

      {/* Timeline */}
      <Section title={t('sales.tabs.history')}>
        <ol className="space-y-4">
          {[...rfq.history].reverse().map(event => (
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

      {showReject && (
        <RejectModal
          onClose={() => setShowReject(false)}
          onConfirm={(type, reason) => { rejectRfq(rfq.id, type, reason); setShowReject(false); }}
        />
      )}

      {showAddPricer && (
        <AddPricerModal
          taken={rfq.assignments.map(a => a.department)}
          onClose={() => setShowAddPricer(false)}
          onConfirm={(department, assignee) => {
            addAssignment(rfq.id, { department, assignee, isLead: false, status: 'Not Started' });
            setShowAddPricer(false);
          }}
        />
      )}

      {decision && (
        <DecisionModal
          approved={decision.approved}
          onClose={() => setDecision(null)}
          onConfirm={comments => {
            decideApproval(rfq.id, decision.approvalId, decision.approved, comments);
            setDecision(null);
          }}
        />
      )}
    </div>
  );
};

const TONES: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  violet: 'bg-violet-50 border-violet-200 text-violet-900',
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

const Section: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
      {right}
    </div>
    {children}
  </div>
);

const RejectModal: React.FC<{ onClose: () => void; onConfirm: (type: RfqRejectType, reason: string) => void }> = ({ onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [type, setType] = useState<RfqRejectType>(RFQ_REJECT_REASONS[0]);
  const [reason, setReason] = useState('');

  return (
    <Modal
      title={t('sales.actions.rejectRfq')}
      subtitle={t('sales.rfq.rejectHint')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(type, reason.trim())}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={t('sales.rfq.rejectType')} required>
        <select value={type} onChange={e => setType(e.target.value as RfqRejectType)} className={inputClass}>
          {RFQ_REJECT_REASONS.map(r => <option key={r} value={r}>{t(`sales.rejectType.${r}`)}</option>)}
        </select>
      </Field>
      <Field label={t('sales.statusChange.reason')} required>
        <textarea rows={3} className={inputClass} value={reason} onChange={e => setReason(e.target.value)} />
      </Field>
    </Modal>
  );
};

const AddPricerModal: React.FC<{
  taken: Department[];
  onClose: () => void;
  onConfirm: (department: Department, assignee: User) => void;
}> = ({ taken, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const all: Department[] = ['Architecture', 'Civil', 'Safety', 'Surveying', 'Modern', 'Khitbrah'];
  const available = all.filter(d => !taken.includes(d));
  const [department, setDepartment] = useState<Department>(available[0] || all[0]);
  const [userId, setUserId] = useState(departmentHead(available[0] || all[0])?.id || MOCK_USERS[0].id);

  return (
    <Modal
      title={t('sales.rfq.addPricer')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(department, MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0])}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={t('filters.department')} required>
        <select
          value={department}
          onChange={e => {
            const dept = e.target.value as Department;
            setDepartment(dept);
            setUserId(departmentHead(dept)?.id || MOCK_USERS[0].id);
          }}
          className={inputClass}
        >
          {(available.length ? available : all).map(d => (
            <option key={d} value={d}>{t(`enums.departments.${d}`)}</option>
          ))}
        </select>
      </Field>
      <Field label={t('sales.rfq.pricer')} required>
        <select value={userId} onChange={e => setUserId(e.target.value)} className={inputClass}>
          {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
        </select>
      </Field>
      <p className="flex items-center gap-2 text-xs text-gray-500">
        <Users size={13} /> {t('sales.rfq.addPricerHint')}
      </p>
    </Modal>
  );
};

const DecisionModal: React.FC<{ approved: boolean; onClose: () => void; onConfirm: (comments?: string) => void }> = ({ approved, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [comments, setComments] = useState('');
  return (
    <Modal
      title={approved ? t('sales.actions.approve') : t('sales.actions.rejectOffer')}
      subtitle={approved ? undefined : t('sales.rfq.rejectOfferHint')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(comments.trim() || undefined)}
            disabled={!approved && !comments.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${approved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <Field label={t('sales.rfq.comments')} required={!approved}>
        <textarea rows={3} className={inputClass} value={comments} onChange={e => setComments(e.target.value)} />
      </Field>
      {!approved && (
        <p className="flex items-center gap-2 text-xs text-red-600">
          <Ban size={13} /> {t('sales.rfq.rejectOfferBack')}
        </p>
      )}
    </Modal>
  );
};
