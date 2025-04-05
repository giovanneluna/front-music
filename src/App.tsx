import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
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
