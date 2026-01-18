import { Phase, Task } from '../types';

/**
 * Calculates start and end dates for all tasks based on project start date and dependencies.
 * Assumes dependencies are task IDs.
 * A task can start only when all its dependencies are completed.
 * Start Date = Max(ProjectStartDate, Max(DependencyEndDate))
 */
export const calculateSchedule = (projectStartDate: string, phases: Phase[]): Phase[] => {
  if (!projectStartDate) return phases;

  const pStart = new Date(projectStartDate);
  const taskMap = new Map<string, Task & { _endDateObj?: Date }>();

  // 1. Flatten all tasks to a map for easy lookup
  phases.forEach(phase => {
    phase.tasks.forEach(task => {
      taskMap.set(task.id, { ...task });
    });
  });

  // 2. Topological sort or iterative resolution not strictly needed if we just resolve dynamically.
  // However, since dependencies might be in earlier phases or same phase, we need to be careful.
  // We will perform a simple pass. If we encounter a dependency not yet calculated, we calculate it recursively.
  // To avoid infinite loops in circular deps (should be prevented in UI), we'll add a visited set.

  const calculatedTasks = new Map<string, { startDate: string, endDate: string, _endDateObj: Date }>();
  const visiting = new Set<string>();

  const resolveTask = (taskId: string): { startDate: string, endDate: string, _endDateObj: Date } => {
    if (calculatedTasks.has(taskId)) return calculatedTasks.get(taskId)!;
    if (visiting.has(taskId)) {
       console.warn("Circular dependency detected for task", taskId);
       // Fallback to project start to break cycle
       return { 
           startDate: projectStartDate, 
           endDate: new Date(pStart.getTime() + (24*60*60*1000)).toISOString().split('T')[0],
           _endDateObj: new Date(pStart.getTime() + (24*60*60*1000))
       }; 
    }

    visiting.add(taskId);

    const task = taskMap.get(taskId);
    if (!task) {
        // Dependency might be deleted or invalid
        return { 
           startDate: projectStartDate, 
           endDate: projectStartDate, 
           _endDateObj: pStart 
        };
    }

    let maxDependencyEnd = pStart.getTime();

    if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
            const depResult = resolveTask(depId);
            if (depResult._endDateObj.getTime() > maxDependencyEnd) {
                maxDependencyEnd = depResult._endDateObj.getTime();
            }
        });
    }

    // Start date is max dependency end
    // If we want tasks to start the DAY AFTER dependency finishes:
    // const startDateObj = new Date(maxDependencyEnd + (24 * 60 * 60 * 1000));
    // Usually in Gantt software, if Task A ends Day 1 (5pm), Task B starts Day 2 (9am).
    // Let's assume Start Date = Max Dependency End (if simple chain) or +1 day. 
    // For simplicity: Start Date = Max Dependency End.
    
    // Actually, if Task A is 1 day starting Jan 1, it ends Jan 1. Task B starts Jan 2.
    // So we add 1 day to the max end date of dependencies, UNLESS there are no dependencies.
    
    let startDateObj: Date;
    if (task.dependencies && task.dependencies.length > 0) {
       startDateObj = new Date(maxDependencyEnd + (24 * 60 * 60 * 1000));
    } else {
       startDateObj = pStart;
    }

    // End date = Start + Duration - 1 (inclusive) or Start + Duration (exclusive)?
    // Standard: Start Jan 1, Duration 1 day -> End Jan 1.
    // Logic: End = Start + (Duration * 24h) - 24h?
    // Let's stick to End = Start + Duration (days)
    const durationDays = Math.max(1, task.duration || 1);
    // If duration is 1 day, it ends on the same day if we consider working hours, 
    // but for date objects, let's just add duration days to start date.
    const endDateObj = new Date(startDateObj.getTime() + (durationDays * 24 * 60 * 60 * 1000));

    const result = {
        startDate: startDateObj.toISOString().split('T')[0],
        endDate: endDateObj.toISOString().split('T')[0],
        _endDateObj: endDateObj
    };

    visiting.delete(taskId);
    calculatedTasks.set(taskId, result);
    return result;
  };

  // 3. Resolve all
  const newPhases = phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(task => {
          const res = resolveTask(task.id);
          return {
              ...task,
              startDate: res.startDate,
              dueDate: res.endDate // In our type definition, dueDate acts as EndDate
          };
      })
  }));

  return newPhases;
};