<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '../../types/product.ts'
import ProductCard from './ProductCard.vue'
import ProductCustomizationModal from './ProductCustomizationModal.vue'
import { useCartStore } from '../../stores/cartStore'
import { Search } from 'lucide-vue-next'
import { showToast } from '../../composables/useToast'

const props = withDefaults(defineProps<{
  title: string
  products: Product[]
  showFilters?: boolean
}>(), {
  showFilters: true
})

const cartStore = useCartStore()

// --- Modal de customização ---
const isModalOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

function openCustomization(product: Product) {
  selectedProduct.value = product
  isModalOpen.value = true
}

function closeCustomization() {
  isModalOpen.value = false
}

function handleConfirm(payload: {
  removedIngredients: string[]
  selectedAddons: { id: number; name: string; price: number }[]
  observation: string
  finalPrice: number
  selectedFlavor?: string
  selectedSize?: string
}) {
  if (!selectedProduct.value) return

  cartStore.addCustomizedItem({
    cartItemId: `${selectedProduct.value.id}-${Date.now()}`,
    productId: selectedProduct.value.id,
    name: selectedProduct.value.name,
    image: selectedProduct.value.image,
    basePrice: selectedProduct.value.price,
    removedIngredients: payload.removedIngredients,
    selectedAddons: payload.selectedAddons,
    observation: payload.observation,
    finalPrice: payload.finalPrice,
    quantity: 1,
    ...(payload.selectedFlavor && { selectedFlavor: payload.selectedFlavor }),
    ...(payload.selectedSize && { selectedSize: payload.selectedSize }),
  })

  showToast(`${selectedProduct.value.name} adicionado ao carrinho!`)
  closeCustomization()
}

// --- Filtros ---
const searchQuery = ref('')
const selectedCategory = ref('')

const categories = computed(() => {
  const cats = props.products.map(p => p.category)
  return [...new Set(cats)]
})

const filteredProducts = computed(() => {
  if (!props.showFilters) return props.products
  return props.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || product.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <section class="bg-bg-hero px-10 pb-10">
    <h2 class="text-4xl text-brown font-bold py-5 text-center">{{ title }}</h2>

    <!-- Barra de pesquisa e filtro -->
    <div v-if="showFilters" class="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
      <!-- Campo de pesquisa -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input v-model="searchQuery" type="text" placeholder="Pesquisar por nome ou ingrediente..." class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-700
                 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                 placeholder:text-gray-400 transition" />
      </div>

      <!-- Dropdown de categoria -->
      <select v-model="selectedCategory" class="px-4 pr-8 py-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-700
               focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
               cursor-pointer transition sm:w-auto w-full self-stretch">
        <option value="">Todas as categorias</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- Grid de produtos -->
    <div v-if="filteredProducts.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product"
        @customize="openCustomization" />
    </div>

    <!-- Mensagem quando não há resultados -->
    <p v-else class="text-center text-gray-400 py-10 text-lg">
      Nenhum produto encontrado.
    </p>

    <!-- Modal de customização -->
    <ProductCustomizationModal v-if="selectedProduct" :product="selectedProduct" :visible="isModalOpen"
      @close="closeCustomization" @confirm="handleConfirm" />
  </section>
</template>
