/**
 * Global TypeScript declarations
 */

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

// Extend the global namespace to include our task storage
declare global {
  var latestTasks: TaskItem[] | undefined;
  var latestPhotoId: string | undefined;
}

export {}; 