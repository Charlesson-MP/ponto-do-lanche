<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
import ToastContainer from './components/ui/ToastContainer.vue';
</script>

<template>
  <Header />
  <main>
    <router-view />
  </main>
  <Footer />
  <ToastContainer />
</template>