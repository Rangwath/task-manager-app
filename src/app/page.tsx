// src/app/page.tsx - Simple API documentation
export default function HomePage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Task Manager API</h1>
      <p>A TypeScript-powered RESTful API built with Next.js</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><strong>GET</strong> /api/tasks - List all tasks</li>
        <li><strong>POST</strong> /api/tasks - Create new task</li>
        <li><strong>GET</strong> /api/health - API health check</li>
      </ul>
      
      <h2>Quick Test:</h2>
      <p>
        <a href="/api/tasks" target="_blank">Test GET /api/tasks</a>
      </p>
      
      <h2>Tech Stack:</h2>
      <ul>
        <li>Next.js 14 (App Router)</li>
        <li>TypeScript</li>
        <li>Vercel Edge Config</li>
      </ul>
    </div>
  );
}