<script setup lang="ts">
import bg from '../../assets/images/bg-hero-section.png'
import hamb from '../../assets/images/hamburguer.png'
</script>

<template>
  <section class="md:flex lg:px-20 lg:py-16 overflow-hidden"
    :style="{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'bottom center', 'background-repeat': 'no-repeat' }">
    <div
      class="w-full bg-bg-hero py-5 text-brown md:bg-transparent md:w-1/2 lg:w-1/2 text-center lg:text-left lg:mt-0 flex flex-col justify-center">
      <h1 class="text-4xl md:text-white lg:text-5xl font-extrabold mb-6 leading-tight">
        Os melhores <span class="text-accent-dark md:text-accent">lanches</span> aqui!
      </h1>
      <p class="text-base md:text-white lg:text-lg mb-8 text-brown max-w-lg mx-auto lg:mx-0">
        Saboreie o verdadeiro gosto de um hambúrguer artesanal. Ingredientes frescos, carne suculenta e molhos
        especiais.
      </p>
      <button
        class="bg-accent text-brown font-bold py-4 px-10 rounded-lg shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-accent-dark text-lg self-center lg:self-start">
        Ver Cardápio
      </button>
    </div>

    <div class="w-full md:w-1/2 lg:w-4/5 flex justify-center lg:justify-end items-center">
      <img :src="hamb" alt="Hamburguer Artesanal Monstruoso"
        class="w-96 pt-5 md:w-full lg:w-full max-w-md lg:max-w-lg lg:self-end drop-shadow-2xl hover:rotate-2 transition-transform duration-500 object-contain">
    </div>
  </section>
</template>