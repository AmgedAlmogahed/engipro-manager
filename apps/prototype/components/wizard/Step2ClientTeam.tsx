import React, { useState } from 'react';
import { ProjectWizardState, SubClientRole, SubClient } from '../../types';
import { MOCK_CLIENTS, MOCK_USERS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Search, Plus, X, UserPlus, Building } from 'lucide-react';

interface Props {
  data: ProjectWizardState;
  onChange: (data: Partial<ProjectWizardState>) => void;
}

export const Step2ClientTeam: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubClient = () => {
    const newSub: SubClient = {
      id: `sub_${Date.now()}`,
      name: '',
      role: 'Other'
    };
    onChange({ subClients: [...data.subClients, newSub] });
  };

  const updateSubClient = (id: string, field: keyof SubClient, value: any) => {
    const updated = data.subClients.map(s => s.id === id ? { ...s, [field]: value } : s);
    onChange({ subClients: updated });
  };

  const removeSubClient = (id: string) => {
    onChange({ subClients: data.subClients.filter(s => s.id !== id) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Primary Client Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <User size={20} className="mr-2 rtl:ml-2 rtl:mr-0 text-blue-600" />
            {t('wizard.client.primary')}
         </h3>

         <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <button 
               onClick={() => onChange({ isNewClient: false })}
               className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${!data.isNewClient ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
            >
               {t('wizard.client.search')}
            </button>
            <button 
               onClick={() => onChange({ isNewClient: true })}
               className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${data.isNewClient ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
            >
               {t('wizard.client.create')}
            </button>
         </div>

         {!data.isNewClient ? (
           <div className="space-y-4">
              <div className="relative">
                 <Search className="absolute top-3 left-3 rtl:left-auto rtl:right-3 text-gray-400" size={18} />
                 <input 
                    type="text" 
                    placeholder={t('wizard.client.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 rtl:pl-3 rtl:pr-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 border bg-white text-gray-900"
                 />
              </div>
              {/* Dropdown Results (Mock) */}
              {searchTerm && !data.clientId && (
                 <div className="border border-gray-200 rounded-lg divide-y max-h-40 overflow-y-auto bg-white">
                    {filteredClients.map(client => (
                       <div 
                         key={client.id} 
                         onClick={() => {
                           onChange({ clientId: client.id });
                           setSearchTerm('');
                         }}
                         className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                       >
                         <div>
                            <p className="font-medium text-sm text-gray-900">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.type} • {client.email}</p>
                         </div>
                         <Plus size={16} className="text-gray-400" />
                       </div>
                    ))}
                 </div>
              )}
              {/* Selected Client Card */}
              {data.clientId && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                       <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{t('common.selected')}</span>
                       <p className="font-bold text-gray-900">{MOCK_CLIENTS.find(c => c.id === data.clientId)?.name}</p>
                       <p className="text-sm text-gray-600">{MOCK_CLIENTS.find(c => c.id === data.clientId)?.email}</p>
                    </div>
                    <button onClick={() => onChange({ clientId: '' })} className="text-red-500 hover:text-red-700 p-2">
                       <X size={20} />
                    </button>
                 </div>
              )}
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <label className="block text-xs font-medium text-gray-700 mb-1">{t('wizard.client.clientName')} *</label>
                 <input 
                    value={data.newClientData.name}
                    onChange={e => onChange({ newClientData: { ...data.newClientData, name: e.target.value } })}
                    className="w-full rounded-lg border-gray-300 py-2 border px-3 bg-white text-gray-900"
                 />
              </div>
              <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">{t('wizard.client.contactPerson')}</label>
                 <input 
                    value={data.newClientData.contact}
                    onChange={e => onChange({ newClientData: { ...data.newClientData, contact: e.target.value } })}
                    className="w-full rounded-lg border-gray-300 py-2 border px-3 bg-white text-gray-900"
                 />
              </div>
              <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">{t('wizard.client.email')}</label>
                 <input 
                    value={data.newClientData.email}
                    onChange={e => onChange({ newClientData: { ...data.newClientData, email: e.target.value } })}
                    className="w-full rounded-lg border-gray-300 py-2 border px-3 bg-white text-gray-900"
                 />
              </div>
           </div>
         )}
      </div>

      {/* Sub-Clients Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
               <Building size={20} className="mr-2 rtl:ml-2 rtl:mr-0 text-gray-500" />
               {t('wizard.client.subClients')}
            </h3>
            <button onClick={handleAddSubClient} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
               <Plus size={16} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('wizard.client.addSub')}
            </button>
         </div>
         
         {data.subClients.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">{t('wizard.client.noSubClients')}</p>
         ) : (
            <div className="space-y-3">
               {data.subClients.map((sub) => (
                  <div key={sub.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                     <div className="flex-1 w-full">
                        <input 
                           placeholder={t('wizard.client.nameEntityPlaceholder')}
                           value={sub.name}
                           onChange={(e) => updateSubClient(sub.id, 'name', e.target.value)}
                           className="w-full text-sm rounded-md border-gray-300 py-1.5 px-2 bg-white text-gray-900"
                        />
                     </div>
                     <div className="w-full md:w-40">
                        <select 
                           value={sub.role}
                           onChange={(e) => updateSubClient(sub.id, 'role', e.target.value)}
                           className="w-full text-sm rounded-md border-gray-300 py-1.5 px-2 bg-white text-gray-900"
                        >
                           {['Broker/Agent', 'Contractor', 'Developer', 'Investor', 'Other'].map(r => (
                              <option key={r} value={r}>{r}</option>
                           ))}
                        </select>
                     </div>
                     <div className="w-full md:w-1/3">
                        <input 
                           placeholder={t('wizard.client.notesPlaceholder')}
                           value={sub.notes || ''}
                           onChange={(e) => updateSubClient(sub.id, 'notes', e.target.value)}
                           className="w-full text-sm rounded-md border-gray-300 py-1.5 px-2 bg-white text-gray-900"
                        />
                     </div>
                     <button onClick={() => removeSubClient(sub.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <X size={18} />
                     </button>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* Team Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <UserPlus size={20} className="mr-2 rtl:ml-2 rtl:mr-0 text-indigo-600" />
            {t('wizard.client.team')}
         </h3>
         
         <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('wizard.client.manager')} <span className="text-red-500">*</span></label>
            <select 
               value={data.managerId}
               onChange={(e) => onChange({ managerId: e.target.value })}
               className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 border bg-white text-gray-900 px-3"
            >
               <option value="">{t('wizard.client.selectManager')}</option>
               {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.name} - {u.role}</option>
               ))}
            </select>
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('wizard.client.members')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {MOCK_USERS.filter(u => u.id !== data.managerId).map(user => {
                  const isSelected = data.teamMemberIds.includes(user.id);
                  return (
                     <div 
                        key={user.id} 
                        onClick={() => {
                           const newIds = isSelected 
                             ? data.teamMemberIds.filter(id => id !== user.id)
                             : [...data.teamMemberIds, user.id];
                           onChange({ teamMemberIds: newIds });
                        }}
                        className={`p-3 rounded-lg border cursor-pointer flex items-center transition-all ${isSelected ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                     >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                           {isSelected && <CheckIcon size={12} className="text-white" />}
                        </div>
                        <img src={user.avatar} className="w-8 h-8 rounded-full mr-3 rtl:ml-3 rtl:mr-0" alt="" />
                        <div>
                           <p className="text-sm font-medium text-gray-900">{user.name}</p>
                           <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
    </div>
  );
};

// Internal Helper
const CheckIcon = ({size, className}: {size: number, className: string}) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
   </svg>
);