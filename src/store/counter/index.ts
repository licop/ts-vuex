import { Module } from '@/vuex4'
import { RootState } from '../rootstate'
import { NestModule } from './nest'

interface CountState {
  count: number
}

export const CountModule: Module<CountState, RootState> =  {
  namespaced: true,
  state: {
    count: 0
  },
  getters:{
    evenOrOdd: (state, getters,rootState, rootGetters) => {
      console.log(state, getters, rootState, rootGetters, 16)
      console.log(getters.doubleCount, 2)
      return state.count % 2 === 0 ? 'even' : 'odd'
    },
    doubleCount: (state) => {
      return state.count * 2
    }
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
      console.log(state, 36)
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
