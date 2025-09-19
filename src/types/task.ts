export interface Task {
  id: string;
  title: string;
  description?: string;  // Optional field (can be undefined)
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: string;     // ISO date string
  updatedAt: string;     // ISO date string
  dueDate?: string;      // Optional ISO date string
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum Category {
  WORK = 'work',
  PERSONAL = 'personal',
  SHOPPING = 'shopping', 
  HEALTH = 'health',
  LEARNING = 'learning'
}

// API request/response types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  dueDate?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  completed?: boolean;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// For filtering tasks
export interface TaskFilters {
  category?: Category;
  priority?: Priority;
  completed?: boolean;
  search?: string;
}

// Dashboard statistics
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: Record<Priority, number>;
  byCategory: Record<Category, number>;
}