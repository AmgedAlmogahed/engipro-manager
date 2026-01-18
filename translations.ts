export const resources = {
  en: {
    projects: "Projects",
    totalProjects: "Total Projects",
    createProject: "Create Project",
    viewToggle: "View",
    filters: {
      status: "Status",
      department: "Department",
      manager: "Manager",
      date: "Date Range",
      client: "Client",
      searchPlaceholder: "Search ID, Name, Client...",
      all: "All",
      clear: "Clear All",
    },
    table: {
      id: "ID",
      name: "Project Name",
      client: "Client",
      type: "Type",
      departments: "Departments",
      manager: "Manager",
      dates: "Dates",
      progress: "Progress",
      status: "Status",
      tasks: "Tasks",
      authority: "Authority",
      actions: "Actions"
    },
    actions: {
      view: "View Project",
      edit: "Edit Project",
      gantt: "View Gantt Chart",
      team: "Manage Team",
      archive: "Archive/Delete",
      bulkExport: "Export Selected",
      bulkStatus: "Change Status",
      bulkAssign: "Assign Manager",
      duplicate: "Duplicate",
      viewProfile: "View Profile",
      delete: "Delete"
    },
    status: {
      notStarted: "Not Started",
      inProgress: "In Progress",
      onHold: "On Hold",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    common: {
      showing: "Showing",
      results: "results",
      previous: "Previous",
      next: "Next",
      of: "of",
      step: "Step",
      selected: "Selected",
      viewAll: "View All",
      today: "Today",
      tomorrow: "Tomorrow",
      welcome: "Welcome back",
      dashboardSubtitle: "Here's what's happening with your projects today.",
      list: "List",
      board: "Board",
      calendar: "Calendar",
      filter: "Filter",
      addTask: "Add Task",
      addMember: "Add Member",
      cancel: "Cancel",
      save: "Save",
      confirmDeleteRole: "Are you sure you want to delete this role?",
      deselectAll: "Deselect All",
      more: "more",
      grid: "Grid"
    },
    dashboard: {
      activeProjects: "Active Projects",
      tasksDue: "Tasks Due This Week",
      overdue: "Overdue Tasks",
      pendingApprovals: "Pending Approvals",
      completionRate: "Completion Rate",
      myAssigned: "My Assigned Tasks",
      statusOverview: "Project Status Overview",
      activeByDept: "Active Projects by Department",
      alerts: "Critical Alerts & Activity",
      priorityTasks: "My Priority Tasks",
      goToTasks: "Go to My Tasks",
      alertsList: {
        rejected: "Civil Defense rejected application for Downtown Hub",
        completed: "Structural Analysis task completed by Bob Builder",
        uploaded: "New architectural drawings uploaded for Sunset Villa"
      }
    },
    wizard: {
      steps: {
        basic: "Basic Information",
        client: "Client & Team",
        phases: "Phases",
        tasks: "Tasks",
        review: "Review & Create"
      },
      buttons: {
        next: "Next Step",
        back: "Back",
        cancel: "Cancel",
        create: "Create Project",
        saveDraft: "Save as Draft",
        addPhase: "Add Phase",
        addTask: "Add Task"
      },
      basic: {
        name: "Project Name",
        type: "Project Type",
        services: "Services",
        departments: "Departments Involved",
        location: "Area / Location",
        city: "City",
        district: "District",
        address: "Site Address",
        startDate: "Start Date",
        description: "Description"
      },
      client: {
        primary: "Primary Client",
        search: "Search Existing Client",
        create: "Create New Client",
        subClients: "Sub-Clients",
        addSub: "Add Sub-Client",
        team: "Project Team",
        manager: "Project Manager",
        members: "Team Members",
        addMember: "Add Team Member",
        clientName: "Client Name",
        contactPerson: "Contact Person",
        email: "Email",
        searchPlaceholder: "Type to search clients...",
        noSubClients: "No sub-clients added.",
        nameEntityPlaceholder: "Name / Entity",
        notesPlaceholder: "Notes (Optional)",
        selectManager: "Select Project Manager",
        roles: {
           broker: "Broker/Agent",
           contractor: "Contractor",
           developer: "Developer",
           investor: "Investor",
           other: "Other"
        }
      },
      phases: {
        title: "Project Phases",
        templates: "Quick Add Templates",
        engTemplate: "Standard Engineering",
        engDesc: "6 standard phases from initiation to closure.",
        permitTemplate: "Permit-Only",
        permitDesc: "Simplified workflow for permit jobs.",
        customTemplate: "Custom (Empty)",
        customDesc: "Start from scratch with an empty list.",
        phaseName: "Phase Name",
        desc: "Description",
        optionalDesc: "Optional description..."
      },
      tasks: {
        title: "Tasks & Schedule",
        duration: "Duration (Days)",
        type: "Task Type",
        internal: "Internal",
        external: "External (Authority)",
        deps: "Dependencies",
        assignee: "Assignee",
        dept: "Department",
        gantt: "Gantt Preview",
        calcEnd: "Calculated End Date",
        noTasks: "No tasks defined.",
        unassigned: "Unassigned",
        addTasksPrompt: "Add tasks to see preview",
        totalTasks: "Total Tasks",
        projectEnds: "Project Ends around",
        form: {
          title: "Create New Task",
          taskName: "Task Name",
          phase: "Phase",
          selectPhase: "Select Phase",
          priority: "Priority",
          dueDate: "Due Date",
          description: "Description",
          create: "Create Task"
        }
      },
      review: {
        title: "Project Summary",
        docs: "Initial Documents",
        upload: "Drag & drop files here",
        validation: "Validation Summary",
        valid: "Valid",
        invalid: "Invalid",
        missing: "Missing required fields",
        details: "Project Details",
        starts: "Starts",
        currentPhase: "Current Phase",
        allInactive: "All Phases Inactive",
        endDate: "End Date",
        team: "Team",
        manager: "Manager",
        notAssigned: "Not assigned",
        client: "Client",
        phaseProgress: "Phase Progress",
        validations: {
          basic: "Basic Info (Name, Type, Date)",
          client: "Client Selected",
          manager: "Project Manager Assigned",
          phases: "At least one Phase defined",
          duration: "Tasks have durations"
        }
      }
    },
    detail: {
      tabs: {
        overview: "Overview",
        tasks: "Tasks",
        gantt: "Gantt Chart",
        team: "Team",
        documents: "Documents",
        authority: "Authority Tracking",
        activity: "Activity Log"
      },
      stats: {
        startDate: "Start Date",
        endDate: "End Date",
        daysRemaining: "Days Remaining",
        teamSize: "Team Size",
        tasks: "Tasks"
      },
      overview: {
        projectInfo: "Project Information",
        clientInfo: "Client Information",
        timeline: "Timeline Summary",
        recentActivity: "Recent Activity",
        noDesc: "No description provided.",
        contact: "Contact",
        email: "Email",
        phone: "Phone",
        na: "N/A",
        noActivity: "No recent activity."
      },
      documents: {
        upload: "Upload File",
        createFolder: "Create Folder",
        name: "Name",
        size: "Size",
        uploadedBy: "Uploaded By",
        date: "Date",
        root: "Root",
        items: "items",
        files: "Files"
      },
      team: {
        projectTeam: "Project Team",
        projectManager: "Project Manager"
      },
      tasks: {
        noTasksPhase: "No tasks in this phase.",
        status: "Status",
        startDate: "Start Date",
        dueDate: "Due Date",
        assignee: "Assignee",
        dependencies: "Dependencies",
        attachments: "Attachments",
        comments: "Comments",
        addDependency: "Add Dependency",
        selectTask: "Select task...",
        noDependencies: "No dependencies set.",
        dependencyMet: "Met",
        dependencyUnmet: "Unmet"
      },
      gantt: {
        timeline: "Project Timeline",
        taskName: "Task Name",
        internal: "Internal Task",
        external: "External/Authority",
        completed: "Completed",
        today: "Today"
      },
      authority: {
        title: "Authority Applications",
        new: "New Application",
        noApps: "No applications tracked for this project yet.",
        createFirst: "Create First Application",
        trackingId: "Tracking ID",
        authType: "Authority / Type",
        status: "Status",
        waitTime: "Wait Time",
        view: "View"
      },
      activity: {
        filter: "Filter",
        noActivity: "No activity recorded yet."
      }
    },
    authority: {
      title: "Authority Tracking",
      newApp: "New Application",
      stats: {
        total: "Total Applications",
        pending: "Pending Review",
        approved: "Approved",
        rejected: "Action Required",
        avgTime: "Avg Processing"
      },
      filters: {
        authority: "Authority",
        status: "Status",
        search: "Search ID or Project...",
        allStatuses: "All Statuses",
        allAuthorities: "All Authorities"
      },
      table: {
        trackingId: "Tracking ID",
        authority: "Authority",
        type: "Type",
        project: "Project",
        submission: "Submission Date",
        status: "Status",
        wait: "Wait Time",
        lastUpdate: "Last Update"
      },
      modal: {
        title: "Application Details",
        info: "Information",
        docs: "Documents",
        history: "Status History",
        actions: "Actions",
        linkedTask: "Linked Task",
        expected: "Expected Response",
        requestInfo: "Request Info",
        updateStatus: "Update Status",
        uploadNew: "Upload New",
        noDocs: "No documents uploaded.",
        by: "by"
      },
      timeline: "Timeline View"
    },
    myTasks: {
      title: "My Tasks",
      totalTasks: "Total Tasks",
      completedToday: "Completed Today",
      stats: {
        dueToday: "Due Today",
        dueWeek: "Due This Week",
        overdue: "Overdue",
        blocked: "Blocked"
      },
      filters: {
        priority: "Priority",
        search: "Search tasks..."
      },
      sections: {
        overdue: "Overdue",
        today: "Due Today",
        week: "Due This Week",
        later: "Later",
        noDate: "No Due Date"
      }
    },
    team: {
      title: "Team & Resources",
      addEmployee: "Add Employee",
      addDepartment: "Add Department",
      tabs: {
        employees: "Employees",
        departments: "Departments",
        workload: "Workload"
      },
      employees: {
        search: "Search employees...",
        active: "Active",
        inactive: "Inactive",
        onLeave: "On Leave",
        projects: "Active Projects",
        tasks: "Open Tasks",
        contact: "Contact",
        allDepts: "All Departments",
        employee: "Employee"
      },
      departments: {
        search: "Search departments...",
        head: "Head of Dept",
        members: "Members",
        projects: "Projects",
        viewDetails: "View Details",
        name: "Department Name",
        description: "Description"
      },
      workload: {
        utilization: "Utilization",
        available: "Available",
        overloaded: "Overloaded",
        optimal: "Optimal",
        overloadedTitle: "Overloaded Resources",
        overloadedDesc: "employees are above 100% capacity.",
        availableTitle: "Available Resources",
        availableDesc: "employees have availability for new tasks.",
        resourceUtil: "Resource Utilization",
        thisWeek: "This Week",
        employee: "Employee",
        status: "Status"
      },
      form: {
        title: "Create New Employee",
        deptTitle: "Create New Department",
        personalInfo: "Personal Information",
        workInfo: "Work Information",
        fullName: "Full Name",
        role: "Job Title / Role",
        email: "Email Address",
        phone: "Phone Number",
        department: "Department",
        joinDate: "Join Date",
        status: "Employment Status",
        create: "Create Employee",
        createDept: "Create Department",
        deptName: "Department Name",
        deptHead: "Head of Department",
        description: "Description"
      },
      detail: {
        overview: "Overview",
        performance: "Performance",
        contact: "Contact Info",
        utilization: "Utilization Rate",
        currentWork: "Current Work"
      }
    },
    roles: {
      title: "Roles & Permissions",
      create: "Create Role",
      list: "Roles List",
      audit: "Audit Log",
      card: {
        users: "Users",
        permissions: "Permissions",
        system: "System Role",
        edit: "Edit",
        duplicate: "Duplicate",
        delete: "Delete"
      },
      modal: {
        title: "Create/Edit Role",
        roleName: "Role Name",
        description: "Description",
        permissions: "Permissions Matrix",
        selectAll: "Select All",
        save: "Save Role",
        cancel: "Cancel",
        placeholderName: "e.g. Senior Architect",
        placeholderDesc: "Description of responsibilities..."
      },
      auditLog: {
        user: "User",
        action: "Action",
        details: "Details",
        timestamp: "Timestamp"
      },
      categories: {
        projects: "Projects",
        tasks: "Tasks",
        documents: "Documents",
        team: "Team",
        authority: "Authority",
        reports: "Reports",
        admin: "Administration"
      }
    },
    enums: {
      departments: {
        Architecture: "Architecture",
        Civil: "Civil",
        Safety: "Safety",
        Surveying: "Surveying",
        Modern: "Modern",
        Khitbrah: "Khitbrah"
      },
      projectTypes: {
        Residential: "Residential",
        Commercial: "Commercial",
        Industrial: "Industrial",
        Infrastructure: "Infrastructure",
        "Interior Design": "Interior Design",
        Custom: "Custom"
      },
      authStatus: {
        Approved: "Approved",
        Pending: "Pending",
        "Info Required": "Info Required",
        Rejected: "Rejected"
      }
    }
  },
  ar: {
    projects: "المشاريع",
    totalProjects: "إجمالي المشاريع",
    createProject: "مشروع جديد",
    viewToggle: "العرض",
    filters: {
      status: "الحالة",
      department: "القسم",
      manager: "المدير",
      date: "الفترة الزمنية",
      client: "العميل",
      searchPlaceholder: "بحث عن المعرف، الاسم، العميل...",
      all: "الكل",
      clear: "مسح الكل",
    },
    table: {
      id: "المعرف",
      name: "اسم المشروع",
      client: "العميل",
      type: "النوع",
      departments: "الأقسام",
      manager: "مدير المشروع",
      dates: "التواريخ",
      progress: "الإنجاز",
      status: "الحالة",
      tasks: "المهام",
      authority: "التراخيص",
      actions: "إجراءات"
    },
    actions: {
      view: "عرض المشروع",
      edit: "تعديل المشروع",
      gantt: "مخطط جانت",
      team: "إدارة الفريق",
      archive: "أرشفة/حذف",
      bulkExport: "تصدير المحدد",
      bulkStatus: "تغيير الحالة",
      bulkAssign: "تعيين مدير",
      duplicate: "نسخ",
      viewProfile: "عرض الملف",
      delete: "حذف"
    },
    status: {
      notStarted: "لم يبدأ",
      inProgress: "قيد التنفيذ",
      onHold: "معلق",
      completed: "مكتمل",
      cancelled: "ملغى"
    },
    common: {
      showing: "عرض",
      results: "نتائج",
      previous: "السابق",
      next: "التالي",
      of: "من",
      step: "خطوة",
      selected: "محدد",
      viewAll: "عرض الكل",
      today: "اليوم",
      tomorrow: "غداً",
      welcome: "مرحباً بك",
      dashboardSubtitle: "إليك ما يحدث في مشاريعك اليوم.",
      list: "قائمة",
      board: "لوحة",
      calendar: "تقويم",
      filter: "تصفية",
      addTask: "إضافة مهمة",
      addMember: "إضافة عضو",
      cancel: "إلغاء",
      save: "حفظ",
      confirmDeleteRole: "هل أنت متأكد من حذف هذا الدور؟",
      deselectAll: "إلغاء تحديد الكل",
      more: "المزيد",
      grid: "شبكة"
    },
    dashboard: {
      activeProjects: "مشاريع نشطة",
      tasksDue: "مهام مستحقة هذا الأسبوع",
      overdue: "مهام متأخرة",
      pendingApprovals: "موافقات معلقة",
      completionRate: "نسبة الإنجاز",
      myAssigned: "مهامي المسندة",
      statusOverview: "نظرة عامة على حالة المشاريع",
      activeByDept: "المشاريع النشطة حسب القسم",
      alerts: "تنبيهات وأنشطة هامة",
      priorityTasks: "مهامي ذات الأولوية",
      goToTasks: "الذهاب إلى مهامي",
      alertsList: {
        rejected: "رفض الدفاع المدني طلب مركز المدينة",
        completed: "تم إنجاز التحليل الإنشائي بواسطة بوب",
        uploaded: "تم رفع مخططات معمارية جديدة لفيلا الغروب"
      }
    },
    wizard: {
      steps: {
        basic: "المعلومات الأساسية",
        client: "العميل والفريق",
        phases: "المراحل",
        tasks: "المهام",
        review: "المراجعة والإنشاء"
      },
      buttons: {
        next: "الخطوة التالية",
        back: "رجوع",
        cancel: "إلغاء",
        create: "إنشاء المشروع",
        saveDraft: "حفظ كمسودة",
        addPhase: "إضافة مرحلة",
        addTask: "إضافة مهمة"
      },
      basic: {
        name: "اسم المشروع",
        type: "نوع المشروع",
        services: "الخدمات",
        departments: "الأقسام المشاركة",
        location: "المنطقة / الموقع",
        city: "المدينة",
        district: "الحي",
        address: "عنوان الموقع",
        startDate: "تاريخ البدء",
        description: "الوصف"
      },
      client: {
        primary: "العميل الرئيسي",
        search: "بحث عن عميل حالي",
        create: "إنشاء عميل جديد",
        subClients: "العملاء الفرعيين",
        addSub: "إضافة عميل فرعي",
        team: "فريق المشروع",
        manager: "مدير المشروع",
        members: "أعضاء الفريق",
        addMember: "إضافة عضو",
        clientName: "اسم العميل",
        contactPerson: "الشخص المسؤول",
        email: "البريد الإلكتروني",
        searchPlaceholder: "اكتب للبحث عن عملاء...",
        noSubClients: "لم يتم إضافة عملاء فرعيين.",
        nameEntityPlaceholder: "الاسم / الجهة",
        notesPlaceholder: "ملاحظات (اختياري)",
        selectManager: "اختر مدير المشروع",
        roles: {
           broker: "وسيط/وكيل",
           contractor: "مقاول",
           developer: "مطور",
           investor: "مستثمر",
           other: "آخر"
        }
      },
      phases: {
        title: "مراحل المشروع",
        templates: "قوالب سريعة",
        engTemplate: "هندسي قياسي",
        engDesc: "6 مراحل قياسية من البدء إلى الإغلاق.",
        permitTemplate: "تراخيص فقط",
        permitDesc: "سير عمل مبسط للتراخيص.",
        customTemplate: "مخصص (فارغ)",
        customDesc: "ابدأ من الصفر بقائمة فارغة.",
        phaseName: "اسم المرحلة",
        desc: "الوصف",
        optionalDesc: "وصف اختياري..."
      },
      tasks: {
        title: "المهام والجدول الزمني",
        duration: "المدة (أيام)",
        type: "نوع المهمة",
        internal: "داخلي",
        external: "خارجي (جهة حكومية)",
        deps: "الاعتمادات",
        assignee: "المكلف",
        dept: "القسم",
        gantt: "معاينة جانت",
        calcEnd: "تاريخ الانتهاء المحسوب",
        noTasks: "لا توجد مهام محددة.",
        unassigned: "غير مسند",
        addTasksPrompt: "أضف مهام لرؤية المعاينة",
        totalTasks: "إجمالي المهام",
        projectEnds: "ينتهي المشروع تقريباً في",
        form: {
          title: "إنشاء مهمة جديدة",
          taskName: "اسم المهمة",
          phase: "المرحلة",
          selectPhase: "اختر المرحلة",
          priority: "الأولوية",
          dueDate: "تاريخ الاستحقاق",
          description: "الوصف",
          create: "إنشاء المهمة"
        }
      },
      review: {
        title: "ملخص المشروع",
        docs: "المستندات الأولية",
        upload: "اسحب الملفات هنا",
        validation: "ملخص التحقق",
        valid: "صالح",
        invalid: "غير صالح",
        missing: "حقول مطلوبة ناقصة",
        details: "تفاصيل المشروع",
        starts: "يبدأ",
        currentPhase: "المرحلة الحالية",
        allInactive: "جميع المراحل غير نشطة",
        endDate: "تاريخ الانتهاء",
        team: "الفريق",
        manager: "المدير",
        notAssigned: "غير مسند",
        client: "العميل",
        phaseProgress: "تقدم المراحل",
        validations: {
          basic: "المعلومات الأساسية (الاسم، النوع، التاريخ)",
          client: "تم تحديد العميل",
          manager: "تم تعيين مدير المشروع",
          phases: "تم تحديد مرحلة واحدة على الأقل",
          duration: "المهام لها مدد زمنية"
        }
      }
    },
    detail: {
      tabs: {
        overview: "نظرة عامة",
        tasks: "المهام",
        gantt: "مخطط جانت",
        team: "الفريق",
        documents: "المستندات",
        authority: "التراخيص",
        activity: "سجل النشاط"
      },
      stats: {
        startDate: "تاريخ البدء",
        endDate: "تاريخ الانتهاء",
        daysRemaining: "الأيام المتبقية",
        teamSize: "حجم الفريق",
        tasks: "المهام"
      },
      overview: {
        projectInfo: "معلومات المشروع",
        clientInfo: "معلومات العميل",
        timeline: "ملخص الجدول الزمني",
        recentActivity: "النشاط الأخير",
        noDesc: "لا يوجد وصف.",
        contact: "اتصال",
        email: "البريد",
        phone: "الهاتف",
        na: "غير متوفر",
        noActivity: "لا يوجد نشاط حديث."
      },
      documents: {
        upload: "رفع ملف",
        createFolder: "إنشاء مجلد",
        name: "الاسم",
        size: "الحجم",
        uploadedBy: "بواسطة",
        date: "التاريخ",
        root: "الرئيسي",
        items: "عناصر",
        files: "الملفات"
      },
      team: {
        projectTeam: "فريق المشروع",
        projectManager: "مدير المشروع"
      },
      tasks: {
        noTasksPhase: "لا توجد مهام في هذه المرحلة.",
        status: "الحالة",
        startDate: "تاريخ البدء",
        dueDate: "تاريخ الاستحقاق",
        assignee: "المكلف",
        dependencies: "الاعتمادات",
        attachments: "المرفقات",
        comments: "التعليقات",
        addDependency: "إضافة اعتماد",
        selectTask: "اختر مهمة...",
        noDependencies: "لا توجد اعتمادات.",
        dependencyMet: "مستوفى",
        dependencyUnmet: "غير مستوفى"
      },
      gantt: {
        timeline: "الجدول الزمني للمشروع",
        taskName: "اسم المهمة",
        internal: "مهمة داخلية",
        external: "خارجي/جهة حكومية",
        completed: "مكتملة",
        today: "اليوم"
      },
      authority: {
        title: "طلبات الجهات",
        new: "طلب جديد",
        noApps: "لا توجد طلبات متابعة لهذا المشروع بعد.",
        createFirst: "إنشاء أول طلب",
        trackingId: "رقم التتبع",
        authType: "الجهة / النوع",
        status: "الحالة",
        waitTime: "مدة الانتظار",
        view: "عرض"
      },
      activity: {
        filter: "تصفية",
        noActivity: "لا يوجد نشاط مسجل بعد."
      }
    },
    authority: {
      title: "متابعة التراخيص",
      newApp: "طلب جديد",
      stats: {
        total: "إجمالي الطلبات",
        pending: "قيد المراجعة",
        approved: "تمت الموافقة",
        rejected: "إجراء مطلوب",
        avgTime: "متوسط المعالجة"
      },
      filters: {
        authority: "الجهة",
        status: "الحالة",
        search: "بحث في المعرف أو المشروع...",
        allStatuses: "جميع الحالات",
        allAuthorities: "جميع الجهات"
      },
      table: {
        trackingId: "رقم التتبع",
        authority: "الجهة",
        type: "النوع",
        project: "المشروع",
        submission: "تاريخ التقديم",
        status: "الحالة",
        wait: "مدة الانتظار",
        lastUpdate: "آخر تحديث"
      },
      modal: {
        title: "تفاصيل الطلب",
        info: "المعلومات",
        docs: "المستندات",
        history: "سجل الحالة",
        actions: "الإجراءات",
        linkedTask: "المهمة المرتبطة",
        expected: "التاريخ المتوقع",
        requestInfo: "طلب معلومات",
        updateStatus: "تحديث الحالة",
        uploadNew: "رفع جديد",
        noDocs: "لم يتم رفع مستندات.",
        by: "بواسطة"
      },
      timeline: "عرض الجدول الزمني"
    },
    myTasks: {
      title: "مهامي",
      totalTasks: "إجمالي المهام",
      completedToday: "أنجزت اليوم",
      stats: {
        dueToday: "مستحق اليوم",
        dueWeek: "مستحق هذا الأسبوع",
        overdue: "متأخر",
        blocked: "محظور"
      },
      filters: {
        priority: "الأولوية",
        search: "بحث في المهام..."
      },
      sections: {
        overdue: "متأخر",
        today: "مستحق اليوم",
        week: "هذا الأسبوع",
        later: "لاحقاً",
        noDate: "بدون تاريخ"
      }
    },
    team: {
      title: "الفريق والموارد",
      addEmployee: "إضافة موظف",
      addDepartment: "إضافة قسم",
      tabs: {
        employees: "الموظفين",
        departments: "الأقسام",
        workload: "عبء العمل"
      },
      employees: {
        search: "بحث عن موظف...",
        active: "نشط",
        inactive: "غير نشط",
        onLeave: "في إجازة",
        projects: "مشاريع نشطة",
        tasks: "مهام مفتوحة",
        contact: "اتصال",
        allDepts: "جميع الأقسام",
        employee: "الموظف"
      },
      departments: {
        search: "بحث عن قسم...",
        head: "رئيس القسم",
        members: "أعضاء",
        projects: "مشاريع",
        viewDetails: "عرض التفاصيل",
        name: "اسم القسم",
        description: "الوصف"
      },
      workload: {
        utilization: "الاستغلال",
        available: "متاح",
        overloaded: "محمل زائد",
        optimal: "مثالي",
        overloadedTitle: "موارد محملة بشكل زائد",
        overloadedDesc: "موظفين تجاوزوا 100% من السعة.",
        availableTitle: "موارد متاحة",
        availableDesc: "موظفين لديهم وقت لمهام جديدة.",
        resourceUtil: "استغلال الموارد",
        thisWeek: "هذا الأسبوع",
        employee: "الموظف",
        status: "الحالة"
      },
      form: {
        title: "إنشاء موظف جديد",
        deptTitle: "إنشاء قسم جديد",
        personalInfo: "المعلومات الشخصية",
        workInfo: "معلومات العمل",
        fullName: "الاسم الكامل",
        role: "المسمى الوظيفي",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        department: "القسم",
        joinDate: "تاريخ الانضمام",
        status: "حالة التوظيف",
        create: "إنشاء الموظف",
        createDept: "إنشاء القسم",
        deptName: "اسم القسم",
        deptHead: "رئيس القسم",
        description: "الوصف"
      },
      detail: {
        overview: "نظرة عامة",
        performance: "الأداء",
        contact: "معلومات الاتصال",
        utilization: "معدل الاستغلال",
        currentWork: "العمل الحالي"
      }
    },
    roles: {
      title: "الأدوار والصلاحيات",
      create: "إنشاء دور",
      list: "قائمة الأدوار",
      audit: "سجل التدقيق",
      card: {
        users: "مستخدم",
        permissions: "صلاحيات",
        system: "دور نظام",
        edit: "تعديل",
        duplicate: "نسخ",
        delete: "حذف"
      },
      modal: {
        title: "إنشاء/تعديل دور",
        roleName: "اسم الدور",
        description: "الوصف",
        permissions: "مصفوفة الصلاحيات",
        selectAll: "تحديد الكل",
        save: "حفظ الدور",
        cancel: "إلغاء",
        placeholderName: "مثال: كبير المهندسين",
        placeholderDesc: "وصف المسؤوليات..."
      },
      auditLog: {
        user: "المستخدم",
        action: "الإجراء",
        details: "التفاصيل",
        timestamp: "الوقت"
      },
      categories: {
        projects: "المشاريع",
        tasks: "المهام",
        documents: "المستندات",
        team: "الفريق",
        authority: "التراخيص",
        reports: "التقارير",
        admin: "الإدارة"
      }
    },
    enums: {
      departments: {
        Architecture: "عمارة",
        Civil: "مدني",
        Safety: "سلامة",
        Surveying: "مساحة",
        Modern: "حديث",
        Khitbrah: "خبرة"
      },
      projectTypes: {
        Residential: "سكني",
        Commercial: "تجاري",
        Industrial: "صناعي",
        Infrastructure: "بنية تحتية",
        "Interior Design": "تصميم داخلي",
        Custom: "مخصص"
      },
      authStatus: {
        Approved: "مقبول",
        Pending: "قيد الانتظار",
        "Info Required": "مطلوب معلومات",
        Rejected: "مرفوض"
      }
    }
  }
};