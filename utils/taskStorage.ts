/**
 * Task Storage Utility
 * 
 * Provides a consistent way to store and retrieve tasks across the app,
 * with both in-memory cache and persistent storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

// Keys for storage
const KEYS = {
  LATEST_TASKS: 'acne-app:latest-tasks',
  LATEST_PHOTO_ID: 'acne-app:latest-photo-id',
  TASKS_BY_PHOTO_PREFIX: 'acne-app:tasks-for-photo:',
};

// In-memory cache to avoid excessive AsyncStorage calls
let memoryCache: {
  latestTasks?: TaskItem[];
  latestPhotoId?: string;
  tasksByPhotoId: Record<string, TaskItem[]>;
} = {
  tasksByPhotoId: {},
};

/**
 * Stores the latest tasks and photo ID 
 */
export const storeLatestTasks = async (tasks: TaskItem[], photoId: string) => {
  try {
    // Update memory cache
    memoryCache.latestTasks = tasks;
    memoryCache.latestPhotoId = photoId;
    memoryCache.tasksByPhotoId[photoId] = tasks;
    
    // Update global variables for immediate cross-screen access
    global.latestTasks = tasks;
    global.latestPhotoId = photoId;
    
    // Store in AsyncStorage for persistence
    const tasksJson = JSON.stringify(tasks);
    await AsyncStorage.setItem(KEYS.LATEST_TASKS, tasksJson);
    await AsyncStorage.setItem(KEYS.LATEST_PHOTO_ID, photoId);
    await AsyncStorage.setItem(`${KEYS.TASKS_BY_PHOTO_PREFIX}${photoId}`, tasksJson);
    
    console.log(`Successfully stored ${tasks.length} tasks for photo ${photoId}`);
    return true;
  } catch (error) {
    console.error('Error storing tasks:', error);
    return false;
  }
};

/**
 * Retrieves the latest tasks
 */
export const getLatestTasks = async (): Promise<TaskItem[] | null> => {
  try {
    // Check memory cache first
    if (memoryCache.latestTasks) {
      return memoryCache.latestTasks;
    }
    
    // Check global variable next
    if (global.latestTasks) {
      memoryCache.latestTasks = global.latestTasks;
      return global.latestTasks;
    }
    
    // Fall back to AsyncStorage
    const tasksJson = await AsyncStorage.getItem(KEYS.LATEST_TASKS);
    if (tasksJson) {
      const tasks = JSON.parse(tasksJson) as TaskItem[];
      memoryCache.latestTasks = tasks;
      global.latestTasks = tasks;
      return tasks;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving latest tasks:', error);
    return null;
  }
};

/**
 * Retrieves the latest photo ID
 */
export const getLatestPhotoId = async (): Promise<string | null> => {
  try {
    // Check memory cache first
    if (memoryCache.latestPhotoId) {
      return memoryCache.latestPhotoId;
    }
    
    // Check global variable next
    if (global.latestPhotoId) {
      memoryCache.latestPhotoId = global.latestPhotoId;
      return global.latestPhotoId;
    }
    
    // Fall back to AsyncStorage
    const photoId = await AsyncStorage.getItem(KEYS.LATEST_PHOTO_ID);
    if (photoId) {
      memoryCache.latestPhotoId = photoId;
      global.latestPhotoId = photoId;
      return photoId;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving latest photo ID:', error);
    return null;
  }
};

/**
 * Gets tasks for a specific photo ID
 */
export const getTasksForPhoto = async (photoId: string): Promise<TaskItem[] | null> => {
  try {
    // Check memory cache first
    if (memoryCache.tasksByPhotoId[photoId]) {
      return memoryCache.tasksByPhotoId[photoId];
    }
    
    // Fall back to AsyncStorage
    const tasksJson = await AsyncStorage.getItem(`${KEYS.TASKS_BY_PHOTO_PREFIX}${photoId}`);
    if (tasksJson) {
      const tasks = JSON.parse(tasksJson) as TaskItem[];
      memoryCache.tasksByPhotoId[photoId] = tasks;
      return tasks;
    }
    
    return null;
  } catch (error) {
    console.error(`Error retrieving tasks for photo ${photoId}:`, error);
    return null;
  }
};

export default {
  storeLatestTasks,
  getLatestTasks,
  getLatestPhotoId,
  getTasksForPhoto,
}; 