import { Module } from '@/vuex4'
import { RootState } from '../rootstate'
import { NestModule } from './nest'

interface CountState {
  count: number
}

export const CountModule: Module<CountState, RootState> =  {
  state: {
    count: 0
  },
  getters:{
    evenOrOdd: state => state.count % 2 === 0 ? 'even' : 'odd'
  },
  actions: {
    increment: ({ commit }) => commit('increment'),
    decrement: ({ commit }) => commit('decrement'),
    incrementIfOdd ({ commit, state }) {
      if ((state.count + 1) % 2 === 0) {
        commit('increment')
      }
    },
    incrementAsync ({ commit }) {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          commit('increment')
          resolve()
        }, 1000)
      })
    }
  },
  mutations: {
    increment (state) {
      state.count++
    },
    decrement (state) {
      state.count--
    }
  },
  modules: {
    nested: NestModule,
    nested1: NestModule
  }
}
