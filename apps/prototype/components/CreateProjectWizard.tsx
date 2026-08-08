import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { ProjectWizardState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Step1BasicInfo } from './wizard/Step1BasicInfo';
import { Step2ClientTeam } from './wizard/Step2ClientTeam';
import { Step3Phases } from './wizard/Step3Phases';
import { Step4Tasks } from './wizard/Step4Tasks';
import { Step5Review } from './wizard/Step5Review';

const STEPS = [
  { id: 1, key: 'basic' },
  { id: 2, key: 'client' },
  { id: 3, key: 'phases' },
  { id: 4, key: 'tasks' },
  { id: 5, key: 'review' },
];

export const CreateProjectWizard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<ProjectWizardState>({
    name: '',
    type: 'Residential',
    services: [],
    departments: [],
    city: '',
    district: '',
    address: '',
    startDate: new Date().toISOString().split('T')[0],
    description: '',
    clientId: '',
    isNewClient: false,
    newClientData: { name: '', type: 'Individual', contact: '', email: '', phone: '', companyName: '' },
    subClients: [],
    managerId: '',
    teamMemberIds: [],
    phases: []
  });

  const updateFormData = (newData: Partial<ProjectWizardState>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCreate = () => {
    // Validate required fields again just in case
    if (!formData.name || !formData.startDate) return alert(t('wizard.review.missing'));
    
    console.log("Creating Project:", formData);
    // Here we would call API to create project
    // await api.projects.create(formData);
    
    navigate('/projects');
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1: return <Step1BasicInfo data={formData} onChange={updateFormData} />;
      case 2: return <Step2ClientTeam data={formData} onChange={updateFormData} />;
      case 3: return <Step3Phases data={formData} onChange={updateFormData} />;
      case 4: return <Step4Tasks data={formData} onChange={updateFormData} />;
      case 5: return <Step5Review data={formData} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('wizard.buttons.create')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('common.step')} {currentStep} {t('common.of')} {STEPS.length}: {t(`wizard.steps.${STEPS[currentStep-1].key}`)}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative">
           <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
           <div 
             className="absolute left-0 rtl:left-auto rtl:right-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500" 
             style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
           ></div>
           
           <div className="flex justify-between w-full">
             {STEPS.map((step) => (
               <div key={step.id} className="flex flex-col items-center group cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                 <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${
                   currentStep >= step.id 
                   ? 'border-blue-600 text-blue-600' 
                   : 'border-gray-300 text-gray-400'
                 } ${currentStep === step.id ? 'ring-4 ring-blue-100' : ''}`}>
                   {currentStep > step.id ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{step.id}</span>}
                 </div>
                 <span className={`mt-2 text-[10px] md:text-xs font-medium hidden sm:block ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                    {t(`wizard.steps.${step.key}`)}
                 </span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[500px] flex flex-col">
        <div className="flex-1">
           {renderStep()}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div>
          {currentStep > 1 ? (
            <button 
              onClick={prevStep}
              className="px-6 py-2.5 rounded-lg font-medium flex items-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
               {useLanguage().language === 'ar' ? <ChevronRight size={20} className="ml-1" /> : <ChevronLeft size={20} className="mr-1" />}
               {t('wizard.buttons.back')}
            </button>
          ) : (
            <button 
              onClick={() => navigate('/projects')}
              className="px-6 py-2.5 rounded-lg font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              {t('wizard.buttons.cancel')}
            </button>
          )}
        </div>
        
        <div className="flex gap-3">
          <button className="hidden sm:flex items-center px-4 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium shadow-sm">
             <Save size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
             {t('wizard.buttons.saveDraft')}
          </button>

          {currentStep < 5 ? (
            <button 
              onClick={nextStep}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center shadow-lg hover:shadow-xl transition-all"
            >
              {t('wizard.buttons.next')} 
              {useLanguage().language === 'ar' ? <ChevronLeft size={20} className="mr-2" /> : <ChevronRight size={20} className="ml-2" />}
            </button>
          ) : (
            <button 
              onClick={handleCreate}
              className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {t('wizard.buttons.create')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};