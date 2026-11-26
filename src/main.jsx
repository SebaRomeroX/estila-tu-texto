import { createRoot } from 'react-dom/client'
import './fuentes.css'
import App from './App.jsx'
import { EstilosProvider } from './context/EstilosProvider.jsx'
import { IdiomaProvider } from './context/IdiomaProvider.jsx'

const root = document.getElementById('root')
if (!root) throw new Error('Falta el nodo #root')

createRoot(root).render(
  <IdiomaProvider>
    <EstilosProvider>
      <App />
    </EstilosProvider>
  </IdiomaProvider>,
)
