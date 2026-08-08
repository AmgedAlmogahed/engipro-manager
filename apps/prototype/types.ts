export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type Department = 'Architecture' | 'Civil' | 'Safety' | 'Surveying' | 'Modern' | 'Khitbrah';
export type TaskType = 'Internal' | 'External';
export type AuthorityStatus = 'Pending' | 'Approved' | 'Rejected' | 'Info Required';
export type TrafficLightStatus = 'Green' | 'Yellow' | 'Red';
export type TaskPriority = 'Low' | 'Medium' | 'High';

// Wizard Specific Types
export type ServiceType = 'Architectural Design' | 'Structural Engineering' | 'MEP Design' | 'Safety Consultation' | 'Site Supervision' | 'Surveying' | 'Permit Management';
export type ProjectType = 'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure' | 'Interior Design' | 'Custom';
export type SubClientRole = 'Broker/Agent' | 'Contractor' | 'Developer' | 'Investor' | 'Other';

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Employee extends User {
  email: string;
  phone?: string;
  department: Department;
  activeProjects: number;
  openTasks: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  joinDate: string;
  utilization: number; // Percentage 0-100
}

export interface DepartmentDetails {
  id: string;
  name: Department;
  description: string;
  headOfDepartment: User;
  employeeCount: number;
  activeProjectCount: number;
}

export interface WorkloadBlock {
  id: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  color: string;
}

// ============================================================
// Module B1 — Client Record (one table, status lifecycle)
// A lead is a status value, not a separate entity.
// ============================================================

export type ClientStatus = 'New Lead' | 'Contacted' | 'Qualified' | 'Client' | 'Dormant' | 'Disqualified';
export type ClientChannel = 'Walk-in' | 'Referral' | 'Website' | 'Social Media' | 'Google Maps' | 'Government Tender' | 'AI Chatbot';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type SLAStatus = 'On Time' | 'Due Soon' | 'Overdue';
export type InteractionType = 'Call' | 'Meeting' | 'Email' | 'WhatsApp' | 'Site Visit' | 'Office Visit' | 'Note';
export type InteractionDirection = 'Inbound' | 'Outbound';

/** Statuses that put a record on the Leads page. Everything else lives on the Clients page. */
export const LEAD_STATUSES: ClientStatus[] = ['New Lead', 'Contacted', 'Qualified'];

export interface Interaction {
  id: string;
  clientId: string;
  opportunityId?: string;
  type: InteractionType;
  direction: InteractionDirection;
  subject: string;
  summary?: string;
  occurredAt: string;
  user: User;
  outcome?: string;
  nextAction?: string;
  followUpDate?: string;
}

export interface StatusChange {
  id: string;
  from?: ClientStatus;
  to: ClientStatus;
  date: string;
  user: User;
  reason?: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  category: string;
  fileType: 'pdf' | 'dwg' | 'img' | 'doc' | 'xls';
  size?: string;
  uploadedBy: User;
  uploadDate: string;
  required?: boolean;
}

export interface Client {
  id: string; // CLIENT-YYYY-XXXX
  name: string;
  type: 'Individual' | 'Company';
  contact: string;
  email: string;
  phone?: string;
  companyName?: string;

  // --- B1 lifecycle ---
  status: ClientStatus;
  channel: ClientChannel;
  priority: Priority;
  isVip?: boolean;
  owner: User;
  createdAt: string;
  convertedAt?: string;
  lastInteractionAt?: string;
  lifetimeValue: number;
  disqualifyReason?: string;

  // --- SLA (module 10) ---
  slaStatus?: SLAStatus;
  slaDueAt?: string;
  firstResponseAt?: string;

  // --- profile ---
  city?: string;
  district?: string;
  region?: string;
  interestedServices?: ServiceType[];
  estimatedBudget?: number;
  commercialRegistration?: string;
  taxId?: string;
  notes?: string;

  // --- channel-specific ---
  referredBy?: string;
  referrerPhone?: string;
  socialPlatform?: string;
  socialProfile?: string;
  mapsLink?: string;
  tenderPlatform?: 'Etimad' | 'Fursa';
  tenderNumber?: string;
  tenderDeadline?: string;

  // --- history (records are never deleted) ---
  statusHistory: StatusChange[];
  interactions: Interaction[];
  documents: ClientDocument[];
}

// ============================================================
// Module B2 — Opportunity & Quote Request
// ============================================================

export type OpportunityStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Incomplete'
  | 'Assigned'
  | 'RFQ Raised'
  | 'Cancelled';

/** One department → straight to the department head. Several → project manager builds the team. */
export type AssignmentRoute = 'Department Head' | 'Project Manager';

export interface OpportunityEvent {
  id: string;
  action: string;
  date: string;
  user: User;
  note?: string;
}

export interface Opportunity {
  id: string; // OPP-YYYY-XXXX
  clientId: string;
  clientName: string;
  title: string;
  status: OpportunityStatus;
  priority: Priority;
  services: ServiceType[];
  departments: Department[];
  scope: string;
  city?: string;
  estimatedValue?: number;
  expectedDecisionDate?: string;
  owner: User; // opportunity owner = future quotation owner
  createdAt: string;

  // --- sales manager review ---
  reviewedBy?: User;
  reviewedAt?: string;
  reviewNotes?: string;
  missingItems?: string[];

  // --- assignment ---
  assignmentRoute?: AssignmentRoute;
  assignee?: User;
  assignedAt?: string;

  // --- handover to B3 ---
  rfqId?: string; // RFQ-YYYY-XXXX
  rfqRaisedAt?: string;

  cancelReason?: string;
  documents: ClientDocument[];
  history: OpportunityEvent[];
}

/** Generic append-only timeline entry, shared by opportunities, RFQs and quotations. */
export type TimelineEvent = OpportunityEvent;

// ============================================================
// Module B3 — RFQ processing & price offer
// ============================================================

export type RfqStatus =
  | 'Received'
  | 'Accepted'
  | 'Rejected'
  | 'Pricing'
  | 'Offer Ready'
  | 'In Approval'
  | 'Approved'
  | 'Quoted'
  | 'Cancelled';

export type RfqRejectType = 'Wrong department' | 'Extra documents needed' | 'Other';
export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Submitted';

export interface RfqAssignment {
  id: string;
  department: Department;
  assignee: User;
  /** Exactly one lead per RFQ — the lead fills the offer, the others only their scope. */
  isLead: boolean;
  status: AssignmentStatus;
  notes?: string;
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Approval {
  id: string;
  tier: number;
  approver: User;
  status: ApprovalStatus;
  decidedAt?: string;
  comments?: string;
}

export interface Rfq {
  id: string; // RFQ-YYYY-XXXX
  opportunityId: string;
  clientId: string;
  clientName: string;
  title: string;
  scope: string;
  services: ServiceType[];
  departments: Department[];
  priority: Priority;
  status: RfqStatus;
  /** Sales-side owner — stays the quotation owner all the way to Won. */
  owner: User;
  receivedAt: string;

  assignments: RfqAssignment[];
  acceptedBy?: User;
  acceptedAt?: string;
  rejectType?: RfqRejectType;
  rejectReason?: string;
  rejectedAt?: string;

  approvals: Approval[];
  sentForApprovalAt?: string;
  approvedAt?: string;

  quotationId?: string; // QUO-YYYY-XXXX once the offer is issued
  history: TimelineEvent[];
}

// ============================================================
// Module B4 — quotation lifecycle
// ============================================================

export type QuotationStatus = 'Ready' | 'Sent' | 'Negotiation' | 'Won' | 'Lost';
export type QuoteChangeType = 'Initial' | 'Price' | 'Scope' | 'Timeline';
export type InstallmentRule = 'On signing' | 'On stage completion' | 'On date';

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

/** One block per department — the lead pricer compiles them into a single offer. */
export interface QuoteSection {
  id: string;
  department: Department;
  pricer?: User;
  isLead: boolean;
  scopeText: string;
  items: QuoteLineItem[];
  status: 'Draft' | 'Submitted';
}

export interface Installment {
  id: string;
  label: string;
  percentage: number;
  rule: InstallmentRule;
  note?: string;
}

export interface QuotationVersion {
  version: number;
  date: string;
  user: User;
  changeType: QuoteChangeType;
  totalAmount: number;
  note?: string;
}

export interface Quotation {
  id: string; // QUO-YYYY-XXXX
  version: number;
  rfqId: string;
  opportunityId: string;
  clientId: string;
  clientName: string;
  title: string;
  status: QuotationStatus;
  owner: User;
  issueDate: string;
  validUntil?: string;
  deliveryTimeline?: string;

  // --- offer contents (flowchart B3) ---
  greeting: string;
  services: ServiceType[];
  sections: QuoteSection[];
  installments: Installment[];
  notes: string;
  bankAccount: string;
  conclusion: string;

  discount: number;
  vatRate: number;

  sentAt?: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
  negotiationNote?: string;

  poId?: string; // PO-YYYY-XXXX once won
  projectId?: string;

  versionHistory: QuotationVersion[];
  history: TimelineEvent[];
}

export interface SubClient {
  id: string;
  clientId?: string; // If existing client
  name: string; // If new or display name
  role: SubClientRole;
  notes?: string;
}

export interface Task {
  id: string;
  name: string;
  phaseId: string;
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';
  assignee?: User;
  assigneeId?: string; // For wizard
  dueDate: string; // Calculated End Date
  startDate?: string; // Calculated Start Date
  duration: number; // Days
  type: TaskType;
  department?: Department;
  dependencies: string[]; // IDs of other tasks
  priority?: TaskPriority; // Added for My Tasks
}

export interface Phase {
  id: string;
  name: string;
  order: number;
  description?: string;
  tasks: Task[];
}

export interface ActivityLog {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: string;
  type: 'update' | 'create' | 'delete' | 'comment' | 'upload';
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'pdf' | 'dwg' | 'img' | 'doc' | 'xls';
  size?: string;
  uploadedBy: User;
  uploadDate: string;
  version: number;
  children?: ProjectDocument[]; // for folders
}

export interface Project {
  id: string;
  name: string;
  client: Client;
  status: ProjectStatus;
  progress: number;
  manager: User;
  departments: Department[];
  startDate: string;
  endDate: string;
  phases: Phase[];
  description?: string;
  type: string;
  tasksCompleted: number;
  tasksTotal: number;
  authorityStatus: TrafficLightStatus;
  activityLog?: ActivityLog[];
  documents?: ProjectDocument[];
}

export interface ProjectWizardState {
  // Step 1
  name: string;
  type: ProjectType;
  services: ServiceType[];
  departments: Department[];
  city: string;
  district: string;
  address: string;
  startDate: string;
  description: string;
  
  // Step 2
  clientId: string; // Existing client ID
  isNewClient: boolean;
  newClientData: {
    name: string;
    type: 'Individual' | 'Company';
    contact: string;
    email: string;
    phone: string;
    companyName: string;
  };
  subClients: SubClient[];
  managerId: string;
  teamMemberIds: string[]; // IDs of selected users

  // Step 3 & 4
  phases: Phase[];
}

export interface AuthorityStatusHistory {
  date: string;
  status: AuthorityStatus;
  note: string;
  user: string;
}

export interface AuthorityDocument {
  id: string;
  name: string;
  type: 'submission' | 'response' | 'other';
  date: string;
  url?: string;
}

export interface AuthorityApplication {
  id: string;
  trackingId: string;
  authority: string;
  type: string;
  projectId: string;
  projectName: string;
  linkedTaskId?: string;
  linkedTaskName?: string;
  submissionDate: string;
  expectedResponseDate?: string;
  status: AuthorityStatus;
  daysWaiting: number;
  lastUpdate: string;
  documents: AuthorityDocument[];
  history: AuthorityStatusHistory[];
  notes?: string;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: string;
  color: string;
}

// RBAC Types
export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean; // System roles cannot be deleted
  permissions: string[]; // Array of permission keys
}

export interface PermissionDefinition {
  category: string;
  actions: {
    key: string;
    label: string;
  }[];
}

export interface RoleAuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}