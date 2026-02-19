<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import { CheckCircle, AlertCircle, Info } from 'lucide-vue-next'

const { toasts } = useToast()

// Configuração visual para cada tipo de toast
const config = {
  success: {
    bg: 'bg-white border-green-200',
    text: 'text-green-500',
    icon: CheckCircle
  },
  error: {
    bg: 'bg-white border-red-200',
    text: 'text-red-500',
    icon: AlertCircle
  },
  info: {
    bg: 'bg-white border-blue-200',
    text: 'text-blue-500',
    icon: Info
  }
}
</script>

<template>
  <!-- Container fixo no canto superior direito -->
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 shadow-lg rounded-xl px-5 py-3 min-w-[280px] max-w-sm border"
        :class="config[toast.type].bg">
        <component :is="config[toast.type].icon" class="w-5 h-5 shrink-0" :class="config[toast.type].text" />
        <p class="text-sm text-gray-700 font-medium">{{ toast.message }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Animação de entrada */
.toast-enter-active {
  animation: toast-in 0.35s ease-out;
}

/* Animação de saída */
.toast-leave-active {
  animation: toast-out 0.3s ease-in forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }

  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
