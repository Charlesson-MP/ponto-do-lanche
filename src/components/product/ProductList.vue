<script setup lang="ts">
import type { Product } from '../../types/product.ts'
import ProductCard from './ProductCard.vue'
import { useCartStore } from '../../stores/cartStore'

const props = defineProps<{
  title: string
  products: Product[]
}>()

const cartStore = useCartStore()
</script>

<template>
  <section class="bg-bg-hero px-10 pb-10">
    <h2 class="text-4xl text-brown font-bold py-5 text-center">{{ title }}</h2>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in products" :key="product.id" :product="product" @add-to-cart="cartStore.addItem" />
    </div>
  </section>
</template>