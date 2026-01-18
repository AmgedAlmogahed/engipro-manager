import { Project, AuthorityApplication, User, Client, ActivityLog, ProjectDocument, Employee, DepartmentDetails, Role, PermissionDefinition, RoleAuditLog } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Engineer',
  role: 'Senior Project Manager',
  avatar: 'https://picsum.photos/100/100'
};

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Skyline Developers', type: 'Company', contact: 'John Doe', email: 'john@skyline.com' },
  { id: 'c2', name: 'Sarah Connor', type: 'Individual', contact: 'Sarah Connor', email: 'sarah@gmail.com' },
];

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Jane Architect', role: 'Lead Architect', avatar: 'https://picsum.photos/101/101' },
  { id: 'u3', name: 'Bob Builder', role: 'Civil Engineer', avatar: 'https://picsum.photos/102/102' },
  { id: 'u4', name: 'Ahmed Surveyor', role: 'Head of Surveying', avatar: 'https://picsum.photos/103/103' },
  { id: 'u5', name: 'Layla Safety', role: 'Safety Officer', avatar: 'https://picsum.photos/104/104' },
];

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