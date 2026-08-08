import {
  Project, AuthorityApplication, User, Client, ActivityLog, ProjectDocument, Employee,
  DepartmentDetails, Role, PermissionDefinition, RoleAuditLog,
  ClientChannel, ClientStatus, ServiceType, Department, Opportunity,
  Rfq, RfqRejectType, Quotation, Installment
} from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Engineer',
  role: 'Senior Project Manager',
  avatar: 'https://picsum.photos/100/100'
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Jane Architect', role: 'Lead Architect', avatar: 'https://picsum.photos/101/101' },
  { id: 'u3', name: 'Bob Builder', role: 'Civil Engineer', avatar: 'https://picsum.photos/102/102' },
  { id: 'u4', name: 'Ahmed Surveyor', role: 'Head of Surveying', avatar: 'https://picsum.photos/103/103' },
  { id: 'u5', name: 'Layla Safety', role: 'Safety Officer', avatar: 'https://picsum.photos/104/104' },
  { id: 'u7', name: 'Khalid Sales', role: 'Sales Manager', avatar: 'https://picsum.photos/106/106' },
  { id: 'u8', name: 'Noura Rep', role: 'Sales Representative', avatar: 'https://picsum.photos/107/107' },
  { id: 'u9', name: 'Sami Finance', role: 'CFO', avatar: 'https://picsum.photos/108/108' },
  { id: 'u10', name: 'Omar Director', role: 'General Manager', avatar: 'https://picsum.photos/109/109' },
];

export const SALES_MANAGER = MOCK_USERS[5];
export const SALES_REP = MOCK_USERS[6];
export const CFO = MOCK_USERS[7];
export const GENERAL_MANAGER = MOCK_USERS[8];

export const MOCK_EMPLOYEES: Employee[] = [
  { ...CURRENT_USER, email: 'alex@engipro.com', department: 'Modern', activeProjects: 5, openTasks: 12, status: 'Active', joinDate: '2020-01-15', utilization: 85 },
  { ...MOCK_USERS[1], email: 'jane@engipro.com', department: 'Architecture', activeProjects: 3, openTasks: 8, status: 'Active', joinDate: '2021-03-10', utilization: 92 },
  { ...MOCK_USERS[2], email: 'bob@engipro.com', department: 'Civil', activeProjects: 4, openTasks: 15, status: 'Active', joinDate: '2019-11-01', utilization: 110 }, // Overloaded
  { ...MOCK_USERS[3], email: 'ahmed@engipro.com', department: 'Surveying', activeProjects: 2, openTasks: 4, status: 'On Leave', joinDate: '2022-05-20', utilization: 0 },
  { ...MOCK_USERS[4], email: 'layla@engipro.com', department: 'Safety', activeProjects: 6, openTasks: 10, status: 'Active', joinDate: '2021-08-15', utilization: 75 },
  { id: 'u6', name: 'Mohammed Draftsman', role: 'Junior Architect', avatar: 'https://picsum.photos/105/105', email: 'mohammed@engipro.com', department: 'Architecture', activeProjects: 2, openTasks: 6, status: 'Active', joinDate: '2023-01-10', utilization: 40 }, // Available
];

export const MOCK_DEPARTMENTS: DepartmentDetails[] = [
  { id: 'd1', name: 'Architecture', description: 'Design and planning of structures.', headOfDepartment: MOCK_USERS[1], employeeCount: 8, activeProjectCount: 12 },
  { id: 'd2', name: 'Civil', description: 'Structural engineering and infrastructure.', headOfDepartment: MOCK_USERS[2], employeeCount: 10, activeProjectCount: 15 },
  { id: 'd3', name: 'Safety', description: 'Site safety and compliance.', headOfDepartment: MOCK_USERS[4], employeeCount: 4, activeProjectCount: 8 },
  { id: 'd4', name: 'Surveying', description: 'Land surveying and mapping.', headOfDepartment: MOCK_USERS[3], employeeCount: 5, activeProjectCount: 6 },
  { id: 'd5', name: 'Modern', description: 'Modern building techniques.', headOfDepartment: CURRENT_USER, employeeCount: 3, activeProjectCount: 4 },
  { id: 'd6', name: 'Khitbrah', description: 'Specialized consulting.', headOfDepartment: MOCK_USERS[0], employeeCount: 2, activeProjectCount: 2 },
];

// ============================================================
// Module B1 / B2 — catalogs (module 12 will make these editable)
// ============================================================

export const CLIENT_CHANNELS: ClientChannel[] = [
  'Walk-in', 'Referral', 'Website', 'Social Media', 'Google Maps', 'Government Tender', 'AI Chatbot'
];

export const CLIENT_STATUSES: ClientStatus[] = [
  'New Lead', 'Contacted', 'Qualified', 'Client', 'Dormant', 'Disqualified'
];

/** The happy path of B1. Disqualified is terminal and reachable from any open status. */
export const CLIENT_STATUS_FLOW: ClientStatus[] = ['New Lead', 'Contacted', 'Qualified', 'Client'];

export const DISQUALIFY_REASONS = [
  'Budget below minimum',
  'Service not offered',
  'Outside coverage area',
  'Duplicate record',
  'No response after repeated contact',
  'Client withdrew',
  'Other',
];

export const SERVICE_CATALOG: ServiceType[] = [
  'Architectural Design', 'Structural Engineering', 'MEP Design',
  'Safety Consultation', 'Site Supervision', 'Surveying', 'Permit Management'
];

/** Which department owns which service — drives the B2 assignment route. */
export const SERVICE_DEPARTMENT: Record<ServiceType, Department> = {
  'Architectural Design': 'Architecture',
  'Structural Engineering': 'Civil',
  'MEP Design': 'Modern',
  'Safety Consultation': 'Safety',
  'Site Supervision': 'Civil',
  'Surveying': 'Surveying',
  'Permit Management': 'Khitbrah',
};

export const SAUDI_REGIONS = [
  'Riyadh', 'Makkah', 'Madinah', 'Qassim', 'Eastern Province', 'Asir', 'Tabuk',
  'Hail', 'Northern Borders', 'Jazan', 'Najran', 'Al-Baha', 'Al-Jouf'
];

export const QUOTE_REQUEST_CHECKLIST = [
  'Signed quote request',
  'Title deed / land document',
  'Site coordinates or plot number',
  'Existing drawings (if any)',
  'Commercial registration (companies)',
  'Authorization letter',
];

// ============================================================
// Module B1 — client records (leads and clients share one table)
// ============================================================

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'CLIENT-2026-0001',
    name: 'Skyline Developers',
    type: 'Company',
    contact: 'John Doe',
    email: 'john@skyline.com',
    phone: '0551234567',
    companyName: 'Skyline Developers',
    status: 'Client',
    channel: 'Referral',
    priority: 'High',
    isVip: true,
    owner: MOCK_USERS[6],
    createdAt: '2024-09-12',
    convertedAt: '2024-10-01',
    lastInteractionAt: '2026-07-28',
    lifetimeValue: 2450000,
    city: 'Riyadh',
    district: 'Al Olaya',
    region: 'Riyadh',
    interestedServices: ['Architectural Design', 'Structural Engineering', 'Site Supervision'],
    commercialRegistration: '1010234567',
    taxId: '300123456700003',
    referredBy: 'Mansour Trading',
    referrerPhone: '0509988776',
    statusHistory: [
      { id: 'sh1', to: 'New Lead', date: '2024-09-12', user: MOCK_USERS[6] },
      { id: 'sh2', from: 'New Lead', to: 'Contacted', date: '2024-09-13', user: MOCK_USERS[6] },
      { id: 'sh3', from: 'Contacted', to: 'Qualified', date: '2024-09-20', user: MOCK_USERS[5] },
      { id: 'sh4', from: 'Qualified', to: 'Client', date: '2024-10-01', user: MOCK_USERS[5] },
    ],
    interactions: [
      { id: 'in1', clientId: 'CLIENT-2026-0001', type: 'Meeting', direction: 'Outbound', subject: 'Phase 2 kickoff discussion', summary: 'Walked through the villa complex extension. Client wants a quote for the second plot.', occurredAt: '2026-07-28T10:00:00', user: MOCK_USERS[6], outcome: 'Requested a price offer', nextAction: 'Open opportunity', followUpDate: '2026-08-04' },
      { id: 'in2', clientId: 'CLIENT-2026-0001', type: 'Call', direction: 'Inbound', subject: 'Progress check on Sunset Villa', occurredAt: '2026-06-14T09:20:00', user: MOCK_USERS[0] },
    ],
    documents: [
      { id: 'cd1', name: 'CR_Skyline.pdf', category: 'Commercial registration', fileType: 'pdf', size: '820 KB', uploadedBy: MOCK_USERS[6], uploadDate: '2024-09-20' },
      { id: 'cd2', name: 'Plot_Deed_412.pdf', category: 'Title deed', fileType: 'pdf', size: '1.4 MB', uploadedBy: MOCK_USERS[6], uploadDate: '2026-07-29' },
    ],
  },
  {
    id: 'CLIENT-2026-0002',
    name: 'Sarah Connor',
    type: 'Individual',
    contact: 'Sarah Connor',
    email: 'sarah@gmail.com',
    phone: '0567778899',
    status: 'Client',
    channel: 'Website',
    priority: 'Medium',
    owner: MOCK_USERS[6],
    createdAt: '2025-02-03',
    convertedAt: '2025-02-25',
    lastInteractionAt: '2026-05-11',
    lifetimeValue: 380000,
    city: 'Jeddah',
    region: 'Makkah',
    interestedServices: ['Architectural Design'],
    statusHistory: [
      { id: 'sh5', to: 'New Lead', date: '2025-02-03', user: MOCK_USERS[6] },
      { id: 'sh6', from: 'New Lead', to: 'Contacted', date: '2025-02-05', user: MOCK_USERS[6] },
      { id: 'sh7', from: 'Contacted', to: 'Qualified', date: '2025-02-18', user: MOCK_USERS[6] },
      { id: 'sh8', from: 'Qualified', to: 'Client', date: '2025-02-25', user: MOCK_USERS[5] },
    ],
    interactions: [
      { id: 'in3', clientId: 'CLIENT-2026-0002', type: 'Email', direction: 'Outbound', subject: 'Final drawings delivered', occurredAt: '2026-05-11T13:00:00', user: MOCK_USERS[1] },
    ],
    documents: [],
  },
  {
    id: 'CLIENT-2026-0003',
    name: 'Al Nakheel Contracting',
    type: 'Company',
    contact: 'Faisal Al Otaibi',
    email: 'faisal@nakheel-co.sa',
    phone: '0533221100',
    companyName: 'Al Nakheel Contracting',
    status: 'New Lead',
    channel: 'Google Maps',
    priority: 'Urgent',
    owner: MOCK_USERS[6],
    createdAt: '2026-08-01',
    lifetimeValue: 0,
    slaStatus: 'Due Soon',
    slaDueAt: '2026-08-02T17:00:00',
    city: 'Dammam',
    region: 'Eastern Province',
    interestedServices: ['Site Supervision', 'Safety Consultation'],
    estimatedBudget: 600000,
    mapsLink: 'https://maps.google.com/?cid=884412',
    statusHistory: [
      { id: 'sh9', to: 'New Lead', date: '2026-08-01', user: MOCK_USERS[6] },
    ],
    interactions: [],
    documents: [],
  },
  {
    id: 'CLIENT-2026-0004',
    name: 'Reem Al Harbi',
    type: 'Individual',
    contact: 'Reem Al Harbi',
    email: 'reem.h@outlook.com',
    phone: '0544001122',
    status: 'Contacted',
    channel: 'Social Media',
    priority: 'Medium',
    owner: MOCK_USERS[6],
    createdAt: '2026-07-26',
    lastInteractionAt: '2026-07-27',
    lifetimeValue: 0,
    slaStatus: 'On Time',
    slaDueAt: '2026-08-06T12:00:00',
    firstResponseAt: '2026-07-27T09:40:00',
    city: 'Riyadh',
    district: 'Al Narjis',
    region: 'Riyadh',
    interestedServices: ['Architectural Design', 'Permit Management'],
    estimatedBudget: 180000,
    socialPlatform: 'Instagram',
    socialProfile: '@reem.builds',
    statusHistory: [
      { id: 'sh10', to: 'New Lead', date: '2026-07-26', user: MOCK_USERS[6] },
      { id: 'sh11', from: 'New Lead', to: 'Contacted', date: '2026-07-27', user: MOCK_USERS[6] },
    ],
    interactions: [
      { id: 'in4', clientId: 'CLIENT-2026-0004', type: 'WhatsApp', direction: 'Outbound', subject: 'First contact', summary: 'Sent the service list and asked for the plot size.', occurredAt: '2026-07-27T09:40:00', user: MOCK_USERS[6], nextAction: 'Collect deed copy', followUpDate: '2026-08-03' },
    ],
    documents: [],
  },
  {
    id: 'CLIENT-2026-0005',
    name: 'Ministry of Housing — Tender 4471',
    type: 'Company',
    contact: 'Procurement Desk',
    email: 'tenders@housing.gov.sa',
    phone: '0112223344',
    companyName: 'Ministry of Housing',
    status: 'Qualified',
    channel: 'Government Tender',
    priority: 'High',
    owner: MOCK_USERS[5],
    createdAt: '2026-07-20',
    lastInteractionAt: '2026-07-30',
    lifetimeValue: 0,
    slaStatus: 'On Time',
    city: 'Riyadh',
    region: 'Riyadh',
    interestedServices: ['Architectural Design', 'Structural Engineering', 'MEP Design'],
    estimatedBudget: 4200000,
    tenderPlatform: 'Etimad',
    tenderNumber: 'ETD-2026-4471',
    tenderDeadline: '2026-08-20',
    statusHistory: [
      { id: 'sh12', to: 'New Lead', date: '2026-07-20', user: MOCK_USERS[5] },
      { id: 'sh13', from: 'New Lead', to: 'Contacted', date: '2026-07-22', user: MOCK_USERS[5] },
      { id: 'sh14', from: 'Contacted', to: 'Qualified', date: '2026-07-30', user: MOCK_USERS[5], reason: 'Technical review cleared — we can bid' },
    ],
    interactions: [
      { id: 'in5', clientId: 'CLIENT-2026-0005', type: 'Note', direction: 'Inbound', subject: 'Tender booklet reviewed', summary: 'Scope covers three districts. Technical head approved participation.', occurredAt: '2026-07-30T15:00:00', user: MOCK_USERS[1] },
    ],
    documents: [
      { id: 'cd3', name: 'Tender_Booklet_4471.pdf', category: 'Tender documents', fileType: 'pdf', size: '6.2 MB', uploadedBy: MOCK_USERS[5], uploadDate: '2026-07-21', required: true },
    ],
  },
  {
    id: 'CLIENT-2026-0006',
    name: 'Bilal Motors',
    type: 'Company',
    contact: 'Bilal Ahmed',
    email: 'bilal@bilalmotors.sa',
    phone: '0501119988',
    companyName: 'Bilal Motors',
    status: 'Dormant',
    channel: 'Walk-in',
    priority: 'Low',
    owner: MOCK_USERS[6],
    createdAt: '2024-04-18',
    convertedAt: '2024-05-06',
    lastInteractionAt: '2025-09-15',
    lifetimeValue: 145000,
    city: 'Riyadh',
    region: 'Riyadh',
    interestedServices: ['Safety Consultation'],
    notes: 'No activity for 10 months — candidate for a reactivation campaign.',
    statusHistory: [
      { id: 'sh15', to: 'New Lead', date: '2024-04-18', user: MOCK_USERS[6] },
      { id: 'sh16', from: 'New Lead', to: 'Client', date: '2024-05-06', user: MOCK_USERS[5] },
      { id: 'sh17', from: 'Client', to: 'Dormant', date: '2026-07-15', user: CURRENT_USER, reason: 'No activity for 10 months' },
    ],
    interactions: [],
    documents: [],
  },
  {
    id: 'CLIENT-2026-0007',
    name: 'Tariq Enterprises',
    type: 'Company',
    contact: 'Tariq Salem',
    email: 'tariq@tariq-ent.com',
    phone: '0555550001',
    companyName: 'Tariq Enterprises',
    status: 'Disqualified',
    channel: 'AI Chatbot',
    priority: 'Low',
    owner: MOCK_USERS[6],
    createdAt: '2026-06-02',
    lastInteractionAt: '2026-06-10',
    lifetimeValue: 0,
    disqualifyReason: 'Outside coverage area',
    city: 'Sakaka',
    region: 'Al-Jouf',
    statusHistory: [
      { id: 'sh18', to: 'New Lead', date: '2026-06-02', user: MOCK_USERS[6] },
      { id: 'sh19', from: 'New Lead', to: 'Contacted', date: '2026-06-04', user: MOCK_USERS[6] },
      { id: 'sh20', from: 'Contacted', to: 'Disqualified', date: '2026-06-10', user: MOCK_USERS[5], reason: 'Outside coverage area — no team in Al-Jouf' },
    ],
    interactions: [],
    documents: [],
  },
  {
    id: 'CLIENT-2026-0008',
    name: 'Green Oasis Resorts',
    type: 'Company',
    contact: 'Hanan Yousef',
    email: 'hanan@greenoasis.sa',
    phone: '0566004411',
    companyName: 'Green Oasis Resorts',
    status: 'New Lead',
    channel: 'Website',
    priority: 'High',
    owner: MOCK_USERS[6],
    createdAt: '2026-07-31',
    lifetimeValue: 0,
    slaStatus: 'Overdue',
    slaDueAt: '2026-08-01T10:00:00',
    city: 'Abha',
    region: 'Asir',
    interestedServices: ['Architectural Design', 'Surveying'],
    estimatedBudget: 950000,
    statusHistory: [
      { id: 'sh21', to: 'New Lead', date: '2026-07-31', user: MOCK_USERS[6] },
    ],
    interactions: [],
    documents: [],
  },
];

// ============================================================
// Module B2 — opportunities / quote requests
// ============================================================

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-2026-0012',
    clientId: 'CLIENT-2026-0001',
    clientName: 'Skyline Developers',
    title: 'Sunset Villa Complex — Phase 2',
    status: 'RFQ Raised',
    priority: 'High',
    services: ['Architectural Design', 'Structural Engineering', 'Site Supervision'],
    departments: ['Architecture', 'Civil'],
    scope: 'Extension of the existing villa complex onto the adjacent plot: 14 units, shared basement parking and a landscaped spine.',
    city: 'Riyadh',
    estimatedValue: 3100000,
    expectedDecisionDate: '2026-09-15',
    owner: MOCK_USERS[6],
    createdAt: '2026-07-29',
    reviewedBy: MOCK_USERS[5],
    reviewedAt: '2026-07-30',
    reviewNotes: 'Complete. Multi-department scope — routed to the project manager.',
    assignmentRoute: 'Project Manager',
    assignee: CURRENT_USER,
    assignedAt: '2026-07-30',
    rfqId: 'RFQ-2026-0031',
    rfqRaisedAt: '2026-07-30',
    documents: [
      { id: 'od1', name: 'Quote_Request_Signed.pdf', category: 'Signed quote request', fileType: 'pdf', size: '640 KB', uploadedBy: MOCK_USERS[6], uploadDate: '2026-07-29', required: true },
      { id: 'od2', name: 'Plot_Deed_412.pdf', category: 'Title deed / land document', fileType: 'pdf', size: '1.4 MB', uploadedBy: MOCK_USERS[6], uploadDate: '2026-07-29', required: true },
    ],
    history: [
      { id: 'oe1', action: 'Opportunity created', date: '2026-07-29', user: MOCK_USERS[6] },
      { id: 'oe2', action: 'Submitted for review', date: '2026-07-29', user: MOCK_USERS[6] },
      { id: 'oe3', action: 'Marked complete', date: '2026-07-30', user: MOCK_USERS[5] },
      { id: 'oe4', action: 'Assigned to project manager', date: '2026-07-30', user: MOCK_USERS[5], note: 'Alex Engineer' },
      { id: 'oe5', action: 'RFQ raised — RFQ-2026-0031', date: '2026-07-30', user: CURRENT_USER },
    ],
  },
  {
    id: 'OPP-2026-0013',
    clientId: 'CLIENT-2026-0005',
    clientName: 'Ministry of Housing — Tender 4471',
    title: 'Etimad 4471 — Housing districts design package',
    status: 'Under Review',
    priority: 'High',
    services: ['Architectural Design', 'Structural Engineering', 'MEP Design'],
    departments: ['Architecture', 'Civil', 'Modern'],
    scope: 'Full design package for three housing districts as specified in the Etimad tender booklet. Submission deadline 20 Aug 2026.',
    city: 'Riyadh',
    estimatedValue: 4200000,
    expectedDecisionDate: '2026-09-01',
    owner: MOCK_USERS[5],
    createdAt: '2026-07-31',
    documents: [
      { id: 'od3', name: 'Tender_Booklet_4471.pdf', category: 'Tender documents', fileType: 'pdf', size: '6.2 MB', uploadedBy: MOCK_USERS[5], uploadDate: '2026-07-31', required: true },
    ],
    history: [
      { id: 'oe6', action: 'Opportunity created', date: '2026-07-31', user: MOCK_USERS[5] },
      { id: 'oe7', action: 'Submitted for review', date: '2026-07-31', user: MOCK_USERS[5] },
    ],
  },
  {
    id: 'OPP-2026-0014',
    clientId: 'CLIENT-2026-0004',
    clientName: 'Reem Al Harbi',
    title: 'Al Narjis private villa — design and permit',
    status: 'Incomplete',
    priority: 'Medium',
    services: ['Architectural Design', 'Permit Management'],
    departments: ['Architecture', 'Khitbrah'],
    scope: 'Two-storey private villa, roughly 420 m². Client also wants the municipality permit handled end to end.',
    city: 'Riyadh',
    estimatedValue: 180000,
    owner: MOCK_USERS[6],
    createdAt: '2026-07-28',
    reviewedBy: MOCK_USERS[5],
    reviewedAt: '2026-07-29',
    reviewNotes: 'Cannot price without the deed and the plot coordinates.',
    missingItems: ['Title deed / land document', 'Site coordinates or plot number'],
    documents: [],
    history: [
      { id: 'oe8', action: 'Opportunity created', date: '2026-07-28', user: MOCK_USERS[6] },
      { id: 'oe9', action: 'Submitted for review', date: '2026-07-28', user: MOCK_USERS[6] },
      { id: 'oe10', action: 'Returned as incomplete', date: '2026-07-29', user: MOCK_USERS[5], note: 'Missing deed and plot coordinates' },
    ],
  },
  {
    id: 'OPP-2026-0015',
    clientId: 'CLIENT-2026-0003',
    clientName: 'Al Nakheel Contracting',
    title: 'Dammam warehouse — safety and supervision',
    status: 'Submitted',
    priority: 'Urgent',
    services: ['Safety Consultation'],
    departments: ['Safety'],
    scope: 'Civil defence compliance review and monthly site supervision for a 6,000 m² warehouse.',
    city: 'Dammam',
    estimatedValue: 600000,
    owner: MOCK_USERS[6],
    createdAt: '2026-08-01',
    documents: [
      { id: 'od4', name: 'Warehouse_Layout.dwg', category: 'Existing drawings (if any)', fileType: 'dwg', size: '3.1 MB', uploadedBy: MOCK_USERS[6], uploadDate: '2026-08-01' },
    ],
    history: [
      { id: 'oe11', action: 'Opportunity created', date: '2026-08-01', user: MOCK_USERS[6] },
      { id: 'oe12', action: 'Submitted for review', date: '2026-08-01', user: MOCK_USERS[6] },
    ],
  },
  {
    id: 'OPP-2026-0009',
    clientId: 'CLIENT-2026-0001',
    clientName: 'Skyline Developers',
    title: 'Sunset Villa Complex — Phase 1',
    status: 'RFQ Raised',
    priority: 'High',
    services: ['Architectural Design', 'Structural Engineering'],
    departments: ['Architecture', 'Civil'],
    scope: 'Design and structural package for the first 12 villas plus the site entrance.',
    city: 'Riyadh',
    estimatedValue: 2450000,
    owner: MOCK_USERS[6],
    createdAt: '2024-09-25',
    reviewedBy: MOCK_USERS[5],
    reviewedAt: '2024-09-26',
    assignmentRoute: 'Project Manager',
    assignee: CURRENT_USER,
    assignedAt: '2024-09-26',
    rfqId: 'RFQ-2026-0028',
    rfqRaisedAt: '2024-09-26',
    documents: [],
    history: [
      { id: 'oe13', action: 'Opportunity created', date: '2024-09-25', user: MOCK_USERS[6] },
      { id: 'oe14', action: 'RFQ raised — RFQ-2026-0028', date: '2024-09-26', user: CURRENT_USER },
    ],
  },
  {
    id: 'OPP-2026-0010',
    clientId: 'CLIENT-2026-0002',
    clientName: 'Sarah Connor',
    title: 'Jeddah rooftop extension',
    status: 'RFQ Raised',
    priority: 'Medium',
    services: ['Architectural Design'],
    departments: ['Architecture'],
    scope: 'Rooftop extension of about 90 m² over an existing two-storey house, including a shaded terrace.',
    city: 'Jeddah',
    estimatedValue: 220000,
    owner: MOCK_USERS[6],
    createdAt: '2026-07-30',
    reviewedBy: MOCK_USERS[5],
    reviewedAt: '2026-07-31',
    assignmentRoute: 'Department Head',
    assignee: MOCK_USERS[1],
    assignedAt: '2026-07-31',
    rfqId: 'RFQ-2026-0029',
    rfqRaisedAt: '2026-07-31',
    documents: [],
    history: [
      { id: 'oe15', action: 'Opportunity created', date: '2026-07-30', user: MOCK_USERS[6] },
      { id: 'oe16', action: 'RFQ raised — RFQ-2026-0029', date: '2026-07-31', user: MOCK_USERS[5] },
    ],
  },
  {
    id: 'OPP-2026-0011',
    clientId: 'CLIENT-2026-0001',
    clientName: 'Skyline Developers',
    title: 'Skyline head office fit-out',
    status: 'RFQ Raised',
    priority: 'High',
    services: ['Architectural Design', 'MEP Design'],
    departments: ['Architecture', 'Modern'],
    scope: 'Interior fit-out of two floors, 1,800 m², including full MEP redesign and a server room.',
    city: 'Riyadh',
    estimatedValue: 890000,
    owner: MOCK_USERS[6],
    createdAt: '2026-07-24',
    reviewedBy: MOCK_USERS[5],
    reviewedAt: '2026-07-25',
    assignmentRoute: 'Project Manager',
    assignee: CURRENT_USER,
    assignedAt: '2026-07-25',
    rfqId: 'RFQ-2026-0030',
    rfqRaisedAt: '2026-07-25',
    documents: [],
    history: [
      { id: 'oe17', action: 'Opportunity created', date: '2026-07-24', user: MOCK_USERS[6] },
      { id: 'oe18', action: 'RFQ raised — RFQ-2026-0030', date: '2026-07-25', user: CURRENT_USER },
    ],
  },
];

// ============================================================
// Modules B3 / B4 — offer settings (module 12 will make these editable)
// ============================================================

export const VAT_RATE = 15;

export const BANK_ACCOUNTS = [
  'Al Rajhi Bank — SA03 8000 0000 6080 1016 7519',
  'Saudi National Bank — SA44 1000 0012 3456 7890 1234',
];

export const DEFAULT_GREETING =
  'Thank you for the opportunity to quote. Based on your requirements, we are pleased to submit the following proposal.';

export const DEFAULT_CONCLUSION =
  'We look forward to working with you. This offer is valid for 30 days from the issue date. For any clarification, please contact the assigned account manager.';

export const RFQ_REJECT_REASONS: RfqRejectType[] = ['Wrong department', 'Extra documents needed', 'Other'];

export const LOSS_REASONS = [
  'Price too high',
  'Lost to competitor',
  'Scope mismatch',
  'Budget unavailable',
  'No response from client',
  'Client cancelled the project',
  'Other',
];

export const DEFAULT_INSTALLMENTS: Omit<Installment, 'id'>[] = [
  { label: 'On signing', percentage: 30, rule: 'On signing' },
  { label: 'On design submission', percentage: 40, rule: 'On stage completion' },
  { label: 'On final delivery', percentage: 30, rule: 'On stage completion' },
];

/** Default approval chain — CFO first, then the general manager. */
export const APPROVAL_CHAIN: { tier: number; approver: User }[] = [
  { tier: 1, approver: MOCK_USERS[7] },
  { tier: 2, approver: MOCK_USERS[8] },
];

// ============================================================
// Module B3 — RFQs
// ============================================================

export const MOCK_RFQS: Rfq[] = [
  {
    id: 'RFQ-2026-0028',
    opportunityId: 'OPP-2026-0009',
    clientId: 'CLIENT-2026-0001',
    clientName: 'Skyline Developers',
    title: 'Sunset Villa Complex — Phase 1',
    scope: 'Design and structural package for the first 12 villas plus the site entrance.',
    services: ['Architectural Design', 'Structural Engineering'],
    departments: ['Architecture', 'Civil'],
    priority: 'High',
    status: 'Quoted',
    owner: MOCK_USERS[6],
    receivedAt: '2024-09-26',
    assignments: [
      { id: 'ra1', department: 'Architecture', assignee: MOCK_USERS[1], isLead: true, status: 'Submitted' },
      { id: 'ra2', department: 'Civil', assignee: MOCK_USERS[2], isLead: false, status: 'Submitted' },
    ],
    acceptedBy: MOCK_USERS[1],
    acceptedAt: '2024-09-26',
    approvals: [
      { id: 'ap1', tier: 1, approver: MOCK_USERS[7], status: 'Approved', decidedAt: '2024-09-28' },
      { id: 'ap2', tier: 2, approver: MOCK_USERS[8], status: 'Approved', decidedAt: '2024-09-29' },
    ],
    sentForApprovalAt: '2024-09-28',
    approvedAt: '2024-09-29',
    quotationId: 'QUO-2026-0020',
    history: [
      { id: 're1', action: 'RFQ received from sales', date: '2024-09-26', user: MOCK_USERS[6] },
      { id: 're2', action: 'Accepted by department', date: '2024-09-26', user: MOCK_USERS[1] },
      { id: 're3', action: 'Offer approved', date: '2024-09-29', user: MOCK_USERS[8] },
      { id: 're4', action: 'Quotation issued — QUO-2026-0020', date: '2024-09-29', user: MOCK_USERS[1] },
    ],
  },
  {
    id: 'RFQ-2026-0029',
    opportunityId: 'OPP-2026-0010',
    clientId: 'CLIENT-2026-0002',
    clientName: 'Sarah Connor',
    title: 'Jeddah rooftop extension',
    scope: 'Rooftop extension of about 90 m² over an existing two-storey house, including a shaded terrace.',
    services: ['Architectural Design'],
    departments: ['Architecture'],
    priority: 'Medium',
    status: 'Received',
    owner: MOCK_USERS[6],
    receivedAt: '2026-07-31',
    assignments: [
      { id: 'ra3', department: 'Architecture', assignee: MOCK_USERS[1], isLead: true, status: 'Not Started' },
    ],
    approvals: [],
    history: [
      { id: 're5', action: 'RFQ received from sales', date: '2026-07-31', user: MOCK_USERS[5] },
    ],
  },
  {
    id: 'RFQ-2026-0030',
    opportunityId: 'OPP-2026-0011',
    clientId: 'CLIENT-2026-0001',
    clientName: 'Skyline Developers',
    title: 'Skyline head office fit-out',
    scope: 'Interior fit-out of two floors, 1,800 m², including full MEP redesign and a server room.',
    services: ['Architectural Design', 'MEP Design'],
    departments: ['Architecture', 'Modern'],
    priority: 'High',
    status: 'Pricing',
    owner: MOCK_USERS[6],
    receivedAt: '2026-07-25',
    assignments: [
      { id: 'ra4', department: 'Architecture', assignee: MOCK_USERS[1], isLead: true, status: 'In Progress' },
      { id: 'ra5', department: 'Modern', assignee: CURRENT_USER, isLead: false, status: 'Submitted' },
    ],
    acceptedBy: MOCK_USERS[1],
    acceptedAt: '2026-07-25',
    approvals: [],
    history: [
      { id: 're6', action: 'RFQ received from sales', date: '2026-07-25', user: CURRENT_USER },
      { id: 're7', action: 'Accepted by department', date: '2026-07-25', user: MOCK_USERS[1] },
      { id: 're8', action: 'Pricing started', date: '2026-07-26', user: MOCK_USERS[1] },
    ],
  },
  {
    id: 'RFQ-2026-0031',
    opportunityId: 'OPP-2026-0012',
    clientId: 'CLIENT-2026-0001',
    clientName: 'Skyline Developers',
    title: 'Sunset Villa Complex — Phase 2',
    scope: 'Extension of the existing villa complex onto the adjacent plot: 14 units, shared basement parking and a landscaped spine.',
    services: ['Architectural Design', 'Structural Engineering', 'Site Supervision'],
    departments: ['Architecture', 'Civil'],
    priority: 'High',
    status: 'Accepted',
    owner: MOCK_USERS[6],
    receivedAt: '2026-07-30',
    assignments: [
      { id: 'ra6', department: 'Architecture', assignee: MOCK_USERS[1], isLead: true, status: 'Not Started' },
      { id: 'ra7', department: 'Civil', assignee: MOCK_USERS[2], isLead: false, status: 'Not Started' },
    ],
    acceptedBy: MOCK_USERS[1],
    acceptedAt: '2026-07-31',
    approvals: [],
    history: [
      { id: 're9', action: 'RFQ received from sales', date: '2026-07-30', user: CURRENT_USER },
      { id: 're10', action: 'Accepted by department', date: '2026-07-31', user: MOCK_USERS[1] },
    ],
  },
];

// ============================================================
// Module B4 — quotations
// ============================================================

export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'QUO-2026-0020',
    version: 2,
    rfqId: 'RFQ-2026-0028',
    opportunityId: 'OPP-2026-0009',
    clientId: 'CLIENT-2026-0001',
    clientName: 'Skyline Developers',
    title: 'Sunset Villa Complex — Phase 1',
    status: 'Won',
    owner: MOCK_USERS[6],
    issueDate: '2024-09-29',
    validUntil: '2024-10-29',
    deliveryTimeline: '8 months from contract signature',
    greeting: DEFAULT_GREETING,
    services: ['Architectural Design', 'Structural Engineering'],
    sections: [
      {
        id: 'qs1',
        department: 'Architecture',
        pricer: MOCK_USERS[1],
        isLead: true,
        scopeText: 'Concept design, design development and full architectural drawing set for 12 villas, plus the entrance gate and guard house.',
        status: 'Submitted',
        items: [
          { id: 'qi1', description: 'Concept design — 12 villa typologies', quantity: 12, unit: 'unit', unitPrice: 45000 },
          { id: 'qi2', description: 'Entrance gate and guard house design', quantity: 1, unit: 'lump sum', unitPrice: 120000 },
        ],
      },
      {
        id: 'qs2',
        department: 'Civil',
        pricer: MOCK_USERS[2],
        isLead: false,
        scopeText: 'Structural analysis and detailed drawings for all villas and the shared retaining walls.',
        status: 'Submitted',
        items: [
          { id: 'qi3', description: 'Structural design — villas', quantity: 12, unit: 'unit', unitPrice: 95000 },
          { id: 'qi4', description: 'Retaining wall design', quantity: 1, unit: 'lump sum', unitPrice: 190000 },
        ],
      },
    ],
    installments: [
      { id: 'qp1', label: 'On signing', percentage: 30, rule: 'On signing' },
      { id: 'qp2', label: 'On design submission', percentage: 40, rule: 'On stage completion' },
      { id: 'qp3', label: 'On final delivery', percentage: 30, rule: 'On stage completion' },
    ],
    notes: 'Municipality fees are excluded and are paid directly by the client.',
    bankAccount: BANK_ACCOUNTS[0],
    conclusion: DEFAULT_CONCLUSION,
    discount: 0,
    vatRate: VAT_RATE,
    sentAt: '2024-09-29',
    wonAt: '2024-10-01',
    poId: 'PO-2026-0011',
    projectId: 'PRJ-2024-001',
    versionHistory: [
      { version: 1, date: '2024-09-29', user: MOCK_USERS[1], changeType: 'Initial', totalAmount: 2185000 },
      { version: 2, date: '2024-09-30', user: MOCK_USERS[1], changeType: 'Price', totalAmount: 2450000, note: 'Added retaining wall package after the site visit' },
    ],
    history: [
      { id: 'qe1', action: 'Quotation issued', date: '2024-09-29', user: MOCK_USERS[1] },
      { id: 'qe2', action: 'Sent to client', date: '2024-09-29', user: MOCK_USERS[6] },
      { id: 'qe3', action: 'Version 2 created — Price', date: '2024-09-30', user: MOCK_USERS[1] },
      { id: 'qe4', action: 'Marked WON — PO-2026-0011 generated', date: '2024-10-01', user: MOCK_USERS[5] },
    ],
  },
];

const MOCK_ACTIVITY: ActivityLog[] = [
  { id: 'a1', user: MOCK_USERS[0], action: 'updated status to', target: 'In Progress', timestamp: '2024-03-10T10:30:00', type: 'update' },
  { id: 'a2', user: MOCK_USERS[1], action: 'uploaded', target: 'Floor_Plans_v2.pdf', timestamp: '2024-03-09T14:15:00', type: 'upload' },
  { id: 'a3', user: MOCK_USERS[2], action: 'completed task', target: 'Structural Analysis', timestamp: '2024-03-08T09:00:00', type: 'update' },
  { id: 'a4', user: MOCK_USERS[0], action: 'created project', target: 'Sunset Villa Complex', timestamp: '2023-11-01T08:00:00', type: 'create' },
];

const MOCK_DOCS: ProjectDocument[] = [
  { 
    id: 'f1', name: 'Architectural Drawings', type: 'folder', uploadedBy: MOCK_USERS[1], uploadDate: '2023-11-15', version: 1, 
    children: [
      { id: 'd1', name: 'Floor_Plans_v2.pdf', type: 'file', fileType: 'pdf', size: '4.5 MB', uploadedBy: MOCK_USERS[1], uploadDate: '2023-11-20', version: 2 },
      { id: 'd2', name: 'Elevations.dwg', type: 'file', fileType: 'dwg', size: '12 MB', uploadedBy: MOCK_USERS[1], uploadDate: '2023-11-18', version: 1 },
    ]
  },
  { id: 'f2', name: 'Contracts', type: 'folder', uploadedBy: MOCK_USERS[0], uploadDate: '2023-11-01', version: 1, children: [] },
  { id: 'd3', name: 'Permit_Approval.pdf', type: 'file', fileType: 'pdf', size: '1.2 MB', uploadedBy: MOCK_USERS[0], uploadDate: '2024-01-15', version: 1 },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-2024-001',
    name: 'Sunset Villa Complex',
    client: MOCK_CLIENTS[0],
    status: 'In Progress',
    progress: 65,
    manager: CURRENT_USER,
    departments: ['Architecture', 'Civil'],
    startDate: '2023-11-01',
    endDate: '2024-06-30',
    type: 'Residential',
    tasksCompleted: 15,
    tasksTotal: 24,
    authorityStatus: 'Green',
    activityLog: MOCK_ACTIVITY,
    documents: MOCK_DOCS,
    phases: [
      {
        id: 'ph1', name: 'Design Development', order: 1, tasks: [
          { id: 't1', name: 'Concept Design', phaseId: 'ph1', status: 'Completed', duration: 10, type: 'Internal', dueDate: '2023-11-15', startDate: '2023-11-05', dependencies: [], assignee: MOCK_USERS[1], priority: 'High' },
          { id: 't2', name: 'Structural Analysis', phaseId: 'ph1', status: 'Completed', duration: 15, type: 'Internal', dueDate: '2023-12-01', startDate: '2023-11-16', dependencies: ['t1'], assignee: MOCK_USERS[2], priority: 'Medium' }
        ]
      },
      {
        id: 'ph2', name: 'Authority Approval', order: 2, tasks: [
          { id: 't3', name: 'Municipality Submission', phaseId: 'ph2', status: 'In Progress', duration: 30, type: 'External', dueDate: '2024-01-15', startDate: '2023-12-15', dependencies: ['t2'], assignee: CURRENT_USER, priority: 'High' }
        ]
      }
    ]
  },
  {
    id: 'PRJ-2024-002',
    name: 'Downtown Commercial Hub',
    client: MOCK_CLIENTS[1],
    status: 'On Hold',
    progress: 25,
    manager: MOCK_USERS[1],
    departments: ['Architecture', 'Safety', 'Civil'],
    startDate: '2024-01-10',
    endDate: '2024-09-01',
    type: 'Commercial',
    tasksCompleted: 4,
    tasksTotal: 18,
    authorityStatus: 'Red',
    activityLog: [],
    documents: [],
    phases: [
       {
        id: 'ph3', name: 'Initiation', order: 1, tasks: [
          { id: 't4', name: 'Site Survey', phaseId: 'ph3', status: 'Completed', duration: 5, type: 'Internal', dueDate: '2024-01-15', startDate: '2024-01-10', dependencies: [], assignee: MOCK_USERS[2], priority: 'Low' }
        ]
      },
      {
        id: 'ph4', name: 'Schematic Design', order: 2, tasks: [
          { id: 't5', name: 'Floor Plans', phaseId: 'ph4', status: 'Blocked', duration: 10, type: 'Internal', dueDate: '2024-02-01', startDate: '2024-01-20', dependencies: ['t4'], assignee: MOCK_USERS[1], priority: 'High' },
          { id: 't5b', name: 'Review with Client', phaseId: 'ph4', status: 'Not Started', duration: 2, type: 'Internal', dueDate: '2024-02-05', startDate: '2024-02-03', dependencies: ['t5'], assignee: CURRENT_USER, priority: 'Medium' }
        ]
      }
    ]
  },
  {
    id: 'PRJ-2024-003',
    name: 'Industrial Warehouse Beta',
    client: MOCK_CLIENTS[0],
    status: 'Not Started',
    progress: 0,
    manager: CURRENT_USER,
    departments: ['Civil', 'Safety'],
    startDate: '2024-03-01',
    endDate: '2024-12-01',
    type: 'Industrial',
    tasksCompleted: 0,
    tasksTotal: 12,
    authorityStatus: 'Green',
    phases: []
  },
  {
    id: 'PRJ-2024-004',
    name: 'Al-Riyadh Community Center',
    client: MOCK_CLIENTS[1],
    status: 'In Progress',
    progress: 45,
    manager: MOCK_USERS[2],
    departments: ['Architecture', 'Khitbrah', 'Modern'],
    startDate: '2023-12-01',
    endDate: '2024-10-15',
    type: 'Public',
    tasksCompleted: 8,
    tasksTotal: 20,
    authorityStatus: 'Yellow',
    phases: []
  },
  {
    id: 'PRJ-2024-005',
    name: 'Jeddah Seafront Survey',
    client: MOCK_CLIENTS[0],
    status: 'Completed',
    progress: 100,
    manager: MOCK_USERS[2],
    departments: ['Surveying'],
    startDate: '2023-01-01',
    endDate: '2023-06-01',
    type: 'Infrastructure',
    tasksCompleted: 15,
    tasksTotal: 15,
    authorityStatus: 'Green',
    phases: []
  }
];

export const MOCK_AUTHORITY_APPS: AuthorityApplication[] = [
  {
    id: 'APP-001',
    trackingId: 'MUN-234-998',
    authority: 'Municipality',
    type: 'Building Permit',
    projectId: 'PRJ-2024-001',
    projectName: 'Sunset Villa Complex',
    linkedTaskId: 't3',
    linkedTaskName: 'Municipality Submission',
    submissionDate: '2023-12-20',
    expectedResponseDate: '2024-01-05',
    status: 'Approved',
    daysWaiting: 0,
    lastUpdate: '2024-01-02',
    documents: [
      { id: 'd1', name: 'Application_Form.pdf', type: 'submission', date: '2023-12-20' },
      { id: 'd2', name: 'Permit_Certificate.pdf', type: 'response', date: '2024-01-02' }
    ],
    history: [
      { date: '2023-12-20', status: 'Pending', note: 'Application submitted', user: 'Alex Engineer' },
      { date: '2024-01-02', status: 'Approved', note: 'Permit issued', user: 'System' }
    ]
  },
  {
    id: 'APP-002',
    trackingId: 'CIV-555-123',
    authority: 'Civil Defense',
    type: 'Safety Certificate',
    projectId: 'PRJ-2024-001',
    projectName: 'Sunset Villa Complex',
    submissionDate: '2024-01-10',
    expectedResponseDate: '2024-02-10',
    status: 'Pending',
    daysWaiting: 12,
    lastUpdate: '2024-01-10',
    documents: [
      { id: 'd3', name: 'Safety_Plan.pdf', type: 'submission', date: '2024-01-10' }
    ],
    history: [
      { date: '2024-01-10', status: 'Pending', note: 'Initial submission', user: 'Alex Engineer' }
    ]
  },
  {
    id: 'APP-003',
    trackingId: 'ELE-999-000',
    authority: 'Electricity Company',
    type: 'Connection Request',
    projectId: 'PRJ-2024-002',
    projectName: 'Downtown Commercial Hub',
    submissionDate: '2024-02-01',
    expectedResponseDate: '2024-02-15',
    status: 'Info Required',
    daysWaiting: 5,
    lastUpdate: '2024-02-05',
    documents: [
      { id: 'd4', name: 'Load_Calculation.xls', type: 'submission', date: '2024-02-01' }
    ],
    history: [
      { date: '2024-02-01', status: 'Pending', note: 'Submitted via portal', user: 'Jane Architect' },
      { date: '2024-02-05', status: 'Info Required', note: 'Site plan update requested', user: 'System' }
    ],
    notes: 'Need to revise site plan boundaries.'
  },
  {
    id: 'APP-004',
    trackingId: 'WAT-111-222',
    authority: 'Water Authority',
    type: 'Infrastructure Map',
    projectId: 'PRJ-2024-002',
    projectName: 'Downtown Commercial Hub',
    submissionDate: '2024-01-15',
    expectedResponseDate: '2024-01-25',
    status: 'Rejected',
    daysWaiting: 0,
    lastUpdate: '2024-01-26',
    documents: [],
    history: [
       { date: '2024-01-15', status: 'Pending', note: 'Submitted', user: 'Bob Builder' },
       { date: '2024-01-26', status: 'Rejected', note: 'Invalid pipe specs', user: 'System' }
    ],
    notes: 'Re-submit with new specs next week.'
  }
];

// ------------------------------------
// ROLE PERMISSIONS & MOCK DATA
// ------------------------------------

export const PERMISSION_MATRIX: PermissionDefinition[] = [
  {
    category: 'projects',
    actions: [
      { key: 'view_projects', label: 'View Projects' },
      { key: 'create_projects', label: 'Create Projects' },
      { key: 'edit_projects', label: 'Edit Projects' },
      { key: 'delete_projects', label: 'Delete Projects' },
      { key: 'archive_projects', label: 'Archive Projects' },
    ]
  },
  {
    category: 'tasks',
    actions: [
      { key: 'view_tasks', label: 'View Tasks' },
      { key: 'create_tasks', label: 'Create Tasks' },
      { key: 'edit_tasks', label: 'Edit Tasks' },
      { key: 'delete_tasks', label: 'Delete Tasks' },
      { key: 'assign_tasks', label: 'Assign Tasks' },
      { key: 'change_status_tasks', label: 'Change Task Status' },
    ]
  },
  {
    category: 'documents',
    actions: [
      { key: 'view_docs', label: 'View Documents' },
      { key: 'upload_docs', label: 'Upload Documents' },
      { key: 'download_docs', label: 'Download Documents' },
      { key: 'delete_docs', label: 'Delete Documents' },
      { key: 'manage_versions', label: 'Manage Versions' },
    ]
  },
  {
    category: 'team',
    actions: [
      { key: 'view_team', label: 'View Team' },
      { key: 'add_team', label: 'Add Members' },
      { key: 'remove_team', label: 'Remove Members' },
      { key: 'manage_assignments', label: 'Manage Assignments' },
    ]
  },
  {
    category: 'authority',
    actions: [
      { key: 'view_auth', label: 'View Applications' },
      { key: 'create_auth', label: 'Create Application' },
      { key: 'update_auth', label: 'Update Application' },
      { key: 'delete_auth', label: 'Delete Application' },
    ]
  },
  {
    category: 'reports',
    actions: [
      { key: 'view_reports', label: 'View Reports' },
      { key: 'export_reports', label: 'Export Reports' },
      { key: 'create_custom_reports', label: 'Create Custom Reports' },
    ]
  },
  {
    category: 'admin',
    actions: [
      { key: 'manage_users', label: 'Manage Users' },
      { key: 'manage_roles', label: 'Manage Roles' },
      { key: 'manage_settings', label: 'Manage Settings' },
    ]
  }
];

export const MOCK_ROLES: Role[] = [
  {
    id: 'r_admin',
    name: 'Administrator',
    description: 'Full system access with all permissions enabled.',
    userCount: 2,
    isSystem: true,
    permissions: PERMISSION_MATRIX.flatMap(c => c.actions.map(a => a.key))
  },
  {
    id: 'r_pm',
    name: 'Project Manager',
    description: 'Can manage projects, tasks, and team assignments.',
    userCount: 5,
    isSystem: true,
    permissions: [
      'view_projects', 'create_projects', 'edit_projects', 'archive_projects',
      'view_tasks', 'create_tasks', 'edit_tasks', 'assign_tasks', 'change_status_tasks',
      'view_docs', 'upload_docs', 'download_docs', 'manage_versions',
      'view_team', 'manage_assignments',
      'view_auth', 'create_auth', 'update_auth',
      'view_reports', 'export_reports'
    ]
  },
  {
    id: 'r_head',
    name: 'Department Head',
    description: 'Oversees department resources and approves key phases.',
    userCount: 3,
    isSystem: true,
    permissions: [
      'view_projects', 'edit_projects',
      'view_tasks', 'change_status_tasks',
      'view_docs', 'download_docs',
      'view_team', 'manage_assignments',
      'view_reports', 'export_reports', 'create_custom_reports'
    ]
  },
  {
    id: 'r_employee',
    name: 'Employee',
    description: 'Standard access to view and update assigned tasks.',
    userCount: 24,
    isSystem: true,
    permissions: [
      'view_projects',
      'view_tasks', 'change_status_tasks',
      'view_docs', 'upload_docs', 'download_docs',
      'view_team'
    ]
  },
  {
    id: 'r_client',
    name: 'Client',
    description: 'Read-only access to specific project progress.',
    userCount: 8,
    isSystem: true,
    permissions: [
      'view_projects',
      'view_tasks',
      'view_docs', 'download_docs'
    ]
  }
];

export const MOCK_AUDIT_LOGS: RoleAuditLog[] = [
  { id: 'log1', user: 'Alex Engineer', action: 'Updated Role', details: 'Added "delete_docs" permission to Project Manager', timestamp: '2024-03-15T10:30:00' },
  { id: 'log2', user: 'Alex Engineer', action: 'Created Role', details: 'Created "Intern" role', timestamp: '2024-03-14T14:15:00' },
  { id: 'log3', user: 'System', action: 'Assigned Role', details: 'Assigned "Employee" role to Mohammed Draftsman', timestamp: '2024-03-10T09:00:00' },
];