<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Product } from '../../types/product'
import { X } from 'lucide-vue-next'

const MAX_ADDONS = 3
const MAX_OBSERVATION = 200

const props = defineProps<{
  product: Product
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [payload: {
    removedIngredients: string[]
    selectedAddons: { id: number; name: string; price: number }[]
    observation: string
    basePrice: number
    finalPrice: number
    selectedFlavor?: string
    selectedSize?: string
  }]
}>()

// --- Detecção de bebida ---
const isBeverage = computed(() =>
  (props.product.flavors?.length ?? 0) > 0
)

// --- Estado interno ---

// Ingredientes removíveis: mapa { nome: boolean (true = incluído) }
const includedIngredients = ref<Record<string, boolean>>({})

// Adicionais selecionados: mapa { id: boolean }
const selectedAddonIds = ref<Record<number, boolean>>({})

// Campo de observação
const observation = ref('')

// Aviso de limite de adicionais
const showAddonWarning = ref(false)

// --- Estado de bebida ---
const selectedFlavor = ref('')
const selectedSizeName = ref('')
const showFlavorError = ref(false)

// --- Inicialização ao abrir o modal ---
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    resetState()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function resetState() {
  // Ingredientes removíveis iniciam como incluídos (true)
  const map: Record<string, boolean> = {}
  for (const ing of props.product.ingredients) {
    if (ing.removable) {
      map[ing.name] = true
    }
  }
  includedIngredients.value = map

  // Adicionais iniciam todos desmarcados
  const addonMap: Record<number, boolean> = {}
  for (const addon of props.product.addons) {
    addonMap[addon.id] = false
  }
  selectedAddonIds.value = addonMap

  observation.value = ''
  showAddonWarning.value = false

  // Bebida: reset
  selectedFlavor.value = ''
  showFlavorError.value = false
  // Tamanho padrão: Médio (índice 1) ou primeiro disponível
  const sizes = props.product.sizes
  if (sizes && sizes.length > 0) {
    selectedSizeName.value = sizes.length >= 2 ? sizes[1]!.name : sizes[0]!.name
  } else {
    selectedSizeName.value = ''
  }
}

// --- Computeds ---

const removedIngredients = computed(() =>
  Object.entries(includedIngredients.value)
    .filter(([, included]) => !included)
    .map(([name]) => name)
)

const selectedAddons = computed(() =>
  props.product.addons.filter(a => selectedAddonIds.value[a.id])
)

const selectedAddonCount = computed(() => selectedAddons.value.length)

const addonsTotal = computed(() =>
  selectedAddons.value.reduce((sum, a) => sum + a.price, 0)
)

const currentSize = computed(() =>
  props.product.sizes?.find(s => s.name === selectedSizeName.value)
)

const basePrice = computed(() => {
  if (isBeverage.value && currentSize.value) {
    return currentSize.value.price
  }
  return props.product.price
})

const finalPrice = computed(() =>
  basePrice.value + addonsTotal.value
)

const isAddonLimitReached = computed(() =>
  selectedAddonCount.value >= MAX_ADDONS
)

const canConfirm = computed(() => {
  if (isBeverage.value && !selectedFlavor.value) return false
  return true
})

// --- Handlers ---

function toggleAddon(addonId: number) {
  const current = selectedAddonIds.value[addonId]

  if (!current && isAddonLimitReached.value) {
    showAddonWarning.value = true
    setTimeout(() => { showAddonWarning.value = false }, 2500)
    return
  }

  selectedAddonIds.value[addonId] = !current
}

function handleConfirm() {
  if (!canConfirm.value) {
    showFlavorError.value = true
    return
  }

  emit('confirm', {
    removedIngredients: removedIngredients.value,
    selectedAddons: selectedAddons.value.map(a => ({
      id: a.id,
      name: a.name,
      price: a.price,
    })),
    observation: observation.value.trim(),
    basePrice: basePrice.value,
    finalPrice: finalPrice.value,
    ...(isBeverage.value && {
      selectedFlavor: selectedFlavor.value,
      selectedSize: currentSize.value
        ? `${currentSize.value.name} (${currentSize.value.ml})`
        : undefined,
    }),
  })
}

function handleClose() {
  emit('close')
}

// Fechar com ESC
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    handleClose()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
        @click.self="handleClose">
        <div
          class="bg-white rounded-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl modal-container"
          role="dialog" aria-modal="true" :aria-label="`Personalizar ${product.name}`">

          <!-- Header com imagem -->
          <div class="relative flex items-center gap-4 px-5 py-4 border-b border-gray-200 bg-[#fafafa]">
            <img :src="product.image" :alt="product.name" class="w-[72px] h-[72px] object-cover rounded-xl shrink-0" />
            <div class="flex-1 min-w-0">
              <h2 class="text-lg font-bold text-brown leading-tight m-0">{{ product.name }}</h2>
              <p class="text-[0.95rem] font-semibold text-primary mt-1 m-0">R$ {{ basePrice.toFixed(2) }}</p>
            </div>
            <button
              class="absolute top-3 right-3 bg-transparent border-none text-gray-400 cursor-pointer p-1 rounded-lg transition-colors hover:text-gray-700 hover:bg-gray-100"
              aria-label="Fechar personalização" @click="handleClose">
              <X class="w-6 h-6" />
            </button>
          </div>

          <!-- Corpo com scroll -->
          <div class="flex-1 overflow-y-auto px-5 py-4">

            <!-- ========== BEBIDA: Sabores ========== -->
            <section v-if="isBeverage && product.flavors!.length > 0" class="mb-6 last:mb-0">
              <h3 class="text-base font-bold text-gray-700 flex items-center gap-2 mb-0.5">
                Escolha o sabor
                <span
                  class="text-[0.625rem] uppercase tracking-wide bg-red-50 text-primary py-0.5 px-2 rounded-full font-bold border border-red-200">obrigatório</span>
              </h3>
              <p class="text-xs text-gray-400 mb-3">Selecione um sabor</p>

              <!-- Aviso se tentar confirmar sem sabor -->
              <Transition name="warning">
                <div v-if="showFlavorError && !selectedFlavor"
                  class="bg-red-50 text-red-600 text-[0.8rem] font-semibold py-2 px-3 rounded-lg mb-3 text-center border border-red-200">
                  Selecione um sabor para continuar!
                </div>
              </Transition>

              <ul class="list-none p-0 m-0 flex flex-col gap-2">
                <li v-for="flavor in product.flavors" :key="flavor.name">
                  <label
                    class="flex items-center gap-2.5 py-2.5 px-3 rounded-[0.625rem] border-[1.5px] cursor-pointer transition-all"
                    :class="selectedFlavor === flavor.name
                      ? 'border-primary bg-red-50 shadow-[0_0_0_1px_#C62828]'
                      : 'border-gray-200 hover:border-primary hover:bg-red-50'">
                    <input type="radio" name="flavor" :value="flavor.name" v-model="selectedFlavor"
                      class="accent-primary w-[1.125rem] h-[1.125rem] shrink-0" @change="showFlavorError = false" />
                    <span class="flex-1 text-sm text-gray-700 font-medium">{{ flavor.name }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <!-- ========== BEBIDA: Tamanhos ========== -->
            <section v-if="isBeverage && product.sizes && product.sizes.length > 0" class="mb-6 last:mb-0">
              <h3 class="text-base font-bold text-gray-700 flex items-center gap-2 mb-0.5">Escolha o tamanho</h3>
              <p class="text-xs text-gray-400 mb-3">O preço varia conforme o tamanho</p>

              <div class="grid grid-cols-3 gap-2.5">
                <button v-for="size in product.sizes" :key="size.name"
                  class="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-[1.5px] bg-white cursor-pointer transition-all"
                  :class="selectedSizeName === size.name
                    ? 'border-primary bg-red-50 shadow-[0_0_0_1px_#C62828]'
                    : 'border-gray-200 hover:border-primary hover:bg-red-50'" @click="selectedSizeName = size.name">
                  <span class="text-[0.8rem] font-bold text-gray-700">{{ size.name }}</span>
                  <span class="text-[0.7rem] text-gray-400 font-medium">{{ size.ml }}</span>
                  <span class="text-[0.8rem] font-bold text-primary">R$ {{ size.price.toFixed(2) }}</span>
                </button>
              </div>
            </section>

            <!-- ========== COMIDA: Ingredientes ========== -->
            <section v-if="!isBeverage && product.ingredients.length > 0" class="mb-6 last:mb-0">
              <h3 class="text-base font-bold text-gray-700 flex items-center gap-2 mb-0.5">Ingredientes</h3>
              <p class="text-xs text-gray-400 mb-3">Desmarque para remover</p>

              <ul class="list-none p-0 m-0 flex flex-col gap-2">
                <li v-for="ing in product.ingredients" :key="ing.name">
                  <label
                    class="flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    :class="{ 'cursor-default opacity-70': !ing.removable }">
                    <input v-if="ing.removable" type="checkbox" v-model="includedIngredients[ing.name]"
                      class="accent-primary w-[1.125rem] h-[1.125rem] shrink-0" />
                    <span v-else class="w-[1.125rem] h-[1.125rem] rounded-full bg-gray-300 shrink-0"></span>
                    <span class="flex-1 text-sm text-gray-700">{{ ing.name }}</span>
                    <span v-if="!ing.removable"
                      class="text-[0.625rem] uppercase tracking-wide bg-gray-100 text-gray-400 py-0.5 px-2 rounded-full font-semibold">obrigatório</span>
                  </label>
                </li>
              </ul>
            </section>

            <!-- ========== Adicionais (ambos) ========== -->
            <section v-if="product.addons.length > 0" class="mb-6 last:mb-0">
              <h3 class="text-base font-bold text-gray-700 flex items-center gap-2 mb-0.5">
                Adicionais
                <span class="text-xs font-semibold text-gray-400 bg-gray-100 py-0.5 px-2 rounded-full">{{
                  selectedAddonCount }}/{{ MAX_ADDONS }}</span>
              </h3>
              <p class="text-xs text-gray-400 mb-3">Escolha até {{ MAX_ADDONS }} opções</p>

              <!-- Aviso de limite -->
              <Transition name="warning">
                <div v-if="showAddonWarning"
                  class="bg-red-50 text-red-600 text-[0.8rem] font-semibold py-2 px-3 rounded-lg mb-3 text-center border border-red-200">
                  Limite de {{ MAX_ADDONS }} adicionais atingido!
                </div>
              </Transition>

              <ul class="list-none p-0 m-0 flex flex-col gap-2">
                <li v-for="addon in product.addons" :key="addon.id">
                  <label
                    class="flex items-center gap-2.5 py-2.5 px-3 rounded-[0.625rem] border-[1.5px] cursor-pointer transition-all"
                    :class="[
                      selectedAddonIds[addon.id]
                        ? 'border-primary bg-red-50'
                        : 'border-gray-200',
                      !selectedAddonIds[addon.id] && isAddonLimitReached
                        ? 'opacity-45 cursor-not-allowed'
                        : '',
                      !selectedAddonIds[addon.id] && !isAddonLimitReached
                        ? 'hover:border-primary hover:bg-red-50'
                        : ''
                    ]">
                    <input type="checkbox" :checked="selectedAddonIds[addon.id]"
                      class="accent-primary w-[1.125rem] h-[1.125rem] shrink-0"
                      :disabled="!selectedAddonIds[addon.id] && isAddonLimitReached" @change="toggleAddon(addon.id)" />
                    <span class="flex-1 text-sm text-gray-700">{{ addon.name }}</span>
                    <span class="text-[0.8rem] font-semibold whitespace-nowrap"
                      :class="addon.price > 0 ? 'text-primary' : 'text-green-600'" v-if="addon.price > 0">+ R$ {{
                        addon.price.toFixed(2) }}</span>
                    <span class="text-[0.8rem] font-semibold text-green-600 whitespace-nowrap" v-else>grátis</span>
                  </label>
                </li>
              </ul>
            </section>

            <!-- Observação -->
            <section class="mb-6 last:mb-0">
              <h3 class="text-base font-bold text-gray-700 flex items-center gap-2 mb-0.5">Observação</h3>
              <p class="text-xs text-gray-400 mb-3">Ex: "Sem gelo", "Bem gelado"</p>
              <textarea v-model="observation" :maxlength="MAX_OBSERVATION" rows="3"
                placeholder="Digite sua observação aqui..."
                class="w-full border-[1.5px] border-gray-200 rounded-[0.625rem] p-3 text-sm text-gray-700 resize-none font-[inherit] transition-colors focus:outline-none focus:border-primary placeholder:text-gray-300"></textarea>
              <p class="text-right text-[0.7rem] text-gray-400 mt-1">{{ observation.length }}/{{ MAX_OBSERVATION }}</p>
            </section>
          </div>

          <!-- Footer fixo com preço dinâmico -->
          <div class="px-5 py-4 border-t border-gray-200 bg-[#fafafa]">
            <button
              class="w-full py-3.5 bg-primary text-white text-base font-bold border-none rounded-xl cursor-pointer transition-all hover:bg-[#b71c1c] active:scale-[0.98]"
              :class="{ 'opacity-55 cursor-not-allowed': !canConfirm }" @click="handleConfirm">
              Adicionar ao carrinho — R$ {{ finalPrice.toFixed(2) }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ========== Animações do modal ========== */
.modal-enter-active {
  animation: modal-in 0.3s ease-out;
}

.modal-leave-active {
  animation: modal-out 0.2s ease-in forwards;
}

.modal-enter-active .modal-container {
  animation: slide-up 0.3s ease-out;
}

.modal-leave-active .modal-container {
  animation: slide-down 0.2s ease-in forwards;
}

@keyframes modal-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes modal-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(30px);
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
    transform: translateY(30px);
    opacity: 0;
  }
}

/* ========== Animação do aviso ========== */
.warning-enter-active {
  animation: warning-in 0.25s ease-out;
}

.warning-leave-active {
  animation: warning-out 0.2s ease-in forwards;
}

@keyframes warning-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes warning-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
