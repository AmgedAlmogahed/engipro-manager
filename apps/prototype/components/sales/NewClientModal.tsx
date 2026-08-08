import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, DoorOpen, UserPlus, Globe, Share2, MapPin, Landmark, Bot } from 'lucide-react';
import { Client, ClientChannel, Priority, ServiceType } from '../../types';
import { CLIENT_CHANNELS, MOCK_USERS, SAUDI_REGIONS, SERVICE_CATALOG, CURRENT_USER } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { Modal, Field, inputClass } from './shared';

const CHANNEL_ICON: Record<ClientChannel, React.ElementType> = {
  'Walk-in': DoorOpen,
  'Referral': UserPlus,
  'Website': Globe,
  'Social Media': Share2,
  'Google Maps': MapPin,
  'Government Tender': Landmark,
  'AI Chatbot': Bot,
};

/**
 * B1 entry point: any new enquiry. The channel picked first shapes the rest of the form,
 * and phone/email are checked against the whole table before a record can be created.
 */
export const NewClientModal: React.FC<{ onClose: () => void; onCreated?: (id: string) => void }> = ({ onClose, onCreated }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { createClient, findDuplicate } = useSales();

  const [form, setForm] = useState<Partial<Client>>({
    channel: 'Walk-in',
    type: 'Individual',
    priority: 'Medium',
    owner: CURRENT_USER,
    interestedServices: [],
  });
  const [touched, setTouched] = useState(false);

  const set = (patch: Partial<Client>) => setForm(prev => ({ ...prev, ...patch }));

  const duplicate = useMemo(
    () => findDuplicate(form.phone, form.email),
    [form.phone, form.email, findDuplicate]
  );

  const nameValue = form.type === 'Company' ? form.companyName : form.contact;
  const valid = !!form.contact && !!form.phone && !duplicate;

  const toggleService = (s: ServiceType) => {
    const current = form.interestedServices || [];
    set({ interestedServices: current.includes(s) ? current.filter(x => x !== s) : [...current, s] });
  };

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    const created = createClient({ ...form, name: nameValue || form.contact });
    onClose();
    if (onCreated) onCreated(created.id);
  };

  return (
    <Modal
      title={t('sales.newClient.title')}
      subtitle={t('sales.newClient.subtitle')}
      onClose={onClose}
      wide
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={submit}
            disabled={!!duplicate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('sales.newClient.create')}
          </button>
        </>
      }
    >
      {/* Channel */}
      <Field label={t('sales.fields.channel')} required>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CLIENT_CHANNELS.map(channel => {
            const Icon = CHANNEL_ICON[channel];
            const active = form.channel === channel;
            return (
              <button
                key={channel}
                type="button"
                onClick={() => set({ channel })}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border-2 text-xs font-medium transition-all ${
                  active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span className="text-center leading-tight">{t(`sales.channel.${channel}`)}</span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Duplicate guard — one person can never exist twice */}
      {duplicate && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 flex-1">
            <p className="font-medium">{t('sales.newClient.duplicateTitle')}</p>
            <p className="text-xs mt-0.5">
              {duplicate.name} · <span className="font-mono">{duplicate.id}</span> · {t(`sales.status.${duplicate.status}`)}
            </p>
            <button
              onClick={() => { onClose(); navigate(`/clients/${duplicate.id}`); }}
              className="text-xs font-medium text-amber-800 underline mt-1.5"
            >
              {t('sales.newClient.openExisting')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('sales.fields.clientType')}>
          <select value={form.type} onChange={e => set({ type: e.target.value as Client['type'] })} className={inputClass}>
            <option value="Individual">{t('sales.clientType.Individual')}</option>
            <option value="Company">{t('sales.clientType.Company')}</option>
          </select>
        </Field>

        {form.type === 'Company' && (
          <Field label={t('sales.fields.companyName')}>
            <input className={inputClass} value={form.companyName || ''} onChange={e => set({ companyName: e.target.value })} />
          </Field>
        )}

        <Field label={t('sales.fields.contactName')} required>
          <input
            className={`${inputClass} ${touched && !form.contact ? 'border-red-400' : ''}`}
            value={form.contact || ''}
            onChange={e => set({ contact: e.target.value })}
          />
        </Field>

        <Field label={t('sales.fields.phone')} required hint={t('sales.fields.phoneHint')}>
          <input
            className={`${inputClass} ${touched && !form.phone ? 'border-red-400' : ''}`}
            value={form.phone || ''}
            onChange={e => set({ phone: e.target.value })}
            placeholder="05XXXXXXXX"
          />
        </Field>

        <Field label={t('sales.fields.email')}>
          <input type="email" className={inputClass} value={form.email || ''} onChange={e => set({ email: e.target.value })} />
        </Field>

        <Field label={t('sales.fields.region')}>
          <select value={form.region || ''} onChange={e => set({ region: e.target.value })} className={inputClass}>
            <option value="">—</option>
            {SAUDI_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field label={t('sales.fields.city')}>
          <input className={inputClass} value={form.city || ''} onChange={e => set({ city: e.target.value })} />
        </Field>

        <Field label={t('sales.fields.priority')}>
          <select value={form.priority} onChange={e => set({ priority: e.target.value as Priority })} className={inputClass}>
            {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => (
              <option key={p} value={p}>{t(`sales.priority.${p}`)}</option>
            ))}
          </select>
        </Field>

        <Field label={t('sales.fields.owner')}>
          <select
            value={form.owner?.id}
            onChange={e => set({ owner: MOCK_USERS.find(u => u.id === e.target.value) })}
            className={inputClass}
          >
            {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>

        <Field label={t('sales.fields.estimatedBudget')}>
          <input
            type="number"
            className={inputClass}
            value={form.estimatedBudget ?? ''}
            onChange={e => set({ estimatedBudget: e.target.value ? Number(e.target.value) : undefined })}
          />
        </Field>
      </div>

      {/* Channel-specific detail */}
      {form.channel === 'Referral' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <Field label={t('sales.fields.referredBy')}>
            <input className={inputClass} value={form.referredBy || ''} onChange={e => set({ referredBy: e.target.value })} />
          </Field>
          <Field label={t('sales.fields.referrerPhone')}>
            <input className={inputClass} value={form.referrerPhone || ''} onChange={e => set({ referrerPhone: e.target.value })} />
          </Field>
        </div>
      )}

      {form.channel === 'Social Media' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <Field label={t('sales.fields.socialPlatform')}>
            <input className={inputClass} value={form.socialPlatform || ''} onChange={e => set({ socialPlatform: e.target.value })} placeholder="Instagram / X / LinkedIn" />
          </Field>
          <Field label={t('sales.fields.socialProfile')}>
            <input className={inputClass} value={form.socialProfile || ''} onChange={e => set({ socialProfile: e.target.value })} />
          </Field>
        </div>
      )}

      {form.channel === 'Google Maps' && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <Field label={t('sales.fields.mapsLink')}>
            <input className={inputClass} value={form.mapsLink || ''} onChange={e => set({ mapsLink: e.target.value })} placeholder="https://maps.google.com/..." />
          </Field>
        </div>
      )}

      {form.channel === 'Government Tender' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
          <Field label={t('sales.fields.tenderPlatform')}>
            <select className={inputClass} value={form.tenderPlatform || 'Etimad'} onChange={e => set({ tenderPlatform: e.target.value as 'Etimad' | 'Fursa' })}>
              <option value="Etimad">Etimad</option>
              <option value="Fursa">Fursa</option>
            </select>
          </Field>
          <Field label={t('sales.fields.tenderNumber')}>
            <input className={inputClass} value={form.tenderNumber || ''} onChange={e => set({ tenderNumber: e.target.value })} />
          </Field>
          <Field label={t('sales.fields.tenderDeadline')}>
            <input type="date" className={inputClass} value={form.tenderDeadline || ''} onChange={e => set({ tenderDeadline: e.target.value })} />
          </Field>
        </div>
      )}

      <Field label={t('sales.fields.interestedServices')}>
        <div className="flex flex-wrap gap-2">
          {SERVICE_CATALOG.map(s => {
            const active = (form.interestedServices || []).includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {t(`enums.services.${s}`)}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t('sales.fields.notes')}>
        <textarea rows={2} className={inputClass} value={form.notes || ''} onChange={e => set({ notes: e.target.value })} />
      </Field>
    </Modal>
  );
};
