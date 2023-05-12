import { Module } from '@/vuex4'
import { RootState } from '../rootstate'

interface NestState {
  foo: string
}

export const NestModule1: Module<NestState, RootState> =  {
  namespaced: true,
  state: {
    foo: 'bar'
  },
  getters: {
    twoBars: state => state.foo.repeat(2)
  }
}
