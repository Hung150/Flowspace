# 🚀 FlowSpace - Modern Project Management Platform

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://flowspace-app.onrender.com/#/)
[![Frontend](https://img.shields.io/badge/frontend-React-61DAFB)](https://github.com/Hung150/Flowspace/tree/main/client)
[![Backend](https://img.shields.io/badge/backend-Express-000000)](https://github.com/Hung150/Flowspace/tree/main/server)
[![Database](https://img.shields.io/badge/database-PostgreSQL-336791)](https://render.com)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A full-stack project management application with real-time task tracking, team collaboration, and beautiful Kanban interface. Built with modern technologies and deployed on Render.

## ✨ Live Demo

- **🎯 Frontend Application:** [https://flowspace-app.onrender.com/#/](https://flowspace-app.onrender.com/#/)
- **🔧 Backend API:** [https://flowspace-api.onrender.com/](https://flowspace-api.onrender.com/)
- **📚 API Documentation:** [https://flowspace-api.onrender.com/api/docs](https://flowspace-api.onrender.com/api/docs)

## 📱 Features

### 🎯 Core Features
- ✅ **User Authentication** - Secure register/login with JWT
- ✅ **Project Management** - Create, read, update, and delete projects
- ✅ **Task Management** - Full CRUD operations for tasks
- ✅ **Kanban Board** - Visual task management with drag & drop
- ✅ **Real-time Updates** - Instant status changes
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

### 🛠️ Technical Features
- ⚡ **Fast Performance** - Built with Vite and optimized React
- 🔒 **Type Safety** - Full TypeScript integration
- 🎨 **Modern UI** - Tailwind CSS with beautiful components
- 📱 **Progressive Web App** - Works offline
- 🔄 **State Management** - React Query for efficient data fetching
- 🗄️ **Database ORM** - Prisma with PostgreSQL

## 🏗️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Library | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool | 4.x |
| Tailwind CSS | Styling | 3.x |
| React Router | Routing | 6.x |
| TanStack Query | State Management | 5.x |
| Axios | HTTP Client | 1.x |
| React Hot Toast | Notifications | 2.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18.x |
| Express | Web Framework | 4.x |
| TypeScript | Type Safety | 5.x |
| Prisma | Database ORM | 5.x |
| PostgreSQL | Database | 16 |
| JWT | Authentication | 9.x |
| CORS | Cross-Origin | 1.x |
| Bcrypt | Password Hashing | 5.x |

### Deployment & Infrastructure
| Service | Purpose |
|---------|---------|
| Render | Hosting (Frontend, Backend, Database) |
| GitHub | Version Control |
| PostgreSQL | Database (Render Managed) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- PostgreSQL (for local development)

### 1. Clone the Repository
```bash
git clone https://github.com/Hung150/Flowspace.git
cd Flowspace
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```
Backend will run at: `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```
Frontend will run at: `http://localhost:5173`

## 📁 Project Structure

```
Flowspace/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   ├── contexts/         # React Contexts
│   │   ├── hooks/           # Custom React Hooks
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Services
│   │   ├── types/           # TypeScript Type Definitions
│   │   └── utils/           # Utility Functions
│   ├── public/              # Static Assets
│   ├── index.html           # HTML Entry Point
│   └── vite.config.ts       # Vite Configuration
│
├── server/                   # Express Backend
│   ├── src/
│   │   ├── controllers/     # Request Controllers
│   │   ├── middleware/      # Custom Middleware
│   │   ├── routes/          # API Routes
│   │   ├── utils/           # Utility Functions
│   │   ├── app.ts           # Express App Configuration
│   │   └── server.ts        # Server Entry Point
│   ├── prisma/
│   │   ├── schema.prisma    # Database Schema
│   │   └── migrations/      # Database Migrations
│   └── package.json         # Backend Dependencies
│
└── README.md                # Project Documentation
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Security
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# CORS Configuration
CLIENT_URL="https://flowspace-app.onrender.com"
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL="https://flowspace-api.onrender.com"

# App Configuration
VITE_APP_TITLE="FlowSpace"
VITE_APP_DESCRIPTION="Modern Project Management Platform"
```

## 📡 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | User login | No |
| `GET` | `/api/auth/profile` | Get user profile | Yes |

### Project Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/projects` | Get all user projects | Yes |
| `POST` | `/api/projects` | Create new project | Yes |
| `GET` | `/api/projects/:id` | Get project details | Yes |
| `PUT` | `/api/projects/:id` | Update project | Yes |
| `DELETE` | `/api/projects/:id` | Delete project | Yes |

### Task Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/tasks/projects/:projectId/tasks` | Get project tasks | Yes |
| `POST` | `/api/tasks/projects/:projectId/tasks` | Create new task | Yes |
| `PATCH` | `/api/tasks/:id/status` | Update task status | Yes |
| `PUT` | `/api/tasks/:id` | Update task | Yes |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes |

**Full API Documentation:** [https://flowspace-api.onrender.com/api/docs](https://flowspace-api.onrender.com/api/docs)

## 🚀 Deployment

### Render Deployment
This project is configured for easy deployment on Render:

#### 1. Database (PostgreSQL)
- Create a new PostgreSQL database on Render
- Copy the internal database URL

#### 2. Backend Service
- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Start Command:** `node dist/server.js`
- **Environment Variables:**
  - `DATABASE_URL`: Your PostgreSQL URL
  - `JWT_SECRET`: Secure random string
  - `CLIENT_URL`: Your frontend URL
  - `NODE_ENV`: `production`

#### 3. Frontend Service
- **Build Command:** `cd client && npm install && npm run build`
- **Publish Directory:** `client/dist`
- **Environment Variables:**
  - `VITE_API_URL`: Your backend API URL

### Manual Deployment
1. Build frontend: `cd client && npm run build`
2. Build backend: `cd server && npm run build`
3. Deploy `client/dist` to any static hosting
4. Deploy backend to any Node.js hosting

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
```bash
# Ensure CLIENT_URL is set correctly in backend
CLIENT_URL=https://flowspace-app.onrender.com
```

#### 2. Database Connection Issues
- Render free tier databases sleep after 90 minutes of inactivity
- First request may take 30-60 seconds to wake up the database
- Check Render dashboard for database status

#### 3. Routing Issues
- Frontend uses HashRouter for compatibility
- Always use URLs with `#/` prefix
- Example: `https://flowspace-app.onrender.com/#/login`

#### 4. Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Debugging
```bash
# Check backend logs on Render
1. Go to Render dashboard
2. Select flowspace-api service
3. Click "Logs" tab

# Check frontend console
1. Open browser DevTools (F12)
2. Check Console and Network tabs
```

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time collaboration with WebSockets
- [ ] File uploads and attachments
- [ ] Team and user management
- [ ] Calendar view and deadlines
- [ ] Email notifications
- [ ] Analytics and reporting
- [ ] Dark mode theme
- [ ] Keyboard shortcuts

### Technical Improvements
- [ ] Unit and integration tests
- [ ] End-to-end testing with Cypress
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] API rate limiting
- [ ] Advanced caching strategies

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Update documentation as needed
- Add tests for new features
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Render](https://render.com/) - Deployment platform
- [Heroicons](https://heroicons.com/) - Icons

## 📞 Support

For support, email luonghung152@gmail.com or create an issue in the [GitHub repository](https://github.com/Hung150/Flowspace/issues).

---

<div align="center">
  
Made with ❤️ by [Hung Luong](https://github.com/Hung150)

⭐ **Star this repo if you found it useful!** ⭐

</div>

## 🌐 Quick Links
- [Live Demo](https://flowspace-app.onrender.com/#/)
- [API Documentation](https://flowspace-api.onrender.com/api/docs)
- [Backend API](https://flowspace-api.onrender.com/)
- [GitHub Repository](https://github.com/Hung150/Flowspace)
- [Report Bug](https://github.com/Hung150/Flowspace/issues)
- [Request Feature](https://github.com/Hung150/Flowspace/issues)

---

*Last updated: January 2024*
