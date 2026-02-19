<script setup lang="ts">
import type { Product } from '../../types/product.ts'

defineProps<{
  product: Product
}>()

const emit = defineEmits(['add-to-cart'])

</script>

<template>
  <div class="bg-white rounded-2xl shadow-md overflow-hidden
           hover:shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-[1.02]
">
    <!-- Imagem -->
    <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover" />

    <!-- Conteúdo -->
    <div class="p-4 flex flex-col gap-2">
      <h3 class="text-xl font-semibold text-brown">
        {{ product.name }}
      </h3>

      <p class="text-gray-500 text-sm">
        {{ product.category }}
      </p>

      <p class="text-gray-400 text-xs leading-relaxed">
        {{ product.description }}
      </p>

      <div class="flex items-center justify-between mt-2">
        <span class="text-lg font-bold text-red-600">
          R$ {{ product.price.toFixed(2) }}
        </span>

        <button class="bg-red-600 text-white px-4 py-2 rounded-lg
                 hover:bg-red-700 transition" @click="emit('add-to-cart', product)">
          Adicionar
        </button>
      </div>
    </div>
  </div>
</template>