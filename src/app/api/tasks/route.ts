// src/app/api/tasks/route.ts - Complete update for Edge Config structure

import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import { Task, CreateTaskRequest, Priority, Category, ApiResponse, TaskFilters } from '@/types/task';

// GET /api/tasks - Fetch all tasks from Edge Config
export async function GET(request: NextRequest) {
  console.log('📥 GET /api/tasks called');
  
  try {
    let tasks: Task[] = [];
    
    try {
      // Edge Config structure: { "tasks": [ ... ] }
      const edgeData: unknown = await get('tasks');
      console.log('🔍 Raw Edge Config data:', edgeData);
      
      if (edgeData && typeof edgeData === 'object' && edgeData !== null && 'tasks' in edgeData) {
        const typedData = edgeData as { tasks: Task[] };
        tasks = typedData.tasks || [];
        console.log('✅ Loaded', tasks.length, 'tasks from Edge Config');
      } else if (Array.isArray(edgeData)) {
        // Handle if someone stored array directly
        tasks = edgeData as Task[];
        console.log('✅ Loaded', tasks.length, 'tasks from Edge Config (array format)');
      } else {
        console.log('⚠️ Edge Config data not in expected format, using fallback');
        tasks = getFallbackTasks();
      }
    } catch (edgeConfigError) {
      console.log('⚠️ Edge Config error:', edgeConfigError);
      console.log('📦 Using fallback data instead');
      tasks = getFallbackTasks();
    }
    
    // Extract and apply filters from query parameters
    const { searchParams } = new URL(request.url);
    const filters: TaskFilters = {
      category: searchParams.get('category') as Category || undefined,
      priority: searchParams.get('priority') as Priority || undefined,
      completed: searchParams.get('completed') === 'true' ? true : 
                 searchParams.get('completed') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined
    };

    // Apply filters if any are provided
    const filteredTasks = applyFilters(tasks, filters);
    
    // Build response message
    let message = `Found ${filteredTasks.length} tasks`;
    if (filteredTasks.length !== tasks.length) {
      message += ` (filtered from ${tasks.length} total)`;
    }
    
    const response: ApiResponse<Task[]> = {
      data: filteredTasks,
      success: true,
      message: message
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in GET /api/tasks:', error);
    const errorResponse: ApiResponse<Task[]> = {
      data: [],
      success: false,
      error: 'Failed to fetch tasks'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/tasks - Create new task (simulated - Edge Config is read-only from API)
export async function POST(request: NextRequest) {
  console.log('📥 POST /api/tasks called');
  
  try {
    const body: CreateTaskRequest = await request.json();
    console.log('📨 Received data:', body);
    
    // Enhanced validation
    const validationErrors = validateTaskRequest(body);
    if (validationErrors.length > 0) {
      const errorResponse: ApiResponse<null> = {
        data: null,
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create the new task object
    const newTask: Task = {
      id: generateId(),
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      completed: false,
      priority: body.priority,
      category: body.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: body.dueDate || undefined
    };

    console.log('✅ Created new task:', newTask);

    const response: ApiResponse<Task> = {
      data: newTask,
      success: true,
      message: 'Task created successfully (Note: This is a simulation - real persistence requires Edge Config update via dashboard)'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/tasks:', error);
    
    const errorResponse: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'Failed to create task'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Helper function to apply filters
function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(task => {
    // Category filter
    if (filters.category && task.category !== filters.category) {
      return false;
    }
    
    // Priority filter  
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Completion status filter
    if (filters.completed !== undefined && task.completed !== filters.completed) {
      return false;
    }
    
    // Search filter (searches title and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower) || false;
      return titleMatch || descriptionMatch;
    }
    
    return true;
  });
}

// Enhanced validation function
function validateTaskRequest(body: CreateTaskRequest): string[] {
  const errors: string[] = [];
  
  // Title validation
  if (!body.title) {
    errors.push('Title is required');
  } else if (body.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (body.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  // Description validation
  if (body.description && body.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  // Priority validation
  if (!body.priority) {
    errors.push('Priority is required');
  } else if (!Object.values(Priority).includes(body.priority)) {
    errors.push(`Priority must be one of: ${Object.values(Priority).join(', ')}`);
  }
  
  // Category validation
  if (!body.category) {
    errors.push('Category is required');
  } else if (!Object.values(Category).includes(body.category)) {
    errors.push(`Category must be one of: ${Object.values(Category).join(', ')}`);
  }
  
  // Due date validation
  if (body.dueDate) {
    const dueDate = new Date(body.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('Due date must be a valid ISO date string');
    } else if (dueDate < new Date()) {
      errors.push('Due date cannot be in the past');
    }
  }
  
  return errors;
}

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Fallback data when Edge Config is not available (development/testing)
function getFallbackTasks(): Task[] {
  console.log('📦 Using fallback task data');
  return [
    {
      id: 'fallback-1',
      title: 'Configure Edge Config',
      description: 'Set up Edge Config in Vercel dashboard with proper JSON structure',
      completed: false,
      priority: Priority.HIGH,
      category: Category.LEARNING,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      dueDate: '2024-01-21T23:59:59Z'
    },
    {
      id: 'fallback-2',
      title: 'Test API Endpoints',
      description: 'Verify all CRUD operations work correctly with TypeScript',
      completed: false,
      priority: Priority.MEDIUM,
      category: Category.LEARNING,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z'
    },
    {
      id: 'fallback-3',
      title: 'Deploy to Production',
      description: 'Complete deployment setup and test live API',
      completed: true,
      priority: Priority.HIGH,
      category: Category.LEARNING,
      createdAt: '2024-01-19T15:00:00Z',
      updatedAt: '2024-01-20T12:00:00Z'
    }
  ];
}

/*
WHAT'S NEW IN THIS VERSION:

1. EDGE CONFIG COMPATIBILITY:
   - Handles { "tasks": [...] } structure
   - Also handles direct array format (fallback)
   - Better error handling and logging

2. ENHANCED VALIDATION:
   - Comprehensive input validation
   - Detailed error messages
   - Length limits and format checks

3. IMPROVED FILTERING:
   - More robust filter application
   - Better query parameter handling
   - Clearer response messages

4. BETTER LOGGING:
   - Console logs show what's happening
   - Easier debugging of Edge Config issues
   - Clear fallback notifications

5. TYPE SAFETY:
   - Proper TypeScript throughout
   - Better error handling
   - Null/undefined safety
*/