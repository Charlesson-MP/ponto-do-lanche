<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Menu, ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-vue-next'
import logo from '../../assets/images/logo-ponto-do-lanche.webp'
import { useCartStore } from '../../stores/cartStore'
import { storeToRefs } from 'pinia'
import { useToast } from '../../composables/useToast'
import { useCheckoutModal } from '../../composables/useCheckoutModal'

const { showToast } = useToast()
const { openCheckout } = useCheckoutModal()
const cart = useCartStore()
const { totalItems } = storeToRefs(cart)

const isMenuOpen = ref(false)
const isCartOpen = ref(false)
const isClearConfirmOpen = ref(false)

const menuButton = ref<HTMLElement | null>(null)
const menuDrawer = ref<HTMLElement | null>(null)
const cartButton = ref<HTMLElement | null>(null)
const cartDrawer = ref<HTMLElement | null>(null)

// --- Focus management ---
// Usa nextTick + requestAnimationFrame para garantir que o foco
// seja aplicado depois que o browser terminar de processar o click do mouse.
// Recebe uma função getter para ler a ref LAZILY (depois que o DOM foi atualizado).
function focusAfterRender(getEl: () => HTMLElement | null) {
  nextTick(() => {
    requestAnimationFrame(() => {
      getEl()?.focus()
    })
  })
}

function openMenu() {
  isMenuOpen.value = true
  isCartOpen.value = false
  focusAfterRender(() => menuDrawer.value)
}

function closeMenu() {
  isMenuOpen.value = false
  focusAfterRender(() => menuButton.value)
}

function openCart() {
  isCartOpen.value = true
  isMenuOpen.value = false
  focusAfterRender(() => cartDrawer.value)
}

function closeCart() {
  isCartOpen.value = false
  focusAfterRender(() => cartButton.value)
}

// --- ESC key + Focus trap ---
const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Verifica se o elemento é realmente visível (não display:none)
function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}

// Focus trap genérico para qualquer drawer
function trapFocus(e: KeyboardEvent, drawerEl: HTMLElement) {
  const focusables = Array.from(
    drawerEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  ).filter(isVisible)

  if (focusables.length === 0) {
    e.preventDefault()
    return
  }

  const activeEl = document.activeElement as HTMLElement
  const currentIndex = focusables.findIndex(
    el => el === activeEl || el.contains(activeEl)
  )

  e.preventDefault()

  // Se o foco está no próprio drawer (não em um filho focável), entra na lista
  if (currentIndex === -1) {
    focusables[e.shiftKey ? focusables.length - 1 : 0]?.focus()
    return
  }

  if (e.shiftKey) {
    const prevIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1
    focusables[prevIndex]?.focus()
  } else {
    const nextIndex = currentIndex >= focusables.length - 1 ? 0 : currentIndex + 1
    focusables[nextIndex]?.focus()
  }
}

function handleKeydown(e: KeyboardEvent) {
  // Menu drawer
  if (isMenuOpen.value) {
    if (e.key === 'Escape') { closeMenu(); return }
    if (e.key === 'Tab' && menuDrawer.value) { trapFocus(e, menuDrawer.value) }
    return
  }

  // Cart drawer
  if (isCartOpen.value) {
    if (e.key === 'Escape') { closeCart(); return }
    if (e.key === 'Tab' && cartDrawer.value) { trapFocus(e, cartDrawer.value) }
    return
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
function checkout() {
  closeCart()
  openCheckout()
}

function handleClearCart() {
  cart.clearCart()
  isClearConfirmOpen.value = false
  showToast('Carrinho esvaziado!', 'success')
}
</script>

<template>
  <header class="w-full bg-primary px-1 py-2 flex items-center justify-between shadow-header lg:px-10 relative z-50">
    <div class="flex">
      <button ref="menuButton" class="p-2 lg:hidden" aria-label="Abrir menu de navegação" :aria-expanded="isMenuOpen"
        @click="openMenu">
        <Menu class="w-8 h-8 p-1 text-white" :stroke-width="3" />
      </button>

      <img :src="logo" alt="Logo da lanchonete" class="h-20">
    </div>

    <div v-if="isMenuOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="closeMenu"></div>

    <nav ref="menuDrawer" role="dialog" aria-modal="true" aria-label="Menu de navegação" tabindex="-1"
      :aria-hidden="!isMenuOpen"
      class="bg-white lg:bg-transparent w-64 lg:w-auto fixed lg:static top-0 left-0 h-screen lg:h-auto lg:px-0 lg:py-0 flex flex-col lg:flex-row z-50 lg:z-auto shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 outline-none"
      :class="isMenuOpen ? 'translate-x-0' : '-translate-x-full invisible lg:visible'">
      <div class="flex justify-between items-center p-5 border-b lg:hidden">
        <p class="text-lg font-bold text-gray-800">Menu</p>
        <button
          class="lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 rounded"
          aria-label="Fechar menu" @click="closeMenu">
          <X class="w-6 h-6 text-gray-600 hover:text-gray-900" :stroke-width="2.5" />
        </button>
      </div>
      <ul class="list-none flex flex-col lg:flex-row gap-6 lg:gap-8 items-center p-5 lg:p-0">
        <li><router-link to="/"
            class="text-lg font-bold text-gray-800 lg:text-white lg:hover:bg-primary-dark lg:px-5 lg:py-2 lg:rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 rounded">Home</router-link>
        </li>
        <li><router-link to="/menu"
            class="text-lg font-bold text-gray-800 lg:text-white lg:hover:bg-primary-dark lg:px-5 lg:py-2 lg:rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 rounded">Cardápio</router-link>
        </li>
      </ul>
    </nav>

    <div class="relative">
      <button ref="cartButton" class="p-2" aria-label="Abrir carrinho de compras" :aria-expanded="isCartOpen"
        @click="openCart">
        <ShoppingCart class="w-8 h-8 p-1 text-white" :stroke-width="2" />
      </button>

      <span v-if="totalItems > 0"
        class="absolute w-4 h-4 bg-accent bottom-8 left-5 rounded-full text-xs text-center text-brown">{{ totalItems
        }}</span>
    </div>

    <div v-if="isCartOpen" class="fixed inset-0 bg-black/50 z-40" @click="closeCart"></div>

    <div ref="cartDrawer" role="dialog" aria-modal="true" aria-label="Carrinho de compras" tabindex="-1"
      class="fixed top-0 right-0 h-screen w-80 bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out flex flex-col outline-none"
      :aria-hidden="!isCartOpen" :class="isCartOpen ? 'translate-x-0' : 'translate-x-full invisible'">
      <div class="flex justify-between items-center p-5 border-b shrink-0">
        <div class="flex items-center gap-2">
          <p class="text-lg font-bold text-gray-800">Carrinho</p>
          <button v-if="totalItems > 0" @click="isClearConfirmOpen = true"
            class="text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50">
            Limpar
          </button>
        </div>
        <button aria-label="Fechar carrinho" @click="closeCart">
          <X class="w-6 h-6 text-gray-600 hover:text-gray-900" :stroke-width="2.5" />
        </button>
      </div>

      <div class="flex-1 p-5 overflow-y-auto">
        <ul v-if="totalItems > 0" class="flex flex-col gap-4">
          <li v-for="item in cart.items" :key="item.cartItemId" class="flex items-start gap-4 border-b pb-4">
            <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded-md flex-shrink-0">

            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-800 text-sm">{{ item.name }}</h4>

              <!-- Detalhes de bebida (sabor e tamanho) -->
              <div v-if="item.selectedFlavor || item.selectedSize" class="text-xs text-teal-600 mt-0.5 font-medium">
                🥤 {{ item.selectedFlavor }}<span v-if="item.selectedFlavor && item.selectedSize"> · </span>{{
                  item.selectedSize }}
              </div>

              <!-- Detalhes da customização -->
              <div v-if="item.removedIngredients.length > 0" class="text-xs text-red-400 mt-0.5">
                Sem: {{ item.removedIngredients.join(', ') }}
              </div>
              <div v-if="item.selectedAddons.length > 0" class="text-xs text-green-600 mt-0.5">
                + {{item.selectedAddons.map(a => a.name).join(', ')}}
              </div>
              <div v-if="item.observation" class="text-xs text-gray-400 italic mt-0.5 truncate">
                "{{ item.observation }}"
              </div>

              <p class="text-accent font-bold text-sm mt-1">R$ {{ item.finalPrice.toFixed(2) }}</p>

              <div class="flex items-center gap-2 mt-2">
                <button @click="cart.decrementItem(item.cartItemId)" class="bg-gray-200 p-1 rounded hover:bg-gray-300">
                  <Minus class="w-4 h-4 text-gray-700" />
                </button>
                <span class="text-sm font-bold text-gray-700">{{ item.quantity }}</span>
                <button @click="cart.incrementItem(item.cartItemId)" class="bg-gray-200 p-1 rounded hover:bg-gray-300">
                  <Plus class="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            <button @click="cart.removeItem(item.cartItemId)"
              class="text-red-500 hover:text-red-700 flex-shrink-0 mt-1">
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
        <button @click="checkout"
          class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800">
          Finalizar Pedido
        </button>
      </div>

    </div>

    <!-- Modal de Confirmação para Limpar Carrinho -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isClearConfirmOpen" class="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4"
          @click.self="isClearConfirmOpen = false">
          <div class="bg-white rounded-2xl w-full max-w-[320px] p-6 shadow-2xl flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">Limpar carrinho?</h3>
            <p class="text-sm text-gray-500 mb-6">Essa ação removerá todos os itens e não pode ser desfeita.</p>
            <div class="flex flex-col w-full gap-2">
              <button @click="handleClearCart"
                class="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
                Sim, limpar tudo
              </button>
              <button @click="isClearConfirmOpen = false"
                class="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.fade-enter-active {
  animation: fade-in 0.25s ease-out;
}

.fade-leave-active {
  animation: fade-out 0.2s ease-in forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>