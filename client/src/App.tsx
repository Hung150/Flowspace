import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import AppRoutes from './routes'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
