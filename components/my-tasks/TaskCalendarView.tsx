import React, { useState } from 'react';
import { Task, Project } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  tasks: (Task & { project: Project; phaseName: string })[];
}

export const TaskCalendarView: React.FC<Props> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getTasksForDay = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr); // Exact match for due date
  };

  const getTaskColor = (status: string) => {
     if (status === 'Completed') return 'bg-green-100 text-green-700 border-green-200';
     if (status === 'Blocked') return 'bg-red-100 text-red-700 border-red-200';
     return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-280px)] flex flex-col">
       <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-900 text-lg">
             {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2 rtl:space-x-reverse">
             <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={20}/></button>
             <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={20}/></button>
          </div>
       </div>

       <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200 overflow-y-auto">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
             <div key={day} className="p-2 text-center text-xs font-bold text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                {day}
             </div>
          ))}
          
          {emptyDays.map(i => <div key={`empty-${i}`} className="bg-gray-50/50 min-h-[100px]"></div>)}
          
          {days.map(day => {
             const dayTasks = getTasksForDay(day);
             const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
             
             return (
                <div key={day} className={`p-2 min-h-[120px] border-b border-gray-100 hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                   <div className={`text-xs font-medium mb-2 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                      {day}
                   </div>
                   <div className="space-y-1">
                      {dayTasks.map(task => (
                         <div 
                           key={task.id} 
                           className={`text-[10px] px-1.5 py-1 rounded border truncate cursor-pointer ${getTaskColor(task.status)}`}
                           title={task.name}
                         >
                            {task.name}
                         </div>
                      ))}
                      {dayTasks.length > 3 && (
                         <div className="text-[10px] text-gray-400 text-center">+ {dayTasks.length - 3} more</div>
                      )}
                   </div>
                </div>
             );
          })}
       </div>
    </div>
  );
};