import app from './app';
import { PrismaClient } from '@prisma/client';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔄 Checking database connection and tables...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Kiểm tra nếu table User đã tồn tại
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'User'
        ) as "userTableExists";
      `;
      
      const userTableExists = (result as any[])[0]?.userTableExists;
      
      if (!userTableExists) {
        console.log('📦 Database tables not found. Running migrations...');
        
        // Cách 1: Try to run migrations
        try {
          const { execSync } = require('child_process');
          console.log('Running prisma migrate deploy...');
          execSync('npx prisma migrate deploy', { stdio: 'inherit' });
          console.log('✅ Prisma migrations completed');
        } catch (migrateError: any) {
          console.log('⚠️ Prisma migrate failed, trying db push...');
          try {
            const { execSync } = require('child_process');
            execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
            console.log('✅ Prisma db push completed');
          } catch (pushError: any) {
            console.error('❌ Both migrations failed:', pushError.message);
            console.log('📝 Creating basic tables manually...');
            
            // Tạo basic tables manually
            await createBasicTables();
          }
        }
      } else {
        console.log('✅ Database tables already exist');
      }
      
    } catch (queryError: any) {
      console.error('❌ Error checking tables:', queryError.message);
      console.log('📝 Creating basic tables...');
      await createBasicTables();
    }
    
  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    console.log('⚠️ Starting server anyway, but database may not work properly');
  }
}

async function createBasicTables() {
  try {
    console.log('🛠️ Creating basic tables...');
    
    // Tạo table User
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        password TEXT NOT NULL
      )
    `;
    
    // Tạo table Project
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Project" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        "ownerId" TEXT NOT NULL REFERENCES "User"(id),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Tạo table Task
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Task" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'TODO',
        priority TEXT,
        "dueDate" TIMESTAMP WITH TIME ZONE,
        "order" INTEGER DEFAULT 0,
        "projectId" TEXT NOT NULL REFERENCES "Project"(id),
        "assigneeId" TEXT REFERENCES "User"(id),
        "creatorId" TEXT NOT NULL REFERENCES "User"(id),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Basic tables created successfully');
    
  } catch (error: any) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

// Setup database trước khi start server
setupDatabase().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`
---
✅ FlowSpace Server Started
---
✅ Local: http://localhost:${PORT}
🌐 Production: https://flowspace-api.onrender.com
📄 Health: http://localhost:${PORT}/api/health
📚 Docs: http://localhost:${PORT}/api/docs
⭐ Github: https://github.com/Hung150/Flowspace
---
⏰ ${new Date().toLocaleString()}
---
    `);
  });
}).catch((error: any) => {
  console.error('❌ Failed to setup database:', error);
  process.exit(1);
});
