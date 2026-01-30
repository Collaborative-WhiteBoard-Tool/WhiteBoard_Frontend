// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
<script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script>
// import './styles/'

createRoot(document.getElementById('root')!).render(

  <BrowserRouter>
    <App />
    <Toaster />
  </BrowserRouter>

)
