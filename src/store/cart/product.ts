import { Module } from 'vuex'
import shop from '../../api/shop'
import { Product, ProductState } from '@/types/cart'
import { RootState } from '../rootstate'

// initial state
const state = () => ({
  all: []
})

export const ProductModule: Module<ProductState, RootState> = {
  namespaced: true,
  state,
  actions: {
    async getAllProducts ({ commit }) {
      const products = await shop.getProducts()
      commit('setProducts', products)
    }
  } ,
  mutations: {
    setProducts (state, products) {
      state.all = products
    },
  
    decrementProductInventory (state, { id }) {
      const product = state.all.find(product => product.id === id) as Product
      product.inventory--
    }
  }
}
