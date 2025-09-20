import { NextRequest, NextResponse } from 'next/server';
import { Task, CreateTaskRequest, Priority, Category, ApiResponse, TaskFilters } from '@/types/task';
import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'tasks.json');

// Helper function to read tasks from file
async function readTasksFromFile(): Promise<Task[]> {
  try {
    const fileContent = await fs.readFile(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as Task[];
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

// Helper function to write tasks to file
async function writeTasksToFile(tasks: Task[]): Promise<void> {
  try {
    await fs.writeFile(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing tasks file:', error);
    throw error;
  }
}

// GET /api/tasks - Fetch all tasks
export async function GET(request: NextRequest) {
  console.log('📥 GET /api/tasks called');

  try {
    // Read tasks from file
    const allTasks = await readTasksFromFile();

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
    const filteredTasks = applyFilters(allTasks, filters);

    // Build response message
    let message = `Found ${filteredTasks.length} tasks`;
    if (filteredTasks.length !== allTasks.length) {
      message += ` (filtered from ${allTasks.length} total)`;
    }

    const response: ApiResponse<Task[]> = {
      data: filteredTasks,
      success: true,
      message: message
    };

    console.log(`✅ Returning ${filteredTasks.length} tasks`);
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

// POST /api/tasks - Create new task (persisted to file)
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

    // Read current tasks, add new task, and write back to file
    const currentTasks = await readTasksFromFile();
    currentTasks.push(newTask);
    await writeTasksToFile(currentTasks);

    console.log('✅ Created new task:', newTask);
    console.log(`📊 Total tasks now: ${currentTasks.length}`);

    const response: ApiResponse<Task> = {
      data: newTask,
      success: true,
      message: 'Task created successfully and saved to file'
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
    }
    // Remove past date check for prototyping flexibility
  }
  
  return errors;
}

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}