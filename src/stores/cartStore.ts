import { defineStore } from 'pinia';
import type { Product, CartItem } from '../types/product';

// Chave usada no localStorage
const CART_STORAGE_KEY = 'ponto-do-lanche-cart'

/**
 * Carrega os itens do carrinho salvos no localStorage.
 * Retorna um array vazio caso não haja dados ou ocorra um erro.
 */
function loadCartFromStorage(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Salva os itens do carrinho no localStorage.
 */
function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadCartFromStorage()
  }),
  actions: {
    addItem(product: Product) {
      const existingItem = this.items.find(
        item => item.id === product.id
      )

      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          ...product,
          quantity: 1
        })
      }
      saveCartToStorage(this.items)
    },
    removeItem(productId: number) {
      this.items = this.items.filter(item => item.id !== productId)
      saveCartToStorage(this.items)
    },
    incrementItem(productId: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        item.quantity++
      }
      saveCartToStorage(this.items)
    },
    decrementItem(productId: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
        } else {
          this.removeItem(productId)
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
        (total, item) => total + item.price * item.quantity,
        0
      )
  }
});