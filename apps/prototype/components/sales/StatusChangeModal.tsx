import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Client, ClientStatus } from '../../types';
import { DISQUALIFY_REASONS, QUOTE_REQUEST_CHECKLIST } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { Modal, Field, inputClass, StatusBadge } from './shared';

/**
 * Status moves are the whole of B1. Disqualification always carries a reason and the
 * record stays in the table — it is never deleted.
 */
export const StatusChangeModal: React.FC<{ client: Client; target: ClientStatus; onClose: () => void }> = ({ client, target, onClose }) => {
  const { t } = useLanguage();
  const { changeClientStatus } = useSales();

  const isDisqualify = target === 'Disqualified';
  const isQualify = target === 'Qualified';

  const [reasonCode, setReasonCode] = useState(DISQUALIFY_REASONS[0]);
  const [reason, setReason] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const finalReason = isDisqualify
    ? [reasonCode, reason.trim()].filter(Boolean).join(' — ')
    : reason.trim() || undefined;

  const valid = !isDisqualify || (reasonCode !== 'Other' || !!reason.trim());

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    changeClientStatus(client.id, target, finalReason);
    onClose();
  };

  const toggle = (item: string) =>
    setChecked(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]));

  return (
    <Modal
      title={isDisqualify ? t('sales.actions.disqualify') : `${t('sales.actions.moveTo')} ${t(`sales.status.${target}`)}`}
      subtitle={`${client.name} · ${client.id}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={submit}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${isDisqualify ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      <div className="flex items-center gap-2 text-sm">
        <StatusBadge status={client.status} />
        <span className="text-gray-400">→</span>
        <StatusBadge status={target} />
      </div>

      {isDisqualify && (
        <>
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">{t('sales.statusChange.disqualifyWarning')}</p>
          </div>
          <Field label={t('sales.statusChange.reason')} required>
            <select value={reasonCode} onChange={e => setReasonCode(e.target.value)} className={inputClass}>
              {DISQUALIFY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        </>
      )}

      {isQualify && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase mb-2">
            <ShieldCheck size={14} /> {t('sales.statusChange.checklist')}
          </p>
          <div className="space-y-1.5">
            {QUOTE_REQUEST_CHECKLIST.map(item => (
              <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={() => toggle(item)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {item}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{t('sales.statusChange.checklistHint')}</p>
        </div>
      )}

      <Field
        label={isDisqualify ? t('sales.statusChange.detail') : t('sales.statusChange.note')}
        required={isDisqualify && reasonCode === 'Other'}
      >
        <textarea
          rows={3}
          className={`${inputClass} ${touched && !valid ? 'border-red-400' : ''}`}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </Field>
    </Modal>
  );
};
