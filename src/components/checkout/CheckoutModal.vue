<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { X, Truck, Store, CreditCard, Banknote, QrCode, ChevronRight } from 'lucide-vue-next'
import { useCartStore } from '../../stores/cartStore'
import { useCheckoutModal } from '../../composables/useCheckoutModal'
import { useToast } from '../../composables/useToast'

const WHATSAPP_NUMBER = '5577991153244'
const STORAGE_KEY = 'ponto-do-lanche-customer'
const DELIVERY_FEE = 5.00

const cart = useCartStore()
const { isCheckoutOpen, closeCheckout } = useCheckoutModal()
const { showToast } = useToast()

// --- Estado do formulário ---
const orderData = ref({
  nome: '',
  telefone: '',
  tipoEntrega: 'entrega' as 'entrega' | 'retirada',
  endereco: {
    rua: '',
    numero: '',
    bairro: '',
    complemento: '',
  },
  metodoPagamento: '' as '' | 'pix' | 'cartao' | 'dinheiro',
  troco: '',
})

// --- Validação ---
const errors = ref<Record<string, string>>({})
const submitted = ref(false)

function validate(): boolean {
  const e: Record<string, string> = {}

  if (!orderData.value.nome.trim()) e.nome = 'Informe seu nome'
  if (!orderData.value.telefone.trim() || orderData.value.telefone.replace(/\D/g, '').length < 11)
    e.telefone = 'Informe um telefone válido'

  if (orderData.value.tipoEntrega === 'entrega') {
    if (!orderData.value.endereco.rua.trim()) e.rua = 'Informe a rua'
    if (!orderData.value.endereco.numero.trim()) e.numero = 'Informe o número'
    if (!orderData.value.endereco.bairro.trim()) e.bairro = 'Informe o bairro'
  }

  if (!orderData.value.metodoPagamento) e.pagamento = 'Escolha a forma de pagamento'

  errors.value = e
  return Object.keys(e).length === 0
}

// --- Computed ---
const taxaEntrega = computed(() =>
  orderData.value.tipoEntrega === 'entrega' ? DELIVERY_FEE : 0
)

const totalFinal = computed(() =>
  cart.totalPrice + taxaEntrega.value
)

// --- Máscara de telefone ---
function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function handlePhoneInput(event: Event) {
  const input = event.target as HTMLInputElement
  orderData.value.telefone = applyPhoneMask(input.value)
  // Garante que o valor mostrado é o mascarado
  input.value = orderData.value.telefone
}

// --- Persistência localStorage ---
function loadSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved.nome) orderData.value.nome = saved.nome
    if (saved.telefone) orderData.value.telefone = saved.telefone
    if (saved.endereco) {
      orderData.value.endereco = { ...orderData.value.endereco, ...saved.endereco }
    }
  } catch { /* ignora erros de parse */ }
}

function saveCustomerData() {
  const data = {
    nome: orderData.value.nome,
    telefone: orderData.value.telefone,
    endereco: orderData.value.endereco,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// --- Envio WhatsApp ---
function buildWhatsAppMessage(): string {
  const d = orderData.value
  const itensText = cart.items
    .map(item => {
      let line = `• ${item.name} x${item.quantity}`
      if (item.removedIngredients.length > 0) line += ` (Sem: ${item.removedIngredients.join(', ')})`
      if (item.selectedAddons.length > 0) line += ` (+${item.selectedAddons.map(a => a.name).join(', ')})`
      if (item.observation) line += ` [Obs: ${item.observation}]`
      if (item.selectedFlavor) line += ` | Sabor: ${item.selectedFlavor}`
      if (item.selectedSize) line += ` | ${item.selectedSize}`
      return line
    })
    .join('\n')

  let msg = `*Novo Pedido - Ponto do Lanche* 🍔\n\n`
  msg += `*Cliente:* ${d.nome}\n`
  msg += `*Telefone:* ${d.telefone}\n\n`
  msg += `*Itens:*\n${itensText}\n\n`
  msg += `*Subtotal:* R$ ${cart.totalPrice.toFixed(2)}\n`

  if (d.tipoEntrega === 'entrega') {
    msg += `*Taxa de Entrega:* R$ ${DELIVERY_FEE.toFixed(2)}\n`
    msg += `*Endereço:* ${d.endereco.rua}, ${d.endereco.numero} - ${d.endereco.bairro}`
    if (d.endereco.complemento) msg += ` (${d.endereco.complemento})`
    msg += `\n`
  } else {
    msg += `*Retirada no local* 🏪\n`
  }

  msg += `\n*Total: R$ ${totalFinal.value.toFixed(2)}*\n\n`
  msg += `*Pagamento:* ${formatPaymentMethod(d.metodoPagamento)}`
  if (d.metodoPagamento === 'dinheiro' && d.troco) {
    msg += ` (Troco para R$ ${d.troco})`
  }

  return msg
}

function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'pix': return 'Pix'
    case 'cartao': return 'Cartão'
    case 'dinheiro': return 'Dinheiro'
    default: return method
  }
}

function handleSubmit() {
  submitted.value = true
  if (!validate()) return

  const message = buildWhatsAppMessage()
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`

  saveCustomerData()
  window.open(url, '_blank')
  cart.clearCart()
  closeCheckout()
  showToast('Pedido enviado com sucesso! 🎉', 'success')
}

// --- Controle do modal ---
function handleClose() {
  closeCheckout()
}

function resetForm() {
  orderData.value = {
    nome: '',
    telefone: '',
    tipoEntrega: 'entrega',
    endereco: { rua: '', numero: '', bairro: '', complemento: '' },
    metodoPagamento: '',
    troco: '',
  }
  errors.value = {}
  submitted.value = false
  loadSavedData()
}

watch(isCheckoutOpen, (open) => {
  if (open) {
    resetForm()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// ESC para fechar
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isCheckoutOpen.value) {
    handleClose()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

// Limpa erro ao editar campo
function clearError(field: string) {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="checkout-modal">
      <div v-if="isCheckoutOpen" class="fixed inset-0 bg-black/70 z-[300] flex items-end sm:items-center justify-center"
        @click.self="handleClose">
        <div
          class="checkout-container bg-[#1a1a2e] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-[500px] max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          role="dialog" aria-modal="true" aria-label="Finalizar Pedido">

          <!-- ========== HEADER ========== -->
          <div class="relative flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div>
              <h2 class="text-xl font-display font-bold text-white m-0">Finalizar Pedido</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ cart.totalItems }} {{ cart.totalItems === 1 ? 'item' : 'itens'
              }} no carrinho</p>
            </div>
            <button
              class="bg-white/10 border-none text-white cursor-pointer p-2 rounded-xl transition-colors hover:bg-white/20"
              aria-label="Fechar checkout" @click="handleClose">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- ========== CORPO COM SCROLL ========== -->
          <div class="flex-1 overflow-y-auto px-5 py-5 space-y-6 checkout-body">

            <!-- ===== SEÇÃO 1: IDENTIFICAÇÃO ===== -->
            <section>
              <h3 class="section-title">👤 Identificação</h3>

              <div class="space-y-3">
                <div>
                  <label for="checkout-name" class="field-label">Nome *</label>
                  <input id="checkout-name" v-model="orderData.nome" type="text" placeholder="Seu nome completo"
                    class="field-input" :class="{ 'field-error': errors.nome }" @input="clearError('nome')" />
                  <p v-if="errors.nome" class="error-msg">{{ errors.nome }}</p>
                </div>

                <div>
                  <label for="checkout-phone" class="field-label">Telefone *</label>
                  <input id="checkout-phone" :value="orderData.telefone" type="tel" placeholder="(99) 99999-9999"
                    class="field-input" :class="{ 'field-error': errors.telefone }"
                    @input="handlePhoneInput($event); clearError('telefone')" />
                  <p v-if="errors.telefone" class="error-msg">{{ errors.telefone }}</p>
                </div>
              </div>
            </section>

            <!-- ===== SEÇÃO 2: LOGÍSTICA ===== -->
            <section>
              <h3 class="section-title">📍 Entrega</h3>

              <!-- Toggle Entrega / Retirada -->
              <div class="flex rounded-xl overflow-hidden border border-white/10 mb-4">
                <button @click="orderData.tipoEntrega = 'entrega'"
                  class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all" :class="orderData.tipoEntrega === 'entrega'
                    ? 'bg-accent text-[#1a1a2e]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'">
                  <Truck class="w-4 h-4" />
                  Entrega
                </button>
                <button @click="orderData.tipoEntrega = 'retirada'"
                  class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all" :class="orderData.tipoEntrega === 'retirada'
                    ? 'bg-accent text-[#1a1a2e]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'">
                  <Store class="w-4 h-4" />
                  Retirada
                </button>
              </div>

              <!-- Campos de endereço (só para Entrega) -->
              <Transition name="slide-fields">
                <div v-if="orderData.tipoEntrega === 'entrega'" class="space-y-3">
                  <div class="grid grid-cols-3 gap-3">
                    <div class="col-span-2">
                      <label for="checkout-street" class="field-label">Rua *</label>
                      <input id="checkout-street" v-model="orderData.endereco.rua" type="text" placeholder="Nome da rua"
                        class="field-input" :class="{ 'field-error': errors.rua }" @input="clearError('rua')" />
                      <p v-if="errors.rua" class="error-msg">{{ errors.rua }}</p>
                    </div>
                    <div>
                      <label for="checkout-number" class="field-label">Nº *</label>
                      <input id="checkout-number" v-model="orderData.endereco.numero" type="text" placeholder="123"
                        class="field-input" :class="{ 'field-error': errors.numero }" @input="clearError('numero')" />
                      <p v-if="errors.numero" class="error-msg">{{ errors.numero }}</p>
                    </div>
                  </div>

                  <div>
                    <label for="checkout-neighborhood" class="field-label">Bairro *</label>
                    <input id="checkout-neighborhood" v-model="orderData.endereco.bairro" type="text"
                      placeholder="Seu bairro" class="field-input" :class="{ 'field-error': errors.bairro }"
                      @input="clearError('bairro')" />
                    <p v-if="errors.bairro" class="error-msg">{{ errors.bairro }}</p>
                  </div>

                  <div>
                    <label for="checkout-complement" class="field-label">Complemento / Referência</label>
                    <input id="checkout-complement" v-model="orderData.endereco.complemento" type="text"
                      placeholder="Ex: Apt 2, próximo ao mercado..." class="field-input" />
                  </div>
                </div>
              </Transition>
            </section>

            <!-- ===== SEÇÃO 3: PAGAMENTO ===== -->
            <section>
              <h3 class="section-title">💳 Pagamento</h3>

              <div class="space-y-2">
                <label class="payment-option" :class="{ 'payment-selected': orderData.metodoPagamento === 'pix' }"
                  @click="orderData.metodoPagamento = 'pix'; clearError('pagamento')">
                  <div class="payment-icon bg-emerald-500/20 text-emerald-400">
                    <QrCode class="w-5 h-5" />
                  </div>
                  <span class="flex-1 text-sm font-semibold">Pix</span>
                  <div class="payment-radio" :class="{ 'payment-radio-active': orderData.metodoPagamento === 'pix' }">
                  </div>
                </label>

                <label class="payment-option" :class="{ 'payment-selected': orderData.metodoPagamento === 'cartao' }"
                  @click="orderData.metodoPagamento = 'cartao'; clearError('pagamento')">
                  <div class="payment-icon bg-blue-500/20 text-blue-400">
                    <CreditCard class="w-5 h-5" />
                  </div>
                  <span class="flex-1 text-sm font-semibold">Cartão</span>
                  <div class="payment-radio"
                    :class="{ 'payment-radio-active': orderData.metodoPagamento === 'cartao' }"></div>
                </label>

                <label class="payment-option" :class="{ 'payment-selected': orderData.metodoPagamento === 'dinheiro' }"
                  @click="orderData.metodoPagamento = 'dinheiro'; clearError('pagamento')">
                  <div class="payment-icon bg-yellow-500/20 text-yellow-400">
                    <Banknote class="w-5 h-5" />
                  </div>
                  <span class="flex-1 text-sm font-semibold">Dinheiro</span>
                  <div class="payment-radio"
                    :class="{ 'payment-radio-active': orderData.metodoPagamento === 'dinheiro' }"></div>
                </label>
              </div>

              <p v-if="errors.pagamento" class="error-msg mt-2">{{ errors.pagamento }}</p>

              <!-- Campo de troco -->
              <Transition name="slide-fields">
                <div v-if="orderData.metodoPagamento === 'dinheiro'" class="mt-3">
                  <label for="checkout-change" class="field-label">Troco para quanto? (opcional)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">R$</span>
                    <input id="checkout-change" v-model="orderData.troco" type="number" min="0" step="0.01"
                      placeholder="0,00" class="field-input pl-10" />
                  </div>
                </div>
              </Transition>
            </section>

            <!-- ===== SEÇÃO 4: REVISÃO ===== -->
            <section>
              <h3 class="section-title">📋 Resumo do Pedido</h3>

              <div class="bg-white/5 rounded-xl p-4 space-y-3">
                <!-- Itens -->
                <div v-for="item in cart.items" :key="item.cartItemId" class="flex justify-between items-start text-sm">
                  <div class="flex-1 min-w-0">
                    <span class="text-white font-medium">{{ item.name }}</span>
                    <span class="text-gray-400 ml-1">x{{ item.quantity }}</span>
                    <div v-if="item.selectedAddons.length > 0" class="text-xs text-accent-light mt-0.5">
                      + {{item.selectedAddons.map(a => a.name).join(', ')}}
                    </div>
                  </div>
                  <span class="text-gray-300 font-semibold whitespace-nowrap ml-3">
                    R$ {{ (item.finalPrice * item.quantity).toFixed(2) }}
                  </span>
                </div>

                <!-- Separador -->
                <div class="border-t border-white/10"></div>

                <!-- Subtotal -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Subtotal</span>
                  <span class="text-gray-300">R$ {{ cart.totalPrice.toFixed(2) }}</span>
                </div>

                <!-- Taxa de entrega -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Taxa de entrega</span>
                  <span :class="taxaEntrega > 0 ? 'text-gray-300' : 'text-emerald-400 font-semibold'">
                    {{ taxaEntrega > 0 ? `R$ ${taxaEntrega.toFixed(2)}` : 'Grátis' }}
                  </span>
                </div>

                <!-- Total -->
                <div class="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span class="text-white font-bold text-base">Total</span>
                  <span class="text-accent font-display font-bold text-2xl">
                    R$ {{ totalFinal.toFixed(2) }}
                  </span>
                </div>
              </div>
            </section>

          </div>

          <!-- ========== FOOTER ========== -->
          <div class="px-5 py-4 border-t border-white/10 bg-[#151527] shrink-0">
            <button @click="handleSubmit"
              class="w-full flex items-center justify-center gap-2 py-4 bg-accent hover:bg-accent-dark text-[#1a1a2e] text-base font-bold border-none rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-accent">
              Enviar Pedido via WhatsApp
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ========== Tipografia de seção ========== */
.section-title {
  @apply text-sm font-bold text-accent uppercase tracking-wider mb-3;
}

.field-label {
  @apply block text-xs font-semibold text-gray-400 mb-1.5;
}

/* ========== Inputs ========== */
.field-input {
  @apply w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 transition-all outline-none;
}

.field-input:focus {
  @apply border-accent bg-white/[0.08] ring-1 ring-accent/30;
}

.field-error {
  @apply border-red-500/60 bg-red-500/5;
}

.error-msg {
  @apply text-xs text-red-400 mt-1 ml-1 font-medium;
}

/* ========== Opções de pagamento ========== */
.payment-option {
  @apply flex items-center gap-3 p-3 rounded-xl border border-white/10 cursor-pointer transition-all hover:bg-white/5;
}

.payment-selected {
  @apply border-accent/50 bg-accent/5;
}

.payment-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center;
}

.payment-radio {
  @apply w-5 h-5 rounded-full border-2 border-white/20 transition-all;
}

.payment-radio-active {
  @apply border-accent bg-accent;
  box-shadow: inset 0 0 0 3px #1a1a2e;
}

/* ========== Scrollbar customizada ========== */
.checkout-body::-webkit-scrollbar {
  width: 4px;
}

.checkout-body::-webkit-scrollbar-track {
  background: transparent;
}

.checkout-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

/* ========== Animação do modal ========== */
.checkout-modal-enter-active {
  animation: overlay-in 0.3s ease-out;
}

.checkout-modal-leave-active {
  animation: overlay-out 0.2s ease-in forwards;
}

.checkout-modal-enter-active .checkout-container {
  animation: slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.checkout-modal-leave-active .checkout-container {
  animation: slide-down 0.2s ease-in forwards;
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes overlay-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-down {
  from {
    transform: translateY(0);
    opacity: 1;
  }

  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* ========== Animação dos campos condicionais ========== */
.slide-fields-enter-active {
  animation: fields-in 0.3s ease-out;
}

.slide-fields-leave-active {
  animation: fields-out 0.2s ease-in forwards;
}

@keyframes fields-in {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    max-height: 400px;
    transform: translateY(0);
  }
}

@keyframes fields-out {
  from {
    opacity: 1;
    max-height: 400px;
  }

  to {
    opacity: 0;
    max-height: 0;
  }
}
</style>
