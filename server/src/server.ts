import app from './app';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

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

// Thêm health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Kiểm tra database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage()
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
📄 Health: http://localhost:${PORT}/api/health
📚 Docs: http://localhost:${PORT}/api/docs (if available)
⭐ Github: https://github.com/Hung150/Flowspace
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
  app.listen(PORT, HOST, () => {
    console.log(`Server started on port ${PORT} (database may have issues)`);
  });
});
