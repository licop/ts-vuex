import { Module } from 'vuex'
import shop from '../../api/shop'
import { CartItem, CartState, Product } from '@/types/cart'
import { RootState } from '../rootstate'

// initial state
// shape: [{ id, quantity }]
const state = {
  items: [],
  checkoutStatus: null
}

export const CartModule: Module<CartState, RootState> = {
  namespaced: true,
  state,
  getters: {
    cartProducts: (state, getters, rootState) => {
      return state.items.map(({ id, quantity }) => {
        const product = rootState.products.all.find(product => product.id === id) as Product
  
        return {
          id: product.id,
          title: product.title,
          price: product.price,
          quantity
        }
      })
    },
  
    cartTotalPrice: (state, getters) => {
      return getters.cartProducts.reduce((total: number, product: any) => {
        return total + product.price * product.quantity
      }, 0)
    }
  },
  actions: {
    checkout ({ commit, state }, products) {
      const savedCartItems = [...state.items]
      commit('setCheckoutStatus', null)
      // empty cart
      commit('setCartItems', { items: [] })
      shop.buyProducts(
        products,
      ).then(
        () => commit('setCheckoutStatus', 'successful'),
        () => {
          commit('setCheckoutStatus', 'failed')
          // rollback to the cart saved before sending the request
          commit('setCartItems', { items: savedCartItems })
        })
    },
  
    addProductToCart ({ state, commit }, product) {
      commit('setCheckoutStatus', null)
      if (product.inventory > 0) {
        const cartItem = state.items.find(item => item.id === product.id)
        if (!cartItem) {
          commit('pushProductToCart', { id: product.id })
        } else {
          commit('incrementItemQuantity', cartItem)
        }
        // remove 1 item from stock
        commit('products/decrementProductInventory', { id: product.id }, { root: true })
      }
    }
  },
  mutations: {
    pushProductToCart (state, { id }) {
      console.log(state, 68)
      state.items.push({
        id,
        quantity: 1
      })
    },
  
    incrementItemQuantity (state, { id }) {
      const cartItem = state.items.find(item => item.id === id)
      cartItem!.quantity++
    },
  
    setCartItems (state, { items }) {
      state.items = items
    },
  
    setCheckoutStatus (state, status) {
      state.checkoutStatus = status
    }
  }
}
