<script setup lang="ts">
import { ref } from 'vue'
import { Menu, ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-vue-next'
import logo from '../../assets/images/logo-ponto-do-lanche.webp'
import { useCartStore } from '../../stores/cartStore'
import { storeToRefs } from 'pinia'

const cart = useCartStore()
const { totalItems } = storeToRefs(cart)


const isMenuOpen = ref(false)
const isCartOpen = ref(false)
</script>

<template>
  <header class="w-full bg-primary px-1 py-2 flex items-center justify-between lg:px-10">
    <div class="flex">
      <button class="p-2 lg:hidden" @click="isMenuOpen = true">
        <Menu class="w-8 h-8 p-1 text-white" :stroke-width="3" />
      </button>

      <img :src="logo" alt="Logo da lanchonete" class="h-20">
    </div>

    <div v-if="isMenuOpen" class="fixed inset-0 bg-black/50 z-0 lg:hidden" @click="isMenuOpen = false"></div>

    <nav
      class="bg-white lg:bg-transparent w-64 lg:w-auto fixed lg:static top-0 left-0 h-screen lg:h-auto lg:px-0 lg:py-0 flex flex-col lg:flex-row z-10 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0"
      :class="isMenuOpen ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex justify-between items-center p-5 border-b lg:hidden">
        <p class="text-lg font-bold text-gray-800">Menu</p>
        <button class="lg:hidden" @click="isMenuOpen = false">
          <X class="w-6 h-6 text-gray-600 hover:text-gray-900" :stroke-width="2.5" />
        </button>
      </div>
      <ul class="list-none flex flex-col lg:flex-row gap-6 lg:gap-8 items-center p-5 lg:p-0">
        <li><a href="/"
            class="text-lg font-bold text-gray-800 lg:text-white hover:text-primary lg:hover:text-accent transition-colors">Home</a>
        </li>
        <li><a href="/menu"
            class="text-lg font-bold text-gray-800 lg:text-white hover:text-primary lg:hover:text-accent transition-colors">Cardápio</a>
        </li>
      </ul>
    </nav>

    <div class="relative">
      <button class="p-2" @click="isCartOpen = true">
        <ShoppingCart class="w-8 h-8 p-1 text-white" :stroke-width="2" />
      </button>

      <span v-if="totalItems > 0"
        class="absolute w-4 h-4 bg-accent bottom-8 left-5 rounded-full text-xs text-center text-brown">{{ totalItems
        }}</span>
    </div>

    <div v-if="isCartOpen" class="fixed inset-0 bg-black/50 z-10" @click="isCartOpen = false"></div>

    <div
      class="fixed top-0 right-0 h-screen w-80 bg-white z-20 shadow-xl transition-transform duration-300 ease-in-out flex flex-col"
      :class="isCartOpen ? 'translate-x-0' : 'translate-x-full'">
      <div class="flex justify-between items-center p-5 border-b">
        <p class="text-lg font-bold text-gray-800">Carrinho</p>
        <button @click="isCartOpen = false">
          <X class="w-6 h-6 text-gray-600 hover:text-gray-900" :stroke-width="2.5" />
        </button>
      </div>

      <div class="flex-1 p-5 overflow-y-auto">
        <ul v-if="totalItems > 0" class="flex flex-col gap-4">
          <li v-for="item in cart.items" :key="item.id" class="flex items-center gap-4 border-b pb-4">
            <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded-md">

            <div class="flex-1">
              <h4 class="font-bold text-gray-800 text-sm">{{ item.name }}</h4>
              <p class="text-accent font-bold text-sm">R$ {{ item.price.toFixed(2) }}</p>

              <div class="flex items-center gap-2 mt-2">
                <button @click="cart.decrementItem(item.id)" class="bg-gray-200 p-1 rounded hover:bg-gray-300">
                  <Minus class="w-4 h-4 text-gray-700" />
                </button>
                <span class="text-sm font-bold text-gray-700">{{ item.quantity }}</span>
                <button @click="cart.incrementItem(item.id)" class="bg-gray-200 p-1 rounded hover:bg-gray-300">
                  <Plus class="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            <button @click="cart.removeItem(item.id)" class="text-red-500 hover:text-red-700">
              <Trash2 class="w-5 h-5" />
            </button>
          </li>
        </ul>
        <p v-else class="text-gray-500 text-center mt-10">Seu carrinho está vazio.</p>
      </div>

      <div v-if="totalItems > 0" class="p-5 border-t bg-gray-50">
        <div class="flex justify-between items-center mb-4">
          <p class="text-lg font-bold text-gray-800">Total</p>
          <p class="text-xl font-bold text-primary">R$ {{ cart.totalPrice.toFixed(2) }}</p>
        </div>
        <button class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors">
          Finalizar Pedido
        </button>
      </div>
    </div>
  </header>
</template>