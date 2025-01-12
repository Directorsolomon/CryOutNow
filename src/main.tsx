import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './lib/firebase'
import { StrictMode } from 'react'
import { AuthProvider } from './contexts/AuthContext' // Corrected import path

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider> {/* Added AuthProvider */}
      <App />
    </AuthProvider> {/* Added AuthProvider */}
  </StrictMode>
)