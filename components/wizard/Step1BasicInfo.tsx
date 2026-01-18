import React from 'react';
import { ProjectWizardState, ProjectType, Department, ServiceType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin, Calendar, FileText, Briefcase } from 'lucide-react';

interface Props {
  data: ProjectWizardState;
  onChange: (data: Partial<ProjectWizardState>) => void;
}

const PROJECT_TYPES: ProjectType[] = ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Interior Design', 'Custom'];
const SERVICES: ServiceType[] = ['Architectural Design', 'Structural Engineering', 'MEP Design', 'Safety Consultation', 'Site Supervision', 'Surveying', 'Permit Management'];
const DEPARTMENTS: Department[] = ['Architecture', 'Civil', 'Safety', 'Surveying', 'Modern', 'Khitbrah'];

export const Step1BasicInfo: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();

  const toggleSelection = <T extends string>(current: T[], item: T, field: keyof ProjectWizardState) => {
    const exists = current.includes(item);
    const updated = exists 
      ? current.filter(i => i !== item)
      : [...current, item];
    onChange({ [field]: updated });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
           <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.basic.name')} <span className="text-red-500">*</span></label>
           <div className="relative">
             <Briefcase className="absolute top-2.5 left-3 rtl:left-auto rtl:right-3 text-gray-400" size={18} />
             <input 
               type="text" 
               value={data.name}
               onChange={(e) => onChange({ name: e.target.value })}
               className="pl-10 rtl:pl-3 rtl:pr-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 border bg-white text-gray-900"
               placeholder={t('wizard.basic.name')}
             />
           </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.basic.type')} <span className="text-red-500">*</span></label>
           <select 
             value={data.type}
             onChange={(e) => onChange({ type: e.target.value as ProjectType })}
             className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 border bg-white text-gray-900"
           >
             {PROJECT_TYPES.map(type => (
               <option key={type} value={type}>{t(`enums.projectTypes.${type}` as any)}</option>
             ))}
           </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.basic.startDate')} <span className="text-red-500">*</span></label>
           <div className="relative">
             <Calendar className="absolute top-2.5 left-3 rtl:left-auto rtl:right-3 text-gray-400" size={18} />
             <input 
               type="date"
               value={data.startDate}
               onChange={(e) => onChange({ startDate: e.target.value })}
               className="pl-10 rtl:pl-3 rtl:pr-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 border bg-white text-gray-900"
             />
           </div>
        </div>
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700 mb-3">{t('wizard.basic.services')}</label>
         <div className="flex flex-wrap gap-2">
            {SERVICES.map(service => (
              <button
                key={service}
                onClick={() => toggleSelection(data.services, service, 'services')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  data.services.includes(service)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {service}
              </button>
            ))}
         </div>
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700 mb-3">{t('wizard.basic.departments')}</label>
         <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => toggleSelection(data.departments, dept, 'departments')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  data.departments.includes(dept)
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t(`enums.departments.${dept}` as any)}
              </button>
            ))}
         </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
         <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 rtl:ml-2 rtl:mr-0 text-gray-500" />
            {t('wizard.basic.location')}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.basic.city')}</label>
              <input 
                type="text" 
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.basic.district')}</label>
              <input 
                type="text" 
                value={data.district}
                onChange={(e) => onChange({ district: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.basic.address')}</label>
              <input 
                type="text" 
                value={data.address}
                onChange={(e) => onChange({ address: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
              />
            </div>
         </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.basic.description')}</label>
        <div className="relative">
          <FileText className="absolute top-3 left-3 rtl:left-auto rtl:right-3 text-gray-400" size={18} />
          <textarea 
             rows={4}
             value={data.description}
             onChange={(e) => onChange({ description: e.target.value })}
             className="pl-10 rtl:pl-3 rtl:pr-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-white text-gray-900"
          />
        </div>
      </div>
    </div>
  );
};