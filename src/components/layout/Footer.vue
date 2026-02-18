<script setup lang="ts">
import logoFooter from '../../assets/images/logo-footer.webp'
import { Instagram, Facebook, Mail, Phone } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-gray-900 text-white py-12 border-t-4 border-accent">
    <div class="container mx-auto px-6 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

      <!-- Coluna 1: Logo e Navegação -->
      <div class="flex flex-col items-center md:items-start text-center md:text-left">
        <img :src="logoFooter" alt="Logo Ponto do Lanche" class="w-40 mb-6 drop-shadow-md">
        <nav>
          <ul class="flex flex-col gap-2">
            <li><a href="/" class="text-gray-300 hover:text-accent font-medium text-lg transition-colors">Home</a></li>
            <li><a href="/menu"
                class="text-gray-300 hover:text-accent font-medium text-lg transition-colors">Cardápio</a></li>
          </ul>
        </nav>
      </div>

      <!-- Coluna 2: Horário -->
      <div class="flex flex-col items-center md:items-start text-center md:text-left">
        <h3 class="text-2xl font-bold text-accent mb-6">Horário de Funcionamento</h3>
        <div class="space-y-2 text-gray-300">
          <p><span class="font-semibold text-white">Segunda a Sexta:</span><br>17:00 - 00:00</p>
          <p><span class="font-semibold text-white">Sábado e Domingo:</span><br>17:00 - 01:00</p>
        </div>
      </div>

      <!-- Coluna 3: Contatos e Redes Sociais -->
      <div class="flex flex-col items-center md:items-start text-center md:text-left">
        <h3 class="text-2xl font-bold text-accent mb-6">Fale Conosco</h3>

        <div class="flex gap-4 mb-6">
          <a href="#"
            class="p-3 bg-gray-800 rounded-full hover:bg-accent hover:text-brown transition-all duration-300 shadow-lg group"
            aria-label="WhatsApp">
            <Phone class="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
          <a href="#"
            class="p-3 bg-gray-800 rounded-full hover:bg-accent hover:text-brown transition-all duration-300 shadow-lg group"
            aria-label="Email">
            <Mail class="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
          <a href="#"
            class="p-3 bg-gray-800 rounded-full hover:bg-accent hover:text-brown transition-all duration-300 shadow-lg group"
            aria-label="Instagram">
            <Instagram class="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
          <a href="#"
            class="p-3 bg-gray-800 rounded-full hover:bg-accent hover:text-brown transition-all duration-300 shadow-lg group"
            aria-label="Facebook">
            <Facebook class="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
        </div>

        <p class="text-gray-400 text-sm">
          Acompanhe nossas novidades nas redes sociais!
        </p>
      </div>

    </div>

    <!-- Copyright -->
    <div class="border-t border-gray-800 mt-12 pt-8">
      <div class="text-center text-gray-500 text-sm">
        <p>&copy; 2026 Ponto do Lanche. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
</template>