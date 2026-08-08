import React from 'react';
import { ProjectWizardState } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckCircle, AlertCircle, FileText, UploadCloud, User, Calendar, MapPin, Briefcase } from 'lucide-react';
import { MOCK_CLIENTS, MOCK_USERS } from '../../constants';

interface Props {
  data: ProjectWizardState;
}

export const Step5Review: React.FC<Props> = ({ data }) => {
  const { t } = useLanguage();

  // Validation Logic
  const validations = [
    { label: t('wizard.review.validations.basic'), valid: !!(data.name && data.type && data.startDate) },
    { label: t('wizard.review.validations.client'), valid: !!(data.clientId || (data.isNewClient && data.newClientData.name)) },
    { label: t('wizard.review.validations.manager'), valid: !!data.managerId },
    { label: t('wizard.review.validations.phases'), valid: data.phases.length > 0 },
    { label: t('wizard.review.validations.duration'), valid: data.phases.every(p => p.tasks.every(t => t.duration > 0)) },
  ];

  const allValid = validations.every(v => v.valid);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{t('wizard.review.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Summary Card */}
         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
             <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">{t('wizard.review.details')}</h3>
             
             <div className="flex items-start">
                <Briefcase size={16} className="text-gray-400 mt-1 mr-2 rtl:ml-2 rtl:mr-0" />
                <div>
                   <p className="text-sm font-semibold">{data.name}</p>
                   <p className="text-xs text-gray-500">{t(`enums.projectTypes.${data.type}` as any)}</p>
                </div>
             </div>
             
             <div className="flex items-start">
                <Calendar size={16} className="text-gray-400 mt-1 mr-2 rtl:ml-2 rtl:mr-0" />
                <div>
                   <p className="text-sm">{t('wizard.review.starts')}: {data.startDate}</p>
                </div>
             </div>

             <div className="flex items-start">
                <MapPin size={16} className="text-gray-400 mt-1 mr-2 rtl:ml-2 rtl:mr-0" />
                <div>
                   <p className="text-sm">{data.city}, {data.district}</p>
                </div>
             </div>

             <div className="border-t pt-2 mt-2">
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('wizard.review.team')}</h4>
                 <div className="flex items-center mb-2">
                    <User size={16} className="text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
                    <span className="text-sm">
                       {t('wizard.review.manager')}: {MOCK_USERS.find(u => u.id === data.managerId)?.name || t('wizard.review.notAssigned')}
                    </span>
                 </div>
                 <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
                    <span className="text-sm">{t('wizard.review.client')}: {data.isNewClient ? data.newClientData.name : MOCK_CLIENTS.find(c => c.id === data.clientId)?.name}</span>
                 </div>
             </div>
         </div>

         {/* Validation & Upload */}
         <div className="space-y-6">
            <div className={`rounded-xl border p-6 ${allValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
               <h3 className={`font-bold border-b pb-2 mb-3 flex items-center ${allValid ? 'text-green-800 border-green-200' : 'text-red-800 border-red-200'}`}>
                  {allValid ? <CheckCircle size={20} className="mr-2 rtl:ml-2 rtl:mr-0" /> : <AlertCircle size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />}
                  {t('wizard.review.validation')}
               </h3>
               <ul className="space-y-2">
                  {validations.map((v, i) => (
                     <li key={i} className="flex items-center text-sm">
                        {v.valid ? (
                           <CheckCircle size={14} className="text-green-600 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0" />
                        ) : (
                           <AlertCircle size={14} className="text-red-600 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0" />
                        )}
                        <span className={v.valid ? 'text-gray-700' : 'text-red-700 font-medium'}>{v.label}</span>
                     </li>
                  ))}
               </ul>
            </div>

            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
               <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                  <UploadCloud size={24} className="text-blue-600" />
               </div>
               <h4 className="font-medium text-gray-900">{t('wizard.review.docs')}</h4>
               <p className="text-xs text-gray-500 mt-1">{t('wizard.review.upload')}</p>
            </div>
         </div>
      </div>
    </div>
  );
};