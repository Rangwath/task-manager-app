import { NextRequest, NextResponse } from 'next/server';
import { Task, CreateTaskRequest, Priority, Category, ApiResponse } from '@/types/task';

// GET /api/tasks - Fetch all tasks
export async function GET(request: NextRequest) {
  console.log('📥 GET /api/tasks called');
  
  try {
    // For now, we'll use dummy data (later we'll use Edge Config)
    const dummyTasks: Task[] = [
      {
        id: '1',
        title: 'Learn TypeScript',
        description: 'Understanding interfaces, enums, and types',
        completed: false,
        priority: Priority.HIGH,           // Using the enum!
        category: Category.LEARNING,      // Using the enum!
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        dueDate: '2024-01-20T23:59:59Z'
      },
      {
        id: '2', 
        title: 'Build API endpoints',
        description: 'Create REST API with Next.js',
        completed: true,                   // This one is done!
        priority: Priority.MEDIUM,
        category: Category.LEARNING,
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-15T11:30:00Z'
        // No dueDate - it's optional (?)
      },
      {
        id: '3',
        title: 'Buy groceries',
        // No description - it's optional (?)
        completed: false,
        priority: Priority.LOW,
        category: Category.SHOPPING,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z',
        dueDate: '2024-01-16T18:00:00Z'
      }
    ];

    // Create API response using our interface
    const response: ApiResponse<Task[]> = {
      data: dummyTasks,                          // The actual tasks
      success: true,                             // Operation succeeded  
      message: `Found ${dummyTasks.length} tasks` // Info message
    };

    console.log('✅ Returning', dummyTasks.length, 'tasks');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in GET /api/tasks:', error);
    
    // Error response using our interface
    const errorResponse: ApiResponse<Task[]> = {
      data: [],                           // Empty array for errors
      success: false,                     // Operation failed
      error: 'Failed to fetch tasks'     // Error message
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/tasks - Create a new task  
export async function POST(request: NextRequest) {
  console.log('📥 POST /api/tasks called');
  
  try {
    // Get the request body and tell TypeScript it's a CreateTaskRequest
    const body: CreateTaskRequest = await request.json();
    console.log('📨 Received data:', body);
    
    // Validate required fields (TypeScript helps, but we still need runtime validation)
    if (!body.title) {
      const errorResponse: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Title is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    if (!body.priority) {
      const errorResponse: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Priority is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    if (!body.category) {
      const errorResponse: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Category is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create the full Task object (YOU fill in the missing pieces)
    const newTask: Task = {
      id: generateId(),                    // Generate unique ID
      title: body.title.trim(),            // From user input (cleaned up)
      description: body.description?.trim(), // From user input (might be undefined)
      completed: false,                    // New tasks start as incomplete
      priority: body.priority,             // From user input
      category: body.category,             // From user input  
      createdAt: new Date().toISOString(), // Current timestamp
      updatedAt: new Date().toISOString(), // Current timestamp
      dueDate: body.dueDate               // From user input (might be undefined)
    };

    console.log('✅ Created new task:', newTask);

    // Success response
    const response: ApiResponse<Task> = {
      data: newTask,
      success: true,
      message: 'Task created successfully (prototype mode - not saved permanently)'
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

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/*
WHAT THIS FILE DOES:

1. EXPORTS FUNCTIONS named after HTTP methods:
   - export async function GET() → handles GET /api/tasks
   - export async function POST() → handles POST /api/tasks

2. USES YOUR TYPESCRIPT INTERFACES:
   - Task: for the dummy data objects
   - CreateTaskRequest: for incoming POST data  
   - ApiResponse<T>: for all responses
   - Priority & Category enums: for valid values

3. DEMONSTRATES KEY CONCEPTS:
   - Optional properties (?): description and dueDate can be undefined
   - Type validation: TypeScript helps but you still need runtime checks
   - Filling missing data: YOU create id, timestamps, completed status
   - Error handling: Consistent response format

4. CONSOLE LOGGING:
   - See what's happening in your terminal
   - Helps debug and understand the flow
*/