import { ref } from 'vue'

const isCheckoutOpen = ref(false)

export function useCheckoutModal() {
  function openCheckout() {
    isCheckoutOpen.value = true
  }

  function closeCheckout() {
    isCheckoutOpen.value = false
  }

  return {
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
  }
}
