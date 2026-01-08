import app from './app';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// QUAN TRỌNG: Import các routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Khởi tạo Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function setupDatabase() {
  try {
    console.log('🔄 Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Kiểm tra các table cần thiết
    const requiredTables = ['User', 'Project', 'Task', 'Report', 'Member', 'ProjectStats', 'Activity'];
    
    console.log('📊 Checking required tables...');
    
    for (const table of requiredTables) {
      try {
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          ) as "tableExists";
        `;
        
        const tableExists = (result as any[])[0]?.tableExists;
        
        if (tableExists) {
          console.log(`✅ Table ${table} exists`);
        } else {
          console.log(`⚠️ Table ${table} does not exist`);
        }
      } catch (error) {
        console.log(`⚠️ Could not check table ${table}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // Chạy Prisma migration nếu cần
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Running in production mode, applying migrations...');
      try {
        const { execSync } = require('child_process');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Prisma migrations deployed successfully');
      } catch (migrateError: any) {
        console.error('❌ Migration failed, trying db push...');
        try {
          const { execSync } = require('child_process');
          execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
          console.log('✅ Database schema pushed successfully');
        } catch (pushError: any) {
          console.error('❌ Both migrations and db push failed:', pushError.message);
          console.log('⚠️ Continuing with existing schema...');
        }
      }
    } else {
      console.log('🔧 Running in development mode, checking for schema changes...');
      try {
        const { execSync } = require('child_process');
        execSync('npx prisma migrate dev --name update-schema --create-only', { stdio: 'inherit' });
        console.log('✅ Schema checked successfully');
      } catch (error) {
        console.log('⚠️ Schema check completed or already up to date');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    
    // Thử lại connection sau 5 giây
    console.log('🔄 Retrying database connection in 5 seconds...');
    setTimeout(async () => {
      try {
        await prisma.$connect();
        console.log('✅ Reconnected to database');
      } catch (retryError) {
        console.error('❌ Failed to reconnect:', retryError instanceof Error ? retryError.message : 'Unknown error');
      }
    }, 5000);
  }
}

// ==================== THÊM ROUTES VÀO APP ====================
// QUAN TRỌNG: Phải thêm các routes vào app trước khi start server

// Health check endpoint (đặt trước các routes khác)
app.get('/api/health', async (req, res) => {
  try {
    // Kiểm tra database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      routes: {
        auth: '/api/auth',
        projects: '/api/projects',
        tasks: '/api/tasks',
        dashboard: '/api/dashboard',
        reports: '/api/reports'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Thêm các API routes
console.log('🔗 Mounting API routes...');

// Đảm bảo routes được mount với prefix /api
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

console.log('✅ API routes mounted successfully');
console.log('📋 Available endpoints:');
console.log('   - GET    /api/health');
console.log('   - GET    /api/projects');
console.log('   - POST   /api/projects');
console.log('   - GET    /api/tasks');
console.log('   - GET    /api/dashboard/stats');
console.log('   - GET    /api/reports');

// 404 handler cho API routes không tồn tại
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    availableEndpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/projects',
      '/api/tasks',
      '/api/dashboard/stats',
      '/api/reports'
    ]
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 FlowSpace API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard',
      reports: '/api/reports'
    },
    documentation: 'See /api/health for more details',
    github: 'https://github.com/Hung150/Flowspace'
  });
});

// Xử lý shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
setupDatabase().then(() => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`
---
✅ FlowSpace Server Started
---
✅ Local: http://localhost:${PORT}
🌐 Production: https://flowspace-api.onrender.com
📄 Health: https://flowspace-api.onrender.com/api/health
📚 Docs: https://flowspace-api.onrender.com/api/docs
⭐ Github: https://github.com/Hung150/Flowspace
---
📋 Available Endpoints:
   - GET    /api/health
   - GET    /api/projects
   - POST   /api/projects
   - GET    /api/tasks
   - GET    /api/dashboard/stats
   - GET    /api/reports
---
⏰ ${new Date().toLocaleString()}
---
    `);
  });
  
  // Handle server errors
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
    }
  });
  
}).catch((error: any) => {
  console.error('❌ Failed to setup database:', error);
  console.log('⚠️ Starting server anyway...');
  
  // Vẫn start server ngay cả khi database có vấn đề
  const server = app.listen(PORT, HOST, () => {
    console.log(`⚠️ Server started on port ${PORT} (database may have issues)`);
    console.log('⚠️ API routes may not work without database connection');
  });
});
