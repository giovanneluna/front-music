import { BrowserRouter } from 'react-router-dom'
import Header from './components/layout/Header'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {

  return (
    <>
    <BrowserRouter>
     <AuthProvider>
          <ThemeProvider>
            <Header />
          </ThemeProvider>
        </AuthProvider>
        </BrowserRouter>
    </>
  )
}

export default App
