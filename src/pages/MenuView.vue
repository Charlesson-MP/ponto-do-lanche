<script setup lang="ts">
import ProductList from '../components/product/ProductList.vue'
import { products } from '../data/products'
</script>

<template>
  <section>
    <ProductList title="Cardápio" :products="products" />
  </section>
</template>