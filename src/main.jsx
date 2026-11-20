import { createRoot } from 'react-dom/client'
import './fuentes.css'
import App from './App.jsx'
import { EstilosProvider } from './context/EstilosProvider.jsx'

createRoot(document.getElementById('root')).render(
  <EstilosProvider>
    <App />
  </EstilosProvider>,
)
