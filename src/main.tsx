import { createRoot } from 'react-dom/client'
import './fuentes.css'
import App from './App'
import { EstilosProvider } from './context/EstilosProvider'
import { IdiomaProvider } from './context/IdiomaProvider'

const root = document.getElementById('root')
if (!root) throw new Error('Falta el nodo #root')

createRoot(root).render(
  <IdiomaProvider>
    <EstilosProvider>
      <App />
    </EstilosProvider>
  </IdiomaProvider>,
)
