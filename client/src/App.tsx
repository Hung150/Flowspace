import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext' 
import AppRoutes from './routes'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider> {/* ← THÊM DÒNG NÀY, BAO QUANH AppRoutes */}
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
