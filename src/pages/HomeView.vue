<script setup lang="ts">
import HeroSection from '../components/hero/HeroSection.vue';
import ProductList from '../components/product/ProductList.vue';
import { products } from '../data/products'

const mostOrdered = products.slice(0, 3)
</script>

<template>
  <HeroSection />
  <ProductList title="Mais Pedidos" :products="mostOrdered" />
</template>