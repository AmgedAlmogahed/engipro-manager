import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Briefcase, CheckSquare, AlertTriangle, FileText, 
  Activity, Clock, ChevronRight 
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_AUTHORITY_APPS, CURRENT_USER } from '../constants';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const KPI_DATA = [
    { label: t('dashboard.activeProjects'), value: 12, icon: Briefcase, color: 'bg-blue-500' },
    { label: t('dashboard.tasksDue'), value: 8, icon: Clock, color: 'bg-indigo-500' },
    { label: t('dashboard.overdue'), value: 3, icon: AlertTriangle, color: 'bg-red-500', alert: true },
    { label: t('dashboard.pendingApprovals'), value: 4, icon: FileText, color: 'bg-amber-500' },
    { label: t('dashboard.completionRate'), value: '68%', icon: Activity, color: 'bg-emerald-500' },
    { label: t('dashboard.myAssigned'), value: 5, icon: CheckSquare, color: 'bg-purple-500' },
  ];

  const STATUS_DATA = [
    { name: t('status.notStarted'), value: 4, color: '#94a3b8' },
    { name: t('status.inProgress'), value: 12, color: '#3b82f6' },
    { name: t('status.onHold'), value: 3, color: '#f59e0b' },
    { name: t('status.completed'), value: 8, color: '#10b981' },
  ];

  const DEPT_DATA = [
    { name: t('enums.departments.Architecture'), value: 15 },
    { name: t('enums.departments.Civil'), value: 12 },
    { name: t('enums.departments.Safety'), value: 8 },
    { name: t('enums.departments.Surveying'), value: 6 },
    { name: t('enums.departments.Modern'), value: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('common.welcome')}, {CURRENT_USER.name}</h1>
          <p className="text-gray-500 mt-1">{t('common.dashboardSubtitle')}</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_DATA.map((kpi, idx) => (
          <div key={idx} className={`bg-white rounded-xl shadow-sm border ${kpi.alert ? 'border-red-200 bg-red-50' : 'border-gray-100'} p-4 flex flex-col justify-between hover:shadow-md transition-shadow`}>
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                 <h3 className={`text-2xl font-bold mt-1 ${kpi.alert ? 'text-red-700' : 'text-gray-900'}`}>{kpi.value}</h3>
               </div>
               <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
                 <kpi.icon size={20} className={kpi.alert ? 'text-red-600' : 'text-gray-700'} />
               </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Status Chart */}
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">{t('dashboard.statusOverview')}</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie 
                            data={STATUS_DATA} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                            {STATUS_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                         <Tooltip />
                         <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Department Chart */}
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">{t('dashboard.activeByDept')}</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DEPT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} />
                         <YAxis axisLine={false} tickLine={false} />
                         <Tooltip cursor={{fill: '#f3f4f6'}} />
                         <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
           </div>

           {/* Recent Activity / Feed */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-semibold text-gray-800">{t('dashboard.alerts')}</h3>
                 <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">{t('common.viewAll')}</button>
              </div>
              <div className="divide-y divide-gray-100">
                 {[
                   { type: 'alert', msg: t('dashboard.alertsList.rejected'), time: '2 hours ago', urgent: true },
                   { type: 'task', msg: t('dashboard.alertsList.completed'), time: '4 hours ago', urgent: false },
                   { type: 'doc', msg: t('dashboard.alertsList.uploaded'), time: 'Yesterday', urgent: false },
                 ].map((item, idx) => (
                   <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors">
                      <div className={`mt-1 h-2 w-2 rounded-full ${item.urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.msg}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* My Tasks Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
           <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{t('dashboard.priorityTasks')}</h3>
           </div>
           <div className="flex-1 p-2 overflow-y-auto">
              <div className="space-y-2">
                 {[
                   { title: 'Review Municipality Comments', project: 'Sunset Villa', due: t('common.today'), tag: 'High' },
                   { title: 'Update Safety Protocols', project: 'Downtown Hub', due: t('common.tomorrow'), tag: 'Medium' },
                   { title: 'Client Meeting Prep', project: 'Industrial Beta', due: 'Nov 12', tag: 'Normal' },
                   { title: 'Sign off on blueprints', project: 'Sunset Villa', due: 'Nov 14', tag: 'Normal' },
                 ].map((task, i) => (
                   <div key={i} className="group p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{task.title}</h4>
                         <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.tag === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{task.tag}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{task.project}</p>
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-orange-600 font-medium flex items-center">
                            <Clock size={12} className="mr-1 rtl:ml-1 rtl:mr-0" /> {task.due}
                         </span>
                         <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 rtl:rotate-180" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => navigate('/projects')}
                className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                {t('dashboard.goToTasks')}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};