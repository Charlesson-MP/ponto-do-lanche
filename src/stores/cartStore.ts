import { defineStore } from 'pinia'
import type { CustomizedCartItem } from '../types/product'

// Chave usada no localStorage
const CART_STORAGE_KEY = 'ponto-do-lanche-cart'

/**
 * Carrega os itens do carrinho salvos no localStorage.
 * Retorna um array vazio caso não haja dados ou ocorra um erro.
 */
function loadCartFromStorage(): CustomizedCartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    if (!data) return []

    const parsed = JSON.parse(data)

    // Validação: se o formato antigo (sem cartItemId), limpar
    if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].cartItemId) {
      localStorage.removeItem(CART_STORAGE_KEY)
      return []
    }

    return parsed
  } catch {
    return []
  }
}

/**
 * Salva os itens do carrinho no localStorage.
 */
function saveCartToStorage(items: CustomizedCartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadCartFromStorage()
  }),
  actions: {
    /**
     * Adiciona um item customizado ao carrinho.
     * NOTA: Em produção, o backend deve recalcular o finalPrice
     * para evitar manipulação pelo frontend.
     */
    addCustomizedItem(item: CustomizedCartItem) {
      this.items.push(item)
      saveCartToStorage(this.items)
    },

    removeItem(cartItemId: string) {
      this.items = this.items.filter(item => item.cartItemId !== cartItemId)
      saveCartToStorage(this.items)
    },

    incrementItem(cartItemId: string) {
      const item = this.items.find(item => item.cartItemId === cartItemId)
      if (item) {
        item.quantity++
      }
      saveCartToStorage(this.items)
    },

    decrementItem(cartItemId: string) {
      const item = this.items.find(item => item.cartItemId === cartItemId)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
        } else {
          this.removeItem(cartItemId)
          return // removeItem já salva no storage
        }
      }
      saveCartToStorage(this.items)
    }
  },
  getters: {
    totalItems: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0),

    totalPrice: (state) =>
      state.items.reduce(
        (total, item) => total + item.finalPrice * item.quantity,
        0
      )
  }
})