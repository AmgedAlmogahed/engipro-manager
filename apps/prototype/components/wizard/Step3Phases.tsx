import React from 'react';
import { ProjectWizardState, Phase } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Layers, Plus, Trash2, GripVertical, FileText } from 'lucide-react';

interface Props {
  data: ProjectWizardState;
  onChange: (data: Partial<ProjectWizardState>) => void;
}

export const Step3Phases: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();

  const handleAddPhase = () => {
    const newPhase: Phase = {
      id: `ph_${Date.now()}`,
      name: t('wizard.phases.phaseName'),
      order: data.phases.length + 1,
      tasks: []
    };
    onChange({ phases: [...data.phases, newPhase] });
  };

  const removePhase = (id: string) => {
    onChange({ phases: data.phases.filter(p => p.id !== id) });
  };

  const updatePhase = (id: string, field: keyof Phase, value: any) => {
    onChange({
      phases: data.phases.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const loadTemplate = (type: 'eng' | 'permit' | 'custom') => {
    let newPhases: Phase[] = [];
    if (type === 'eng') {
       newPhases = [
          { id: `ph_${Date.now()}_1`, name: 'Initiation', order: 1, tasks: [] },
          { id: `ph_${Date.now()}_2`, name: 'Design Development', order: 2, tasks: [] },
          { id: `ph_${Date.now()}_3`, name: 'Authority Submissions', order: 3, tasks: [] },
          { id: `ph_${Date.now()}_4`, name: 'Review & Revision', order: 4, tasks: [] },
          { id: `ph_${Date.now()}_5`, name: 'Final Delivery', order: 5, tasks: [] },
          { id: `ph_${Date.now()}_6`, name: 'Project Closure', order: 6, tasks: [] },
       ];
    } else if (type === 'permit') {
       newPhases = [
          { id: `ph_${Date.now()}_1`, name: 'Document Collection', order: 1, tasks: [] },
          { id: `ph_${Date.now()}_2`, name: 'Submission', order: 2, tasks: [] },
          { id: `ph_${Date.now()}_3`, name: 'Permit Issuance', order: 3, tasks: [] },
       ];
    }
    onChange({ phases: newPhases });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Templates Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('wizard.phases.templates')}</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
               onClick={() => loadTemplate('eng')}
               className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
               <div className="flex items-center mb-2">
                  <Layers size={20} className="text-gray-400 group-hover:text-blue-500 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span className="font-semibold text-gray-900 group-hover:text-blue-700">{t('wizard.phases.engTemplate')}</span>
               </div>
               <p className="text-xs text-gray-500">{t('wizard.phases.engDesc')}</p>
            </button>
            <button 
               onClick={() => loadTemplate('permit')}
               className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
               <div className="flex items-center mb-2">
                  <FileText size={20} className="text-gray-400 group-hover:text-purple-500 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span className="font-semibold text-gray-900 group-hover:text-purple-700">{t('wizard.phases.permitTemplate')}</span>
               </div>
               <p className="text-xs text-gray-500">{t('wizard.phases.permitDesc')}</p>
            </button>
            <button 
               onClick={() => loadTemplate('custom')}
               className="p-4 border border-dashed rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all text-left group"
            >
               <div className="flex items-center mb-2">
                  <Plus size={20} className="text-gray-400 group-hover:text-gray-600 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span className="font-semibold text-gray-900">{t('wizard.phases.customTemplate')}</span>
               </div>
               <p className="text-xs text-gray-500">{t('wizard.phases.customDesc')}</p>
            </button>
         </div>
      </div>

      {/* Phase List */}
      <div>
         <div className="flex justify-between items-end mb-3">
             <h3 className="text-lg font-bold text-gray-900">{t('wizard.phases.title')}</h3>
             <span className="text-sm text-gray-500">{data.phases.length} Phases</span>
         </div>

         <div className="space-y-3">
            {data.phases.map((phase, idx) => (
               <div key={phase.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center shadow-sm group hover:shadow-md transition-all">
                  <div className="cursor-move text-gray-300 hover:text-gray-500 mr-3 rtl:ml-3 rtl:mr-0">
                     <GripVertical size={20} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mr-4 rtl:ml-4 rtl:mr-0">
                     {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="sr-only">{t('wizard.phases.phaseName')}</label>
                        <input 
                           value={phase.name}
                           onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                           className="w-full font-medium text-gray-900 border-none p-0 focus:ring-0 placeholder-gray-400 bg-transparent"
                           placeholder={t('wizard.phases.phaseName')}
                        />
                     </div>
                     <div>
                        <label className="sr-only">{t('wizard.phases.desc')}</label>
                        <input 
                           value={phase.description || ''}
                           onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                           className="w-full text-sm text-gray-500 border-none p-0 focus:ring-0 placeholder-gray-300 bg-transparent"
                           placeholder={t('wizard.phases.optionalDesc')}
                        />
                     </div>
                  </div>
                  <button 
                     onClick={() => removePhase(phase.id)}
                     className="ml-4 rtl:mr-4 rtl:ml-0 text-gray-300 hover:text-red-500 transition-colors p-2"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>
            ))}
            
            <button 
               onClick={handleAddPhase}
               className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center font-medium transition-colors"
            >
               <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('wizard.buttons.addPhase')}
            </button>
         </div>
      </div>
    </div>
  );
};