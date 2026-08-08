import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import {
  Client, ClientStatus, Interaction, Opportunity, OpportunityStatus,
  AssignmentRoute, User, ClientDocument, Rfq, RfqAssignment, RfqRejectType,
  Quotation, QuoteLineItem, QuoteSection, Installment, QuoteChangeType
} from '../types';
import {
  MOCK_CLIENTS, MOCK_OPPORTUNITIES, MOCK_RFQS, MOCK_QUOTATIONS, CURRENT_USER,
  SERVICE_DEPARTMENT, MOCK_DEPARTMENTS, APPROVAL_CHAIN, BANK_ACCOUNTS,
  DEFAULT_CONCLUSION, DEFAULT_GREETING, DEFAULT_INSTALLMENTS, VAT_RATE
} from '../constants';
import { quoteTotals } from '../utils/quote';

/**
 * In-memory store for modules B1 (client record) and B2 (opportunity & quote request).
 * Records are never deleted here — status changes and history entries are appended,
 * which mirrors the no-deletion rule in the process flow.
 */

interface SalesContextType {
  clients: Client[];
  opportunities: Opportunity[];
  rfqs: Rfq[];
  quotations: Quotation[];

  getClient: (id: string) => Client | undefined;
  findDuplicate: (phone?: string, email?: string, ignoreId?: string) => Client | undefined;
  createClient: (draft: Partial<Client>) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  changeClientStatus: (id: string, to: ClientStatus, reason?: string) => void;
  logInteraction: (clientId: string, entry: Omit<Interaction, 'id' | 'clientId' | 'user'> & { user?: User }) => void;
  addClientDocument: (clientId: string, doc: Omit<ClientDocument, 'id' | 'uploadedBy' | 'uploadDate'>) => void;

  getOpportunity: (id: string) => Opportunity | undefined;
  opportunitiesForClient: (clientId: string) => Opportunity[];
  createOpportunity: (draft: Partial<Opportunity> & { clientId: string; title: string }) => Opportunity;
  updateOpportunity: (id: string, patch: Partial<Opportunity>, action?: string, note?: string) => void;
  reviewOpportunity: (id: string, complete: boolean, notes?: string, missingItems?: string[]) => void;
  assignOpportunity: (id: string, route: AssignmentRoute, assignee: User) => void;
  raiseRfq: (id: string) => string;
  cancelOpportunity: (id: string, reason: string) => void;

  // --- B3 ---
  getRfq: (id: string) => Rfq | undefined;
  rfqsForClient: (clientId: string) => Rfq[];
  acceptRfq: (id: string) => void;
  rejectRfq: (id: string, type: RfqRejectType, reason: string) => void;
  updateAssignment: (rfqId: string, assignmentId: string, patch: Partial<RfqAssignment>) => void;
  addAssignment: (rfqId: string, assignment: Omit<RfqAssignment, 'id'>) => void;
  startPricing: (rfqId: string) => string;
  markOfferReady: (rfqId: string) => void;
  sendForApproval: (rfqId: string) => void;
  decideApproval: (rfqId: string, approvalId: string, approved: boolean, comments?: string) => void;

  // --- B4 ---
  getQuotation: (id: string) => Quotation | undefined;
  quotationsForClient: (clientId: string) => Quotation[];
  updateQuotation: (id: string, patch: Partial<Quotation>, action?: string, note?: string) => void;
  updateSection: (quoteId: string, sectionId: string, patch: Partial<QuoteSection>) => void;
  addLineItem: (quoteId: string, sectionId: string) => void;
  updateLineItem: (quoteId: string, sectionId: string, itemId: string, patch: Partial<QuoteLineItem>) => void;
  removeLineItem: (quoteId: string, sectionId: string, itemId: string) => void;
  setInstallments: (quoteId: string, installments: Installment[]) => void;
  sendQuotation: (id: string) => void;
  startNegotiation: (id: string, note: string) => void;
  createRevision: (id: string, changeType: QuoteChangeType, note: string) => void;
  markWon: (id: string) => string;
  markLost: (id: string, reason: string) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

const year = () => new Date().getFullYear();
const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();

/** Next sequential business ID, e.g. CLIENT-2026-0009. */
const nextId = (prefix: string, existing: string[]) => {
  const y = year();
  const seqs = existing
    .filter(id => id.startsWith(`${prefix}-${y}-`))
    .map(id => parseInt(id.split('-')[2], 10))
    .filter(n => !isNaN(n));
  const next = (seqs.length ? Math.max(...seqs) : 0) + 1;
  return `${prefix}-${y}-${String(next).padStart(4, '0')}`;
};

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

/** Digits only, so 05x, +9665x and spaced numbers compare equal. */
const normalizePhone = (v?: string) => (v || '').replace(/\D/g, '').replace(/^966/, '0');

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [rfqs, setRfqs] = useState<Rfq[]>(MOCK_RFQS);
  const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);

  const getClient = useCallback((id: string) => clients.find(c => c.id === id), [clients]);

  const findDuplicate = useCallback((phone?: string, email?: string, ignoreId?: string) => {
    const p = normalizePhone(phone);
    const e = (email || '').trim().toLowerCase();
    if (!p && !e) return undefined;
    return clients.find(c =>
      c.id !== ignoreId &&
      ((p && normalizePhone(c.phone) === p) || (e && c.email.toLowerCase() === e))
    );
  }, [clients]);

  const createClient = useCallback((draft: Partial<Client>) => {
    const id = nextId('CLIENT', clients.map(c => c.id));
    const owner = draft.owner || CURRENT_USER;
    const clean = Object.fromEntries(
      Object.entries(draft).filter(([, v]) => v !== undefined && v !== '')
    ) as Partial<Client>;
    const record: Client = {
      name: draft.name || draft.contact || 'Untitled',
      type: 'Individual',
      contact: draft.contact || draft.name || '',
      email: '',
      channel: 'Walk-in',
      priority: 'Medium',
      slaStatus: 'On Time',
      ...clean,
      // derived — never taken from the draft
      id,
      owner,
      status: 'New Lead',
      createdAt: today(),
      lifetimeValue: 0,
      statusHistory: [{ id: uid('sh'), to: 'New Lead', date: today(), user: owner }],
      interactions: [],
      documents: [],
    };
    setClients(prev => [record, ...prev]);
    return record;
  }, [clients]);

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const changeClientStatus = useCallback((id: string, to: ClientStatus, reason?: string) => {
    setClients(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (c.status === to) return c;
      return {
        ...c,
        status: to,
        convertedAt: to === 'Client' && !c.convertedAt ? today() : c.convertedAt,
        disqualifyReason: to === 'Disqualified' ? reason : c.disqualifyReason,
        statusHistory: [
          ...c.statusHistory,
          { id: uid('sh'), from: c.status, to, date: today(), user: CURRENT_USER, reason },
        ],
      };
    }));
  }, []);

  const logInteraction = useCallback((clientId: string, entry: Omit<Interaction, 'id' | 'clientId' | 'user'> & { user?: User }) => {
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      const interaction: Interaction = {
        ...entry,
        id: uid('in'),
        clientId,
        user: entry.user || CURRENT_USER,
      };
      // First contact on a raw lead moves it forward and stops the SLA clock.
      const advanced = c.status === 'New Lead';
      return {
        ...c,
        interactions: [interaction, ...c.interactions],
        lastInteractionAt: interaction.occurredAt.slice(0, 10),
        firstResponseAt: c.firstResponseAt || interaction.occurredAt,
        slaStatus: c.firstResponseAt ? c.slaStatus : 'On Time',
        status: advanced ? 'Contacted' : c.status,
        statusHistory: advanced
          ? [...c.statusHistory, { id: uid('sh'), from: 'New Lead' as ClientStatus, to: 'Contacted' as ClientStatus, date: today(), user: CURRENT_USER, reason: 'First interaction logged' }]
          : c.statusHistory,
      };
    }));
  }, []);

  const addClientDocument = useCallback((clientId: string, doc: Omit<ClientDocument, 'id' | 'uploadedBy' | 'uploadDate'>) => {
    setClients(prev => prev.map(c => c.id === clientId
      ? { ...c, documents: [...c.documents, { ...doc, id: uid('cd'), uploadedBy: CURRENT_USER, uploadDate: today() }] }
      : c));
  }, []);

  const getOpportunity = useCallback((id: string) => opportunities.find(o => o.id === id), [opportunities]);

  const opportunitiesForClient = useCallback(
    (clientId: string) => opportunities.filter(o => o.clientId === clientId),
    [opportunities]
  );

  const createOpportunity = useCallback((draft: Partial<Opportunity> & { clientId: string; title: string }) => {
    const id = nextId('OPP', opportunities.map(o => o.id));
    const services = draft.services || [];
    const departments = draft.departments?.length
      ? draft.departments
      : Array.from(new Set(services.map(s => SERVICE_DEPARTMENT[s])));
    const owner = draft.owner || CURRENT_USER;
    const record: Opportunity = {
      priority: 'Medium',
      scope: '',
      ...draft,
      id,
      services,
      departments,
      owner,
      status: (draft.status as OpportunityStatus) || 'Submitted',
      createdAt: today(),
      documents: draft.documents || [],
      history: [
        { id: uid('oe'), action: 'Opportunity created', date: today(), user: owner },
        { id: uid('oe'), action: 'Submitted for review', date: today(), user: owner },
      ],
    } as Opportunity;
    setOpportunities(prev => [record, ...prev]);
    return record;
  }, [opportunities]);

  const updateOpportunity = useCallback((id: string, patch: Partial<Opportunity>, action?: string, note?: string) => {
    setOpportunities(prev => prev.map(o => o.id === id
      ? {
          ...o,
          ...patch,
          history: action
            ? [...o.history, { id: uid('oe'), action, date: today(), user: CURRENT_USER, note }]
            : o.history,
        }
      : o));
  }, []);

  const reviewOpportunity = useCallback((id: string, complete: boolean, notes?: string, missingItems?: string[]) => {
    updateOpportunity(
      id,
      {
        status: complete ? 'Under Review' : 'Incomplete',
        reviewedBy: CURRENT_USER,
        reviewedAt: today(),
        reviewNotes: notes,
        missingItems: complete ? [] : missingItems,
      },
      complete ? 'Marked complete' : 'Returned as incomplete',
      complete ? notes : (missingItems || []).join(', ')
    );
  }, [updateOpportunity]);

  const assignOpportunity = useCallback((id: string, route: AssignmentRoute, assignee: User) => {
    updateOpportunity(
      id,
      { status: 'Assigned', assignmentRoute: route, assignee, assignedAt: today() },
      route === 'Department Head' ? 'Assigned to department head' : 'Assigned to project manager',
      assignee.name
    );
  }, [updateOpportunity]);

  /** Handover B2 → B3: the opportunity stops moving and a real RFQ record starts. */
  const raiseRfq = useCallback((id: string) => {
    const opp = opportunities.find(o => o.id === id);
    const rfqId = nextId('RFQ', rfqs.map(r => r.id));
    if (opp) {
      const assignments: RfqAssignment[] = opp.departments.map((department, i) => ({
        id: uid('ra'),
        department,
        assignee: (i === 0 && opp.assignee) ? opp.assignee : (departmentHead(department) || CURRENT_USER),
        isLead: i === 0,
        status: 'Not Started',
      }));
      const record: Rfq = {
        id: rfqId,
        opportunityId: opp.id,
        clientId: opp.clientId,
        clientName: opp.clientName,
        title: opp.title,
        scope: opp.scope,
        services: opp.services,
        departments: opp.departments,
        priority: opp.priority,
        status: 'Received',
        owner: opp.owner,
        receivedAt: today(),
        assignments,
        approvals: [],
        history: [{ id: uid('re'), action: 'RFQ received from sales', date: today(), user: CURRENT_USER }],
      };
      setRfqs(prev => [record, ...prev]);
    }
    updateOpportunity(id, { status: 'RFQ Raised', rfqId, rfqRaisedAt: today() }, `RFQ raised — ${rfqId}`);
    return rfqId;
  }, [opportunities, rfqs, updateOpportunity]);

  const cancelOpportunity = useCallback((id: string, reason: string) => {
    updateOpportunity(id, { status: 'Cancelled', cancelReason: reason }, 'Cancelled', reason);
  }, [updateOpportunity]);

  // ============================================================
  // B3 — RFQ processing
  // ============================================================

  const getRfq = useCallback((id: string) => rfqs.find(r => r.id === id), [rfqs]);

  const rfqsForClient = useCallback((clientId: string) => rfqs.filter(r => r.clientId === clientId), [rfqs]);

  const patchRfq = useCallback((id: string, patch: Partial<Rfq>, action?: string, note?: string) => {
    setRfqs(prev => prev.map(r => r.id === id
      ? {
          ...r,
          ...patch,
          history: action ? [...r.history, { id: uid('re'), action, date: today(), user: CURRENT_USER, note }] : r.history,
        }
      : r));
  }, []);

  const acceptRfq = useCallback((id: string) => {
    patchRfq(id, { status: 'Accepted', acceptedBy: CURRENT_USER, acceptedAt: today() }, 'Accepted by department');
  }, [patchRfq]);

  const rejectRfq = useCallback((id: string, type: RfqRejectType, reason: string) => {
    patchRfq(
      id,
      { status: 'Rejected', rejectType: type, rejectReason: reason, rejectedAt: today() },
      'Rejected and returned to sales',
      `${type} — ${reason}`
    );
  }, [patchRfq]);

  const updateAssignment = useCallback((rfqId: string, assignmentId: string, patch: Partial<RfqAssignment>) => {
    setRfqs(prev => prev.map(r => {
      if (r.id !== rfqId) return r;
      return {
        ...r,
        assignments: r.assignments.map(a => {
          if (a.id === assignmentId) return { ...a, ...patch };
          // Exactly one lead per RFQ — promoting one demotes the rest.
          return patch.isLead ? { ...a, isLead: false } : a;
        }),
      };
    }));
  }, []);

  const addAssignment = useCallback((rfqId: string, assignment: Omit<RfqAssignment, 'id'>) => {
    setRfqs(prev => prev.map(r => r.id === rfqId
      ? { ...r, assignments: [...r.assignments, { ...assignment, id: uid('ra') }] }
      : r));
  }, []);

  /** Creates the offer document the lead pricer fills in. */
  const startPricing = useCallback((rfqId: string) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) return '';
    if (rfq.quotationId) return rfq.quotationId;

    const quoteId = nextId('QUO', quotations.map(q => q.id));
    const sections: QuoteSection[] = rfq.assignments.map(a => ({
      id: uid('qs'),
      department: a.department,
      pricer: a.assignee,
      isLead: a.isLead,
      scopeText: '',
      items: [],
      status: 'Draft',
    }));
    const quotation: Quotation = {
      id: quoteId,
      version: 1,
      rfqId: rfq.id,
      opportunityId: rfq.opportunityId,
      clientId: rfq.clientId,
      clientName: rfq.clientName,
      title: rfq.title,
      status: 'Ready',
      owner: rfq.owner,
      issueDate: today(),
      greeting: DEFAULT_GREETING,
      services: rfq.services,
      sections,
      installments: DEFAULT_INSTALLMENTS.map(i => ({ ...i, id: uid('qp') })),
      notes: '',
      bankAccount: BANK_ACCOUNTS[0],
      conclusion: DEFAULT_CONCLUSION,
      discount: 0,
      vatRate: VAT_RATE,
      versionHistory: [],
      history: [{ id: uid('qe'), action: 'Offer draft created', date: today(), user: CURRENT_USER }],
    };
    setQuotations(prev => [quotation, ...prev]);
    patchRfq(rfqId, { status: 'Pricing', quotationId: quoteId }, 'Pricing started');
    return quoteId;
  }, [rfqs, quotations, patchRfq]);

  const markOfferReady = useCallback((rfqId: string) => {
    patchRfq(rfqId, { status: 'Offer Ready' }, 'Offer ready');
  }, [patchRfq]);

  const sendForApproval = useCallback((rfqId: string) => {
    patchRfq(
      rfqId,
      {
        status: 'In Approval',
        sentForApprovalAt: today(),
        approvals: APPROVAL_CHAIN.map(a => ({ id: uid('ap'), tier: a.tier, approver: a.approver, status: 'Pending' })),
      },
      'Sent for approval'
    );
  }, [patchRfq]);

  const decideApproval = useCallback((rfqId: string, approvalId: string, approved: boolean, comments?: string) => {
    setRfqs(prev => prev.map(r => {
      if (r.id !== rfqId) return r;
      const approvals = r.approvals.map(a => a.id === approvalId
        ? { ...a, status: approved ? 'Approved' as const : 'Rejected' as const, decidedAt: today(), comments }
        : a);
      const decided = approvals.find(a => a.id === approvalId);
      const allApproved = approvals.every(a => a.status === 'Approved');
      const status: Rfq['status'] = !approved ? 'Pricing' : allApproved ? 'Approved' : 'In Approval';
      return {
        ...r,
        approvals,
        status,
        approvedAt: allApproved && approved ? today() : r.approvedAt,
        history: [...r.history, {
          id: uid('re'),
          action: approved
            ? `Approved by ${decided?.approver.name}`
            : `Rejected by ${decided?.approver.name} — back to pricing`,
          date: today(),
          user: decided?.approver || CURRENT_USER,
          note: comments,
        }],
      };
    }));
  }, []);

  // ============================================================
  // B4 — quotation lifecycle
  // ============================================================

  const getQuotation = useCallback((id: string) => quotations.find(q => q.id === id), [quotations]);

  const quotationsForClient = useCallback(
    (clientId: string) => quotations.filter(q => q.clientId === clientId),
    [quotations]
  );

  const updateQuotation = useCallback((id: string, patch: Partial<Quotation>, action?: string, note?: string) => {
    setQuotations(prev => prev.map(q => q.id === id
      ? {
          ...q,
          ...patch,
          history: action ? [...q.history, { id: uid('qe'), action, date: today(), user: CURRENT_USER, note }] : q.history,
        }
      : q));
  }, []);

  const updateSection = useCallback((quoteId: string, sectionId: string, patch: Partial<QuoteSection>) => {
    setQuotations(prev => prev.map(q => q.id === quoteId
      ? { ...q, sections: q.sections.map(s => (s.id === sectionId ? { ...s, ...patch } : s)) }
      : q));
  }, []);

  const addLineItem = useCallback((quoteId: string, sectionId: string) => {
    setQuotations(prev => prev.map(q => q.id === quoteId
      ? {
          ...q,
          sections: q.sections.map(s => s.id === sectionId
            ? { ...s, items: [...s.items, { id: uid('qi'), description: '', quantity: 1, unit: 'lump sum', unitPrice: 0 }] }
            : s),
        }
      : q));
  }, []);

  const updateLineItem = useCallback((quoteId: string, sectionId: string, itemId: string, patch: Partial<QuoteLineItem>) => {
    setQuotations(prev => prev.map(q => q.id === quoteId
      ? {
          ...q,
          sections: q.sections.map(s => s.id === sectionId
            ? { ...s, items: s.items.map(i => (i.id === itemId ? { ...i, ...patch } : i)) }
            : s),
        }
      : q));
  }, []);

  const removeLineItem = useCallback((quoteId: string, sectionId: string, itemId: string) => {
    setQuotations(prev => prev.map(q => q.id === quoteId
      ? {
          ...q,
          sections: q.sections.map(s => s.id === sectionId
            ? { ...s, items: s.items.filter(i => i.id !== itemId) }
            : s),
        }
      : q));
  }, []);

  const setInstallments = useCallback((quoteId: string, installments: Installment[]) => {
    setQuotations(prev => prev.map(q => (q.id === quoteId ? { ...q, installments } : q)));
  }, []);

  const sendQuotation = useCallback((id: string) => {
    const quote = quotations.find(q => q.id === id);
    updateQuotation(id, { status: 'Sent', sentAt: today() }, 'Sent to client');
    if (quote) patchRfq(quote.rfqId, { status: 'Quoted' }, `Quotation sent — ${quote.id}`);
  }, [quotations, updateQuotation, patchRfq]);

  const startNegotiation = useCallback((id: string, note: string) => {
    updateQuotation(id, { status: 'Negotiation', negotiationNote: note }, 'Client is negotiating', note);
  }, [updateQuotation]);

  /** Any price, scope or timeline edit produces a new version — the old one is kept. */
  const createRevision = useCallback((id: string, changeType: QuoteChangeType, note: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id !== id) return q;
      const version = q.version + 1;
      return {
        ...q,
        version,
        status: 'Ready',
        issueDate: today(),
        versionHistory: [
          ...q.versionHistory,
          { version, date: today(), user: CURRENT_USER, changeType, totalAmount: quoteTotals(q).total, note },
        ],
        history: [...q.history, { id: uid('qe'), action: `Version ${version} created — ${changeType}`, date: today(), user: CURRENT_USER, note }],
      };
    }));
  }, []);

  const markWon = useCallback((id: string) => {
    const quote = quotations.find(q => q.id === id);
    const poId = nextId('PO', quotations.map(q => q.poId || ''));
    updateQuotation(id, { status: 'Won', wonAt: today(), poId }, `Marked WON — ${poId} generated`);
    if (quote) {
      const total = quoteTotals(quote).total;
      setClients(prev => prev.map(c => {
        if (c.id !== quote.clientId) return c;
        const becomesClient = c.status !== 'Client';
        return {
          ...c,
          status: 'Client',
          convertedAt: c.convertedAt || today(),
          lifetimeValue: c.lifetimeValue + total,
          statusHistory: becomesClient
            ? [...c.statusHistory, { id: uid('sh'), from: c.status, to: 'Client' as ClientStatus, date: today(), user: CURRENT_USER, reason: `Quotation ${id} won` }]
            : c.statusHistory,
        };
      }));
    }
    return poId;
  }, [quotations, updateQuotation]);

  const markLost = useCallback((id: string, reason: string) => {
    updateQuotation(id, { status: 'Lost', lostAt: today(), lostReason: reason }, 'Marked LOST', reason);
  }, [updateQuotation]);

  const value = useMemo<SalesContextType>(() => ({
    clients, opportunities, rfqs, quotations,
    getClient, findDuplicate, createClient, updateClient, changeClientStatus, logInteraction, addClientDocument,
    getOpportunity, opportunitiesForClient, createOpportunity, updateOpportunity,
    reviewOpportunity, assignOpportunity, raiseRfq, cancelOpportunity,
    getRfq, rfqsForClient, acceptRfq, rejectRfq, updateAssignment, addAssignment,
    startPricing, markOfferReady, sendForApproval, decideApproval,
    getQuotation, quotationsForClient, updateQuotation, updateSection,
    addLineItem, updateLineItem, removeLineItem, setInstallments,
    sendQuotation, startNegotiation, createRevision, markWon, markLost,
  }), [
    clients, opportunities, rfqs, quotations, getClient, findDuplicate, createClient, updateClient,
    changeClientStatus, logInteraction, addClientDocument, getOpportunity, opportunitiesForClient,
    createOpportunity, updateOpportunity, reviewOpportunity, assignOpportunity, raiseRfq, cancelOpportunity,
    getRfq, rfqsForClient, acceptRfq, rejectRfq, updateAssignment, addAssignment, startPricing,
    markOfferReady, sendForApproval, decideApproval, getQuotation, quotationsForClient, updateQuotation,
    updateSection, addLineItem, updateLineItem, removeLineItem, setInstallments, sendQuotation,
    startNegotiation, createRevision, markWon, markLost,
  ]);

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};

export const useSales = () => {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within a SalesProvider');
  return ctx;
};

/** Department head lookup used by the single-department assignment route. */
export const departmentHead = (department: string): User | undefined =>
  MOCK_DEPARTMENTS.find(d => d.name === department)?.headOfDepartment;
