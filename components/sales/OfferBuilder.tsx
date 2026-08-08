import React from 'react';
import { Plus, Trash2, Crown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Installment, InstallmentRule, Quotation } from '../../types';
import { BANK_ACCOUNTS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSales } from '../../contexts/SalesContext';
import { installmentAmount, installmentsTotal, quoteTotals, sectionTotal } from '../../utils/quote';
import { AssignmentStatusBadge, Badge, formatMoney, inputClass } from './shared';

const RULES: InstallmentRule[] = ['On signing', 'On stage completion', 'On date'];

/**
 * The price offer document from module B3 — title and client details come from the record,
 * everything else is filled by the lead pricer and the department pricers.
 */
export const OfferBuilder: React.FC<{ quote: Quotation; editable: boolean }> = ({ quote, editable }) => {
  const { t } = useLanguage();
  const {
    updateQuotation, updateSection, addLineItem, updateLineItem, removeLineItem, setInstallments,
  } = useSales();

  const totals = quoteTotals(quote);
  const installmentSum = installmentsTotal(quote);
  const scheduleValid = Math.abs(installmentSum - 100) < 0.01;

  const patchInstallment = (id: string, patch: Partial<Installment>) =>
    setInstallments(quote.id, quote.installments.map(i => (i.id === id ? { ...i, ...patch } : i)));

  const addInstallment = () =>
    setInstallments(quote.id, [
      ...quote.installments,
      { id: `qp-${Math.random().toString(36).slice(2, 9)}`, label: '', percentage: 0, rule: 'On stage completion' },
    ]);

  const removeInstallment = (id: string) =>
    setInstallments(quote.id, quote.installments.filter(i => i.id !== id));

  return (
    <div className="space-y-6">
      {/* Header block — auto-filled from the client record */}
      <Block title={t('sales.offer.header')}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Meta label={t('sales.offer.quoteNumber')} value={<span className="font-mono">{quote.id} · v{quote.version}</span>} />
          <Meta label={t('sales.offer.issueDate')} value={quote.issueDate} />
          <EditableMeta
            label={t('sales.offer.validUntil')}
            type="date"
            value={quote.validUntil || ''}
            editable={editable}
            onChange={v => updateQuotation(quote.id, { validUntil: v })}
          />
          <EditableMeta
            label={t('sales.offer.timeline')}
            value={quote.deliveryTimeline || ''}
            editable={editable}
            onChange={v => updateQuotation(quote.id, { deliveryTimeline: v })}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Meta label={t('sales.columns.client')} value={quote.clientName} />
          <Meta
            label={t('sales.fields.services')}
            value={quote.services.map(s => t(`enums.services.${s}`)).join(' · ')}
          />
        </div>
      </Block>

      <Block title={t('sales.offer.greeting')}>
        <textarea
          rows={2}
          disabled={!editable}
          className={`${inputClass} disabled:bg-gray-50`}
          value={quote.greeting}
          onChange={e => updateQuotation(quote.id, { greeting: e.target.value })}
        />
      </Block>

      {/* One block per department — the lead compiles them */}
      {quote.sections.map(section => (
        <Block
          key={section.id}
          title={t(`enums.departments.${section.department}`)}
          right={
            <div className="flex items-center gap-2">
              {section.isLead && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Crown size={11} className="me-1" /> {t('sales.rfq.lead')}
                </Badge>
              )}
              {section.pricer && <span className="text-xs text-gray-500">{section.pricer.name}</span>}
              <AssignmentStatusBadge status={section.status === 'Submitted' ? 'Submitted' : 'In Progress'} />
            </div>
          }
        >
          <textarea
            rows={2}
            disabled={!editable}
            placeholder={t('sales.offer.scopePlaceholder')}
            className={`${inputClass} disabled:bg-gray-50 mb-3`}
            value={section.scopeText}
            onChange={e => updateSection(quote.id, section.id, { scopeText: e.target.value })}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="text-start font-medium pb-2">{t('sales.offer.description')}</th>
                  <th className="text-start font-medium pb-2 w-20">{t('sales.offer.qty')}</th>
                  <th className="text-start font-medium pb-2 w-28">{t('sales.offer.unit')}</th>
                  <th className="text-start font-medium pb-2 w-32">{t('sales.offer.unitPrice')}</th>
                  <th className="text-end font-medium pb-2 w-32">{t('sales.offer.lineTotal')}</th>
                  {editable && <th className="w-10" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {section.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-2 pe-2">
                      <input
                        disabled={!editable}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:px-0`}
                        value={item.description}
                        onChange={e => updateLineItem(quote.id, section.id, item.id, { description: e.target.value })}
                      />
                    </td>
                    <td className="py-2 pe-2">
                      <input
                        type="number"
                        disabled={!editable}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:px-0`}
                        value={item.quantity}
                        onChange={e => updateLineItem(quote.id, section.id, item.id, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td className="py-2 pe-2">
                      <input
                        disabled={!editable}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:px-0`}
                        value={item.unit || ''}
                        onChange={e => updateLineItem(quote.id, section.id, item.id, { unit: e.target.value })}
                      />
                    </td>
                    <td className="py-2 pe-2">
                      <input
                        type="number"
                        disabled={!editable}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:px-0`}
                        value={item.unitPrice}
                        onChange={e => updateLineItem(quote.id, section.id, item.id, { unitPrice: Number(e.target.value) })}
                      />
                    </td>
                    <td className="py-2 text-end font-medium text-gray-900 whitespace-nowrap">
                      {formatMoney(item.quantity * item.unitPrice)}
                    </td>
                    {editable && (
                      <td className="py-2 text-end">
                        <button
                          onClick={() => removeLineItem(quote.id, section.id, item.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {section.items.length === 0 && (
                  <tr>
                    <td colSpan={editable ? 6 : 5} className="py-4 text-center text-sm text-gray-400">
                      {t('sales.offer.noItems')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {editable ? (
              <button
                onClick={() => addLineItem(quote.id, section.id)}
                className="flex items-center text-sm text-blue-600 font-medium hover:text-blue-800"
              >
                <Plus size={15} className="me-1" /> {t('sales.offer.addItem')}
              </button>
            ) : <span />}
            <span className="text-sm text-gray-600">
              {t('sales.offer.sectionTotal')}: <span className="font-bold text-gray-900">{formatMoney(sectionTotal(section))}</span>
            </span>
          </div>
        </Block>
      ))}

      {/* Totals */}
      <Block title={t('sales.offer.totals')}>
        <div className="space-y-2 text-sm max-w-md ms-auto">
          <TotalRow label={t('sales.offer.subtotal')} value={formatMoney(totals.subtotal)} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">{t('sales.offer.discount')}</span>
            <input
              type="number"
              disabled={!editable}
              className={`${inputClass} w-40 text-end disabled:bg-transparent disabled:border-transparent`}
              value={quote.discount}
              onChange={e => updateQuotation(quote.id, { discount: Number(e.target.value) })}
            />
          </div>
          <TotalRow label={`${t('sales.offer.vat')} (${quote.vatRate}%)`} value={formatMoney(totals.vat)} />
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">{t('sales.offer.grandTotal')}</span>
            <span className="text-xl font-bold text-gray-900">{formatMoney(totals.total)}</span>
          </div>
        </div>
      </Block>

      {/* Installments — must total 100% */}
      <Block
        title={t('sales.offer.installments')}
        right={
          <Badge className={scheduleValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {scheduleValid ? <CheckCircle2 size={11} className="me-1" /> : <AlertTriangle size={11} className="me-1" />}
            {installmentSum}% / 100%
          </Badge>
        }
      >
        <div className="space-y-2">
          {quote.installments.map(inst => (
            <div key={inst.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                disabled={!editable}
                placeholder={t('sales.offer.installmentLabel')}
                className={`${inputClass} col-span-5 disabled:bg-gray-50`}
                value={inst.label}
                onChange={e => patchInstallment(inst.id, { label: e.target.value })}
              />
              <input
                type="number"
                disabled={!editable}
                className={`${inputClass} col-span-2 disabled:bg-gray-50`}
                value={inst.percentage}
                onChange={e => patchInstallment(inst.id, { percentage: Number(e.target.value) })}
              />
              <select
                disabled={!editable}
                className={`${inputClass} col-span-3 disabled:bg-gray-50`}
                value={inst.rule}
                onChange={e => patchInstallment(inst.id, { rule: e.target.value as InstallmentRule })}
              >
                {RULES.map(r => <option key={r} value={r}>{t(`sales.installmentRule.${r}`)}</option>)}
              </select>
              <span className="col-span-1 text-sm text-gray-700 text-end whitespace-nowrap">
                {formatMoney(installmentAmount(quote, inst.percentage))}
              </span>
              {editable && (
                <button
                  onClick={() => removeInstallment(inst.id)}
                  className="col-span-1 text-gray-400 hover:text-red-600 justify-self-end p-1"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        {editable && (
          <button onClick={addInstallment} className="flex items-center text-sm text-blue-600 font-medium hover:text-blue-800 mt-3">
            <Plus size={15} className="me-1" /> {t('sales.offer.addInstallment')}
          </button>
        )}
        {!scheduleValid && (
          <p className="text-xs text-red-600 mt-2">{t('sales.offer.scheduleWarning')}</p>
        )}
      </Block>

      <Block title={t('sales.offer.closing')}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">{t('sales.fields.notes')}</p>
            <textarea
              rows={2}
              disabled={!editable}
              className={`${inputClass} disabled:bg-gray-50`}
              value={quote.notes}
              onChange={e => updateQuotation(quote.id, { notes: e.target.value })}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">{t('sales.offer.bankAccount')}</p>
            <select
              disabled={!editable}
              className={`${inputClass} disabled:bg-gray-50`}
              value={quote.bankAccount}
              onChange={e => updateQuotation(quote.id, { bankAccount: e.target.value })}
            >
              {BANK_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">{t('sales.offer.conclusion')}</p>
            <textarea
              rows={2}
              disabled={!editable}
              className={`${inputClass} disabled:bg-gray-50`}
              value={quote.conclusion}
              onChange={e => updateQuotation(quote.id, { conclusion: e.target.value })}
            />
          </div>
        </div>
      </Block>
    </div>
  );
};

const Block: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
      {right}
    </div>
    {children}
  </div>
);

const Meta: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
  </div>
);

const EditableMeta: React.FC<{
  label: string;
  value: string;
  editable: boolean;
  type?: string;
  onChange: (value: string) => void;
}> = ({ label, value, editable, type = 'text', onChange }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <input
      type={type}
      disabled={!editable}
      className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:px-0`}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const TotalRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);
