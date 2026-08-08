import React, { useState } from 'react';
import { Project, ProjectDocument } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Folder, FileText, Image as ImageIcon, File, UploadCloud, MoreVertical, Download, Clock } from 'lucide-react';

interface Props {
  project: Project;
}

export const DocumentsTab: React.FC<Props> = ({ project }) => {
  const { t } = useLanguage();
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  // Flattened mock navigation logic for demo
  // In real app, we traverse the tree based on IDs
  const rootDocs = project.documents || [];

  const getFileIcon = (type: string | undefined) => {
     switch(type) {
        case 'pdf': return <FileText size={24} className="text-red-500" />;
        case 'img': return <ImageIcon size={24} className="text-purple-500" />;
        case 'dwg': return <File size={24} className="text-blue-500" />; // Blueprint icon proxy
        default: return <File size={24} className="text-gray-500" />;
     }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px] flex flex-col">
       <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
             <h3 className="text-lg font-bold text-gray-900">{t('detail.documents.name')}</h3>
             <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="hover:text-blue-600 cursor-pointer">{t('detail.documents.root')}</span>
                {currentPath.length > 0 && <span className="mx-2">/</span>}
                {/* Breadcrumbs would go here */}
             </div>
          </div>
          <div className="flex space-x-3 rtl:space-x-reverse">
             <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
                <Folder size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('detail.documents.createFolder')}
             </button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
                <UploadCloud size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('detail.documents.upload')}
             </button>
          </div>
       </div>

       <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             {/* Folders first */}
             {rootDocs.filter(d => d.type === 'folder').map(folder => (
                <div key={folder.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-gray-50 group">
                   <div className="flex justify-between items-start mb-2">
                      <Folder size={32} className="text-blue-400 fill-current" />
                      <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"><MoreVertical size={16} /></button>
                   </div>
                   <h4 className="font-medium text-gray-900 truncate">{folder.name}</h4>
                   <p className="text-xs text-gray-500 mt-1">{folder.children?.length || 0} {t('detail.documents.items')}</p>
                </div>
             ))}
          </div>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{t('detail.documents.files')}</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.documents.name')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.documents.size')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.documents.uploadedBy')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.documents.date')}</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {/* Flatten some files for demo if root list is empty of files */}
                   {rootDocs.flatMap(d => d.type === 'file' ? [d] : (d.children?.filter(c => c.type === 'file') || [])).map(file => (
                      <tr key={file.id} className="hover:bg-gray-50 group">
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                               {getFileIcon(file.fileType)}
                               <span className="ml-3 rtl:mr-3 rtl:ml-0 text-sm font-medium text-gray-900">{file.name}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                               <img src={file.uploadedBy.avatar} className="w-6 h-6 rounded-full mr-2 rtl:ml-2 rtl:mr-0" alt=""/>
                               <span className="text-sm text-gray-900">{file.uploadedBy.name}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(file.uploadDate).toLocaleDateString()}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="text-gray-400 hover:text-blue-600"><Download size={18}/></button>
                               <button className="text-gray-400 hover:text-gray-600"><Clock size={18}/></button>
                               <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={18}/></button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};