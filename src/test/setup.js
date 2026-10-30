import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// vitest corre sin globals: el auto-cleanup de RTL no se registra solo
afterEach(() => {
  cleanup()
})

// la app persiste estilos y texto en localStorage: sin esto, el estado de un
// test se filtraría al siguiente (jsdom comparte el storage entre tests)
beforeEach(() => {
  localStorage.clear()
})

// jsdom no implementa clipboard ni execCommand: se mockean para poder testear
// el boton copiar y el fallback de pegado en texto plano
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn() },
  configurable: true,
})

Object.defineProperty(document, 'execCommand', {
  value: vi.fn(),
  configurable: true,
})
