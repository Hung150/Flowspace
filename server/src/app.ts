import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app = express();

// ==================== CORS CONFIGURATION ====================
// Allow both development and production frontends
const allowedOrigins = [
  'http://localhost:5173',                     // Vite dev server
  'https://flowspace-app.onrender.com'         // Production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = `The CORS policy for this site does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

// 1. Root route - Welcome page
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: '🚀 Welcome to FlowSpace API',
    version: '2.0.0',
    documentation: '/api/docs',
    health: '/api/health',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (protected)'
      },
      projects: {
        list: 'GET /api/projects (protected)',
        create: 'POST /api/projects (protected)',
        detail: 'GET /api/projects/:id (protected)',
        update: 'PUT /api/projects/:id (protected)',
        delete: 'DELETE /api/projects/:id (protected)'
      },
      tasks: {
        list: 'GET /api/tasks/projects/:projectId/tasks (protected)',
        create: 'POST /api/tasks/projects/:projectId/tasks (protected)',
        detail: 'GET /api/tasks/:id (protected)',
        update: 'PUT /api/tasks/:id (protected)',
        status: 'PATCH /api/tasks/:id/status (protected)',
        delete: 'DELETE /api/tasks/:id (protected)'
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats (protected)'
      }
    },
    github: 'https://github.com/Hung150/Flowspace',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      message: 'CORS is configured for frontend access'
    }
  });
});

// 2. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    message: '✅ FlowSpace API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: allowedOrigins
  });
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 4. API Documentation (HTML page)
app.get('/api/docs', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <title>FlowSpace API Documentation</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
      }
      .container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      header {
        text-align: center;
        margin-bottom: 40px;
      }
      h1 {
        color: #333;
        font-size: 2.5rem;
        margin-bottom: 10px;
      }
      .tagline {
        color: #666;
        font-size: 1.2rem;
        margin-bottom: 30px;
      }
      .badge {
        display: inline-block;
        background: #4f46e5;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.9rem;
        margin: 5px;
      }
      .endpoint {
        background: #f8fafc;
        border-left: 4px solid #4f46e5;
        padding: 20px;
        margin: 20px 0;
        border-radius: 8px;
      }
      .method {
        display: inline-block;
        font-weight: bold;
        padding: 6px 12px;
        border-radius: 4px;
        margin-right: 10px;
        color: white;
      }
      .get { background: #10b981; }
      .post { background: #f59e0b; }
      .put { background: #3b82f6; }
      .patch { background: #8b5cf6; }
      .delete { background: #ef4444; }
      .url {
        font-family: 'Courier New', monospace;
        font-size: 1.1rem;
        color: #1f2937;
      }
      .description {
        margin-top: 10px;
        color: #6b7280;
      }
      .protected {
        display: inline-block;
        background: #fef3c7;
        color: #92400e;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-left: 10px;
      }
      footer {
        margin-top: 40px;
        text-align: center;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
      }
      .github-link {
        display: inline-block;
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        margin-top: 10px;
        transition: transform 0.2s;
      }
      .github-link:hover {
        transform: translateY(-2px);
      }
      .test-buttons {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .test-button {
        background: #4f46e5;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        text-decoration: none;
        display: inline-block;
      }
      .test-button:hover {
        background: #4338ca;
      }
      .cors-info {
        background: #dbeafe;
        border-left: 4px solid #3b82f6;
        padding: 15px;
        margin: 20px 0;
        border-radius: 8px;
      }
      .cors-info h3 {
        color: #1e40af;
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>🚀 FlowSpace API v2.0</h1>
        <p class="tagline">Complete Project Management System with Projects & Tasks</p>
        <div>
          <span class="badge">Node.js</span>
          <span class="badge">Express</span>
          <span class="badge">TypeScript</span>
          <span class="badge">PostgreSQL</span>
          <span class="badge">Prisma</span>
          <span class="badge">JWT Auth</span>
          <span class="badge">CORS Enabled</span>
        </div>
        
        <div class="test-buttons">
          <a href="/api/health" class="test-button" target="_blank">
            Test Health Endpoint
          </a>
          <a href="/" class="test-button" target="_blank">
            View API Root
          </a>
        </div>
      </header>
      
      <div class="cors-info">
        <h3>🌐 CORS Configuration</h3>
        <p><strong>Allowed Origins:</strong></p>
        <ul>
          <li>Development: <code>http://localhost:5173</code></li>
          <li>Production: <code>https://flowspace-app.onrender.com</code></li>
        </ul>
        <p><strong>Status:</strong> ✅ CORS is properly configured for frontend access</p>
      </div>
      
      <section>
        <h2>🔐 Authentication Endpoints</h2>
        
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="url">/api/auth/register</span>
          <p class="description">Register a new user account</p>
        </div>
        
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="url">/api/auth/login</span>
          <p class="description">Authenticate user and get JWT token</p>
        </div>
        
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="url">/api/auth/profile</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Get current user profile</p>
        </div>
        
        <h2 style="margin-top: 40px;">📁 Project Endpoints</h2>
        
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="url">/api/projects</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Get all projects for current user</p>
        </div>
        
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="url">/api/projects</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Create a new project</p>
        </div>
        
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="url">/api/projects/:id</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Get project details with tasks</p>
        </div>
        
        <h2 style="margin-top: 40px;">✅ Task Endpoints</h2>
        
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="url">/api/tasks/projects/:projectId/tasks</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Get all tasks for a project (Kanban ready)</p>
        </div>
        
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="url">/api/tasks/projects/:projectId/tasks</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Create a new task</p>
        </div>
        
        <div class="endpoint">
          <span class="method patch">PATCH</span>
          <span class="url">/api/tasks/:id/status</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Update task status (drag & drop support)</p>
        </div>
        
        <h2 style="margin-top: 40px;">📊 Dashboard Endpoints</h2>
        
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="url">/api/dashboard/stats</span>
          <span class="protected">PROTECTED</span>
          <p class="description">Get dashboard statistics (total projects, active tasks, completed tasks)</p>
          <p style="margin-top: 8px; font-size: 0.9rem; color: #4b5563;">
            <strong>Response:</strong> 
            <code>{"status":"success","data":{"totalProjects":X,"activeTasks":Y,"completedTasks":Z}}</code>
          </p>
        </div>
        
      </section>
      
      <footer>
        <p>🚀 Full-featured backend ready for frontend development!</p>
        <a href="https://github.com/Hung150/Flowspace" class="github-link" target="_blank">
          ⭐ View on GitHub
        </a>
        <p style="margin-top: 20px;">
          <small>API Version 2.0.0 • Server: ${process.env.RENDER_EXTERNAL_URL || 'localhost:5000'} • CORS: Enabled</small>
        </p>
      </footer>
    </div>
  </body>
  </html>`;
  
  res.send(html);
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    status: 'error',
    message: '❌ Route ' + req.originalUrl + ' not found',
    suggestion: 'Try visiting /api/docs for available endpoints',
    timestamp: new Date().toISOString()
  });
});

export default app;
