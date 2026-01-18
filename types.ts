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

export interface Client {
  id: string;
  name: string;
  type: 'Individual' | 'Company';
  contact: string;
  email: string;
  phone?: string;
  companyName?: string;
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