// Ingrediente de um produto
export interface Ingredient {
  name: string
  removable: boolean // false = item obrigatório (ex: pão, carne)
}

// Adicional pago
export interface Addon {
  id: number
  name: string
  price: number
}

// Sabor disponível para bebidas
export interface Flavor {
  name: string
}

// Tamanho disponível para bebidas (com preço próprio)
export interface Size {
  name: string
  ml: string    // ex: "350ml"
  price: number // preço deste tamanho
}

// Produto com ingredientes e adicionais
export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  ingredients: Ingredient[]
  addons: Addon[]
  flavors?: Flavor[]   // apenas para bebidas
  sizes?: Size[]       // apenas para bebidas
}

// Item customizado salvo no carrinho
export interface CustomizedCartItem {
  cartItemId: string               // ID único (productId + timestamp)
  productId: number
  name: string
  image: string
  basePrice: number
  removedIngredients: string[]
  selectedAddons: { id: number; name: string; price: number }[]
  observation: string
  finalPrice: number               // basePrice + soma dos addons
  quantity: number
  selectedFlavor?: string          // sabor escolhido (bebidas)
  selectedSize?: string            // tamanho escolhido (bebidas)
}