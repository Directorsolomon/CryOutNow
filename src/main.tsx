import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App'
import './index.css'
import './lib/firebase'
import { AuthProvider } from './context/AuthContext'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider> {/* Added AuthProvider */}
      <App />
    </AuthProvider> {/* Added AuthProvider */}
  </StrictMode>
)