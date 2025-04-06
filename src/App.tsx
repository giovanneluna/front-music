import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import SuggestionsPage from './pages/Suggestions/SuggestionsPage'
import { useAuth } from './contexts/AuthContext'
import { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/suggestions" 
                  element={
                    <PrivateRoute>
                      <SuggestionsPage />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1>Página não encontrada</h1>
                    <p>A página que você está procurando não existe.</p>
                  </div>
                } />
              </Routes>
            </Layout>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
