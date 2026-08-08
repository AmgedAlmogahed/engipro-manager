import React, { useState } from 'react';
import { Client, InteractionDirection, InteractionType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { Modal, Field, inputClass, InteractionIcon } from './shared';

const TYPES: InteractionType[] = ['Call', 'Meeting', 'Email', 'WhatsApp', 'Site Visit', 'Office Visit', 'Note'];

const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

/** Every touch is logged. Logging the first one on a raw lead moves it to Contacted. */
export const LogInteractionModal: React.FC<{ client: Client; onClose: () => void }> = ({ client, onClose }) => {
  const { t } = useLanguage();
  const { logInteraction } = useSales();

  const [type, setType] = useState<InteractionType>('Call');
  const [direction, setDirection] = useState<InteractionDirection>('Outbound');
  const [subject, setSubject] = useState('');
  const [summary, setSummary] = useState('');
  const [occurredAt, setOccurredAt] = useState(localNow());
  const [outcome, setOutcome] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [touched, setTouched] = useState(false);

  const submit = () => {
    setTouched(true);
    if (!subject.trim()) return;
    logInteraction(client.id, {
      type,
      direction,
      subject: subject.trim(),
      summary: summary.trim() || undefined,
      occurredAt: new Date(occurredAt).toISOString(),
      outcome: outcome.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
      followUpDate: followUpDate || undefined,
    });
    onClose();
  };

  return (
    <Modal
      title={t('sales.actions.logInteraction')}
      subtitle={`${client.name} · ${client.id}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button onClick={submit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            {t('common.save')}
          </button>
        </>
      }
    >
      <Field label={t('sales.fields.interactionType')} required>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                type === item ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <InteractionIcon type={item} size={14} />
              {t(`sales.interaction.${item}`)}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('sales.fields.direction')}>
          <select value={direction} onChange={e => setDirection(e.target.value as InteractionDirection)} className={inputClass}>
            <option value="Outbound">{t('sales.direction.Outbound')}</option>
            <option value="Inbound">{t('sales.direction.Inbound')}</option>
          </select>
        </Field>
        <Field label={t('sales.fields.occurredAt')}>
          <input type="datetime-local" value={occurredAt} onChange={e => setOccurredAt(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label={t('sales.fields.subject')} required>
        <input
          className={`${inputClass} ${touched && !subject.trim() ? 'border-red-400' : ''}`}
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </Field>

      <Field label={t('sales.fields.summary')}>
        <textarea rows={3} className={inputClass} value={summary} onChange={e => setSummary(e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('sales.fields.outcome')}>
          <input className={inputClass} value={outcome} onChange={e => setOutcome(e.target.value)} />
        </Field>
        <Field label={t('sales.fields.nextAction')}>
          <input className={inputClass} value={nextAction} onChange={e => setNextAction(e.target.value)} />
        </Field>
      </div>

      <Field label={t('sales.fields.followUp')}>
        <input type="date" className={inputClass} value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
      </Field>
    </Modal>
  );
};
