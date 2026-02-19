<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '../../types/product.ts'
import ProductCard from './ProductCard.vue'
import { useCartStore } from '../../stores/cartStore'
import { Search } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  products: Product[]
  showFilters?: boolean
}>(), {
  showFilters: true
})

const cartStore = useCartStore()

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
        @add-to-cart="cartStore.addItem" />
    </div>

    <!-- Mensagem quando não há resultados -->
    <p v-else class="text-center text-gray-400 py-10 text-lg">
      Nenhum produto encontrado.
    </p>
  </section>
</template>
