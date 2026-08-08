import { Quotation, QuoteSection } from '../types';

/** Money maths for the price offer. Every figure on the document derives from here. */

export const sectionTotal = (section: QuoteSection) =>
  section.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  net: number;
  vat: number;
  total: number;
}

export const quoteTotals = (quote: Quotation): QuoteTotals => {
  const subtotal = quote.sections.reduce((sum, s) => sum + sectionTotal(s), 0);
  const discount = Math.min(quote.discount || 0, subtotal);
  const net = subtotal - discount;
  const vat = net * ((quote.vatRate ?? 0) / 100);
  return { subtotal, discount, net, vat, total: net + vat };
};

/** The payment schedule must add up to exactly 100 percent before an offer can go out. */
export const installmentsTotal = (quote: Quotation) =>
  quote.installments.reduce((sum, i) => sum + (i.percentage || 0), 0);

export const installmentAmount = (quote: Quotation, percentage: number) =>
  (quoteTotals(quote).total * percentage) / 100;
