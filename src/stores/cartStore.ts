import { defineStore } from 'pinia';
import type { Product, CartItem } from '../types/product';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
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
    },
    removeItem(productId: number) {
      this.items = this.items.filter(item => item.id !== productId)
    },
    incrementItem(productId: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        item.quantity++
      }
    },
    decrementItem(productId: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
        } else {
          this.removeItem(productId)
        }
      }
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