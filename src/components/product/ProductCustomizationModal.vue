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
      <div v-if="visible" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container" role="dialog" aria-modal="true" :aria-label="`Personalizar ${product.name}`">

          <!-- Header com imagem -->
          <div class="modal-header">
            <img :src="product.image" :alt="product.name" class="modal-image" />
            <div class="modal-header-info">
              <h2 class="modal-title">{{ product.name }}</h2>
              <p class="modal-base-price">R$ {{ basePrice.toFixed(2) }}</p>
            </div>
            <button class="modal-close" aria-label="Fechar personalização" @click="handleClose">
              <X class="w-6 h-6" />
            </button>
          </div>

          <!-- Corpo com scroll -->
          <div class="modal-body">

            <!-- ========== BEBIDA: Sabores ========== -->
            <section v-if="isBeverage && product.flavors!.length > 0" class="modal-section">
              <h3 class="section-title">
                Escolha o sabor
                <span class="required-badge">obrigatório</span>
              </h3>
              <p class="section-subtitle">Selecione um sabor</p>

              <!-- Aviso se tentar confirmar sem sabor -->
              <Transition name="warning">
                <div v-if="showFlavorError && !selectedFlavor" class="addon-warning">
                  Selecione um sabor para continuar!
                </div>
              </Transition>

              <ul class="flavor-list">
                <li v-for="flavor in product.flavors" :key="flavor.name" class="flavor-item">
                  <label class="flavor-label" :class="{ 'is-selected': selectedFlavor === flavor.name }">
                    <input type="radio" name="flavor" :value="flavor.name" v-model="selectedFlavor" class="flavor-radio"
                      @change="showFlavorError = false" />
                    <span class="flavor-name">{{ flavor.name }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <!-- ========== BEBIDA: Tamanhos ========== -->
            <section v-if="isBeverage && product.sizes && product.sizes.length > 0" class="modal-section">
              <h3 class="section-title">Escolha o tamanho</h3>
              <p class="section-subtitle">O preço varia conforme o tamanho</p>

              <div class="size-grid">
                <button v-for="size in product.sizes" :key="size.name" class="size-card"
                  :class="{ 'is-selected': selectedSizeName === size.name }" @click="selectedSizeName = size.name">
                  <span class="size-name">{{ size.name }}</span>
                  <span class="size-ml">{{ size.ml }}</span>
                  <span class="size-price">R$ {{ size.price.toFixed(2) }}</span>
                </button>
              </div>
            </section>

            <!-- ========== COMIDA: Ingredientes ========== -->
            <section v-if="!isBeverage && product.ingredients.length > 0" class="modal-section">
              <h3 class="section-title">Ingredientes</h3>
              <p class="section-subtitle">Desmarque para remover</p>

              <ul class="ingredient-list">
                <li v-for="ing in product.ingredients" :key="ing.name" class="ingredient-item">
                  <label class="ingredient-label" :class="{ 'is-fixed': !ing.removable }">
                    <input v-if="ing.removable" type="checkbox" v-model="includedIngredients[ing.name]"
                      class="ingredient-checkbox" />
                    <span v-else class="ingredient-fixed-dot"></span>
                    <span class="ingredient-name">{{ ing.name }}</span>
                    <span v-if="!ing.removable" class="ingredient-badge">obrigatório</span>
                  </label>
                </li>
              </ul>
            </section>

            <!-- ========== Adicionais (ambos) ========== -->
            <section v-if="product.addons.length > 0" class="modal-section">
              <h3 class="section-title">
                Adicionais
                <span class="addon-counter">{{ selectedAddonCount }}/{{ MAX_ADDONS }}</span>
              </h3>
              <p class="section-subtitle">Escolha até {{ MAX_ADDONS }} opções</p>

              <!-- Aviso de limite -->
              <Transition name="warning">
                <div v-if="showAddonWarning" class="addon-warning">
                  Limite de {{ MAX_ADDONS }} adicionais atingido!
                </div>
              </Transition>

              <ul class="addon-list">
                <li v-for="addon in product.addons" :key="addon.id" class="addon-item">
                  <label class="addon-label" :class="{
                    'is-selected': selectedAddonIds[addon.id],
                    'is-disabled': !selectedAddonIds[addon.id] && isAddonLimitReached
                  }">
                    <input type="checkbox" :checked="selectedAddonIds[addon.id]" class="addon-checkbox"
                      :disabled="!selectedAddonIds[addon.id] && isAddonLimitReached" @change="toggleAddon(addon.id)" />
                    <span class="addon-name">{{ addon.name }}</span>
                    <span class="addon-price" v-if="addon.price > 0">+ R$ {{ addon.price.toFixed(2) }}</span>
                    <span class="addon-price addon-free" v-else>grátis</span>
                  </label>
                </li>
              </ul>
            </section>

            <!-- Observação -->
            <section class="modal-section">
              <h3 class="section-title">Observação</h3>
              <p class="section-subtitle">Ex: "Sem gelo", "Bem gelado"</p>
              <textarea v-model="observation" :maxlength="MAX_OBSERVATION" rows="3"
                placeholder="Digite sua observação aqui..." class="observation-field"></textarea>
              <p class="observation-counter">{{ observation.length }}/{{ MAX_OBSERVATION }}</p>
            </section>
          </div>

          <!-- Footer fixo com preço dinâmico -->
          <div class="modal-footer">
            <button class="confirm-button" :class="{ 'is-disabled': !canConfirm }" @click="handleConfirm">
              Adicionar ao carrinho — R$ {{ finalPrice.toFixed(2) }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ========== Overlay ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ========== Container ========== */
.modal-container {
  background: #fff;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* ========== Header ========== */
.modal-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.modal-image {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.modal-header-info {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #5D4037;
  margin: 0;
  line-height: 1.3;
}

.modal-base-price {
  font-size: 0.95rem;
  font-weight: 600;
  color: #C62828;
  margin: 0.25rem 0 0;
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.5rem;
  transition: color 0.2s, background 0.2s;
}

.modal-close:hover {
  color: #374151;
  background: #f3f4f6;
}

/* ========== Body ========== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.modal-section {
  margin-bottom: 1.5rem;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0 0 0.75rem;
}

/* ========== Badge Obrigatório ========== */
.required-badge {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #fef2f2;
  color: #C62828;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 700;
  border: 1px solid #fecaca;
}

/* ========== Sabores (Bebida) ========== */
.flavor-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flavor-item {
  margin: 0;
}

.flavor-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.625rem;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.flavor-label:hover {
  border-color: #C62828;
  background: #fef2f2;
}

.flavor-label.is-selected {
  border-color: #C62828;
  background: #fef2f2;
  box-shadow: 0 0 0 1px #C62828;
}

.flavor-radio {
  accent-color: #C62828;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.flavor-name {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

/* ========== Tamanhos (Bebida) ========== */
.size-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
}

.size-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.size-card:hover {
  border-color: #C62828;
  background: #fef2f2;
}

.size-card.is-selected {
  border-color: #C62828;
  background: #fef2f2;
  box-shadow: 0 0 0 1px #C62828;
}

.size-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
}

.size-ml {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}

.size-price {
  font-size: 0.8rem;
  font-weight: 700;
  color: #C62828;
}

/* ========== Ingredientes ========== */
.ingredient-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ingredient-item {
  margin: 0;
}

.ingredient-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s;
}

.ingredient-label:hover {
  background: #f9fafb;
}

.ingredient-label.is-fixed {
  cursor: default;
  opacity: 0.7;
}

.ingredient-checkbox {
  accent-color: #C62828;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.ingredient-fixed-dot {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
}

.ingredient-name {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.ingredient-badge {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f3f4f6;
  color: #9ca3af;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
}

/* ========== Adicionais ========== */
.addon-counter {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.addon-warning {
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  text-align: center;
  border: 1px solid #fecaca;
}

.addon-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.addon-item {
  margin: 0;
}

.addon-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.625rem;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.addon-label:hover:not(.is-disabled) {
  border-color: #C62828;
  background: #fef2f2;
}

.addon-label.is-selected {
  border-color: #C62828;
  background: #fef2f2;
}

.addon-label.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.addon-checkbox {
  accent-color: #C62828;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.addon-name {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.addon-price {
  font-size: 0.8rem;
  font-weight: 600;
  color: #C62828;
  white-space: nowrap;
}

.addon-free {
  color: #16a34a;
}

/* ========== Observação ========== */
.observation-field {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.625rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  resize: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.observation-field:focus {
  outline: none;
  border-color: #C62828;
}

.observation-field::placeholder {
  color: #d1d5db;
}

.observation-counter {
  text-align: right;
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

/* ========== Footer ========== */
.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.confirm-button {
  width: 100%;
  padding: 0.875rem;
  background: #C62828;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, opacity 0.2s;
}

.confirm-button:hover:not(.is-disabled) {
  background: #b71c1c;
}

.confirm-button:active:not(.is-disabled) {
  transform: scale(0.98);
}

.confirm-button.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

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
