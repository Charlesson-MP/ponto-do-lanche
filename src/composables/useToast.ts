import { reactive } from 'vue'

// Tipos de toast suportados
export type ToastType = 'success' | 'error' | 'info'

// Interface para cada toast individual
export interface Toast {
  id: number
  message: string
  type: ToastType
}

// Estado global reativo — compartilhado entre todos os componentes
const toasts = reactive<Toast[]>([])

let nextId = 0

/**
 * Exibe um toast temporário com a mensagem e tipo informados.
 * O toast desaparece automaticamente após 3 segundos.
 */
export function showToast(message: string, type: ToastType = 'success') {
  const id = nextId++
  toasts.push({ id, message, type })

  // Remove automaticamente após 3s
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.splice(index, 1)
    }
  }, 3000)
}

/**
 * Composable para acessar a lista reativa de toasts.
 * Usado pelo ToastContainer para renderizar os toasts na tela.
 */
export function useToast() {
  return { toasts, showToast }
}
