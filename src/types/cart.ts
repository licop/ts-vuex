export interface Product {
  id: number,
  title: string,
  price: number,
  inventory: number
}

export type  Products = Product[]


export interface CartItem {
  id: number,
  quantity: number
}

export type CartItems = CartItem[]

export interface CartState {
  items: CartItems,
  checkoutStatus: boolean | null
}

export interface ProductState {
  all: Product[]
}