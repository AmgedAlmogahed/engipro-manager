import React, { useMemo, useState } from 'react';
import { Paperclip, Route } from 'lucide-react';
import { Client, ClientDocument, Department, Priority, ServiceType } from '../../types';
import { CURRENT_USER, MOCK_USERS, QUOTE_REQUEST_CHECKLIST, SERVICE_CATALOG, SERVICE_DEPARTMENT } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales, departmentHead } from '../../contexts/SalesContext';
import { Modal, Field, inputClass, formatMoney } from './shared';

/**
 * B2 entry point: the client asks for a price offer. Services picked here decide the
 * department routing — one department goes straight to its head, several go to the PM.
 */
export const NewOpportunityModal: React.FC<{
  client: Client;
  onClose: () => void;
  onCreated?: (id: string) => void;
}> = ({ client, onClose, onCreated }) => {
  const { t } = useLanguage();
  const { createOpportunity } = useSales();

  const [title, setTitle] = useState('');
  const [services, setServices] = useState<ServiceType[]>(client.interestedServices || []);
  const [scope, setScope] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<string>(client.estimatedBudget ? String(client.estimatedBudget) : '');
  const [expectedDecisionDate, setExpectedDecisionDate] = useState('');
  const [priority, setPriority] = useState<Priority>(client.priority);
  const [ownerId, setOwnerId] = useState(client.owner.id);
  const [attached, setAttached] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const departments = useMemo<Department[]>(
    () => Array.from(new Set(services.map(s => SERVICE_DEPARTMENT[s]))),
    [services]
  );

  const route = departments.length > 1 ? 'Project Manager' : 'Department Head';
  const routeTarget = departments.length === 1 ? departmentHead(departments[0]) : undefined;

  const valid = !!title.trim() && services.length > 0 && !!scope.trim();

  const toggleService = (s: ServiceType) =>
    setServices(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));

  const toggleDoc = (item: string) =>
    setAttached(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]));

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    const owner = MOCK_USERS.find(u => u.id === ownerId) || CURRENT_USER;
    const documents: ClientDocument[] = attached.map((category, i) => ({
      id: `od-${Date.now()}-${i}`,
      name: `${category.replace(/[^a-zA-Z]+/g, '_')}.pdf`,
      category,
      fileType: 'pdf',
      uploadedBy: owner,
      uploadDate: new Date().toISOString().slice(0, 10),
      required: true,
    }));
    const created = createOpportunity({
      clientId: client.id,
      clientName: client.name,
      title: title.trim(),
      services,
      departments,
      scope: scope.trim(),
      city: client.city,
      priority,
      owner,
      estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
      expectedDecisionDate: expectedDecisionDate || undefined,
      documents,
    });
    onClose();
    if (onCreated) onCreated(created.id);
  };

  return (
    <Modal
      title={t('sales.newOpportunity.title')}
      subtitle={`${client.name} · ${client.id}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button onClick={submit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            {t('sales.newOpportunity.submit')}
          </button>
        </>
      }
    >
      <Field label={t('sales.fields.opportunityTitle')} required>
        <input
          className={`${inputClass} ${touched && !title.trim() ? 'border-red-400' : ''}`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('sales.fields.opportunityTitlePlaceholder')}
        />
      </Field>

      <Field label={t('sales.fields.services')} required>
        <div className="flex flex-wrap gap-2">
          {SERVICE_CATALOG.map(s => {
            const active = services.includes(s);
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
        {touched && services.length === 0 && (
          <p className="text-xs text-red-500 mt-1">{t('sales.newOpportunity.pickService')}</p>
        )}
      </Field>

      {/* Derived routing — shown before submit so nobody is surprised by where it lands */}
      {departments.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Route size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">
              {route === 'Project Manager' ? t('sales.newOpportunity.routePm') : t('sales.newOpportunity.routeHead')}
            </p>
            <p className="text-xs mt-0.5">
              {departments.map(d => t(`enums.departments.${d}`)).join(' · ')}
              {routeTarget && ` → ${routeTarget.name}`}
            </p>
          </div>
        </div>
      )}

      <Field label={t('sales.fields.scope')} required>
        <textarea
          rows={4}
          className={`${inputClass} ${touched && !scope.trim() ? 'border-red-400' : ''}`}
          value={scope}
          onChange={e => setScope(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label={t('sales.fields.estimatedValue')}>
          <input type="number" className={inputClass} value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} />
        </Field>
        <Field label={t('sales.fields.expectedDecision')}>
          <input type="date" className={inputClass} value={expectedDecisionDate} onChange={e => setExpectedDecisionDate(e.target.value)} />
        </Field>
        <Field label={t('sales.fields.priority')}>
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={inputClass}>
            {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => (
              <option key={p} value={p}>{t(`sales.priority.${p}`)}</option>
            ))}
          </select>
        </Field>
        <Field label={t('sales.fields.owner')}>
          <select value={ownerId} onChange={e => setOwnerId(e.target.value)} className={inputClass}>
            {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      </div>

      <Field label={t('sales.fields.attachments')} hint={t('sales.newOpportunity.attachmentsHint')}>
        <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {QUOTE_REQUEST_CHECKLIST.map(item => (
            <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={attached.includes(item)}
                onChange={() => toggleDoc(item)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Paperclip size={13} className="text-gray-400" />
              {item}
            </label>
          ))}
        </div>
      </Field>

      {estimatedValue && (
        <p className="text-xs text-gray-500">{t('sales.fields.estimatedValue')}: {formatMoney(Number(estimatedValue))}</p>
      )}
    </Modal>
  );
};
