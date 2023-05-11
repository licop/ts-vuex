import { Module } from 'vuex'
import { RootState } from '../rootstate'

interface CountState {
  count: number
}

const state = {
  count: 0
}

export const CountModule: Module<CountState, RootState> =  {
  state,
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
  }
}
