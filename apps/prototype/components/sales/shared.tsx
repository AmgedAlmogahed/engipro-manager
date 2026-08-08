import React from 'react';
import {
  DoorOpen, UserPlus, Globe, Share2, MapPin, Landmark, Bot,
  Phone, Users, Mail, MessageCircle, Building, StickyNote, Navigation
} from 'lucide-react';
import {
  ClientStatus, ClientChannel, Priority, SLAStatus, OpportunityStatus, InteractionType,
  RfqStatus, QuotationStatus, AssignmentStatus, ApprovalStatus
} from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

/** Shared chrome for modules B1 and B2. Colours follow the flowchart legend. */

export const CLIENT_STATUS_STYLE: Record<ClientStatus, string> = {
  'New Lead': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-indigo-100 text-indigo-800',
  'Qualified': 'bg-violet-100 text-violet-800',
  'Client': 'bg-green-100 text-green-800',
  'Dormant': 'bg-amber-100 text-amber-800',
  'Disqualified': 'bg-red-100 text-red-800',
};

export const OPP_STATUS_STYLE: Record<OpportunityStatus, string> = {
  'Draft': 'bg-slate-100 text-slate-700',
  'Submitted': 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-amber-100 text-amber-800',
  'Incomplete': 'bg-orange-100 text-orange-800',
  'Assigned': 'bg-violet-100 text-violet-800',
  'RFQ Raised': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-slate-100 text-slate-500',
};

export const RFQ_STATUS_STYLE: Record<RfqStatus, string> = {
  'Received': 'bg-blue-100 text-blue-800',
  'Accepted': 'bg-indigo-100 text-indigo-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Pricing': 'bg-amber-100 text-amber-800',
  'Offer Ready': 'bg-violet-100 text-violet-800',
  'In Approval': 'bg-orange-100 text-orange-800',
  'Approved': 'bg-emerald-100 text-emerald-800',
  'Quoted': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-slate-100 text-slate-500',
};

export const QUOTE_STATUS_STYLE: Record<QuotationStatus, string> = {
  'Ready': 'bg-blue-100 text-blue-800',
  'Sent': 'bg-indigo-100 text-indigo-800',
  'Negotiation': 'bg-amber-100 text-amber-800',
  'Won': 'bg-green-100 text-green-800',
  'Lost': 'bg-red-100 text-red-800',
};

export const ASSIGNMENT_STATUS_STYLE: Record<AssignmentStatus, string> = {
  'Not Started': 'bg-slate-100 text-slate-600',
  'In Progress': 'bg-amber-100 text-amber-800',
  'Submitted': 'bg-green-100 text-green-800',
};

export const APPROVAL_STATUS_STYLE: Record<ApprovalStatus, string> = {
  'Pending': 'bg-amber-100 text-amber-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
};

export const PRIORITY_STYLE: Record<Priority, string> = {
  'Low': 'bg-slate-100 text-slate-600',
  'Medium': 'bg-blue-50 text-blue-700',
  'High': 'bg-amber-100 text-amber-800',
  'Urgent': 'bg-red-100 text-red-800',
};

export const SLA_STYLE: Record<SLAStatus, string> = {
  'On Time': 'bg-green-100 text-green-800',
  'Due Soon': 'bg-amber-100 text-amber-800',
  'Overdue': 'bg-red-100 text-red-800',
};

const CHANNEL_ICON: Record<ClientChannel, React.ElementType> = {
  'Walk-in': DoorOpen,
  'Referral': UserPlus,
  'Website': Globe,
  'Social Media': Share2,
  'Google Maps': MapPin,
  'Government Tender': Landmark,
  'AI Chatbot': Bot,
};

const INTERACTION_ICON: Record<InteractionType, React.ElementType> = {
  'Call': Phone,
  'Meeting': Users,
  'Email': Mail,
  'WhatsApp': MessageCircle,
  'Site Visit': Navigation,
  'Office Visit': Building,
  'Note': StickyNote,
};

export const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${className}`}>
    {children}
  </span>
);

export const StatusBadge: React.FC<{ status: ClientStatus }> = ({ status }) => {
  const { t } = useLanguage();
  return <Badge className={CLIENT_STATUS_STYLE[status]}>{t(`sales.status.${status}`)}</Badge>;
};

export const OppStatusBadge: React.FC<{ status: OpportunityStatus }> = ({ status }) => {
  const { t } = useLanguage();
  return <Badge className={OPP_STATUS_STYLE[status]}>{t(`sales.oppStatus.${status}`)}</Badge>;
};

export const RfqStatusBadge: React.FC<{ status: RfqStatus }> = ({ status }) => {
  const { t } = useLanguage();
  return <Badge className={RFQ_STATUS_STYLE[status]}>{t(`sales.rfqStatus.${status}`)}</Badge>;
};

export const QuoteStatusBadge: React.FC<{ status: QuotationStatus }> = ({ status }) => {
  const { t } = useLanguage();
  return <Badge className={QUOTE_STATUS_STYLE[status]}>{t(`sales.quoteStatus.${status}`)}</Badge>;
};

export const AssignmentStatusBadge: React.FC<{ status: AssignmentStatus }> = ({ status }) => {
  const { t } = useLanguage();
  return <Badge className={ASSIGNMENT_STATUS_STYLE[status]}>{t(`sales.assignmentStatus.${status}`)}</Badge>;
};

export const ApprovalStatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const { t } = useLanguage();
  return <Badge className={APPROVAL_STATUS_STYLE[status]}>{t(`sales.approvalStatus.${status}`)}</Badge>;
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const { t } = useLanguage();
  return <Badge className={PRIORITY_STYLE[priority]}>{t(`sales.priority.${priority}`)}</Badge>;
};

export const SlaBadge: React.FC<{ sla?: SLAStatus }> = ({ sla }) => {
  const { t } = useLanguage();
  if (!sla) return <span className="text-xs text-gray-400">—</span>;
  return <Badge className={SLA_STYLE[sla]}>{t(`sales.sla.${sla}`)}</Badge>;
};

export const ChannelChip: React.FC<{ channel: ClientChannel; withLabel?: boolean }> = ({ channel, withLabel = true }) => {
  const { t } = useLanguage();
  const Icon = CHANNEL_ICON[channel];
  return (
    <span className="inline-flex items-center text-xs text-gray-600">
      <Icon size={14} className="me-1.5 text-gray-400 shrink-0" />
      {withLabel && t(`sales.channel.${channel}`)}
    </span>
  );
};

export const InteractionIcon: React.FC<{ type: InteractionType; size?: number; className?: string }> = ({ type, size = 16, className = '' }) => {
  const Icon = INTERACTION_ICON[type];
  return <Icon size={size} className={className} />;
};

export const formatMoney = (value?: number) =>
  value === undefined || value === null ? '—' : `SAR ${value.toLocaleString('en-US')}`;

export const daysSince = (date?: string) => {
  if (!date) return undefined;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
};

export const KpiCard: React.FC<{
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'violet';
}> = ({ label, value, hint, icon, tone = 'blue' }) => {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {hint && <p className="text-xs text-gray-400 mt-1 truncate">{hint}</p>}
      </div>
      <div className={`p-2 rounded-lg shrink-0 ${tones[tone]}`}>{icon}</div>
    </div>
  );
};

export const Modal: React.FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}> = ({ title, subtitle, onClose, children, footer, wide }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
    <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} my-8`}>
      <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-1">×</button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">{footer}</div>}
    </div>
  </div>
);

export const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ms-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

export const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="text-center py-12 px-6">
    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">{icon}</div>
    <p className="text-sm font-medium text-gray-900">{title}</p>
    {description && <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
