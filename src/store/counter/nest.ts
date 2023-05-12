import { Module } from '@/vuex4'
import { RootState } from '../rootstate'
import { NestModule1 } from './nest1'

interface NestState {
  foo: string
}

export const NestModule: Module<NestState, RootState> =  {
  namespaced: true,
  state: {
    foo: 'bar'
  },
  getters: {
    twoBars: state => state.foo.repeat(2)
  },
  modules: {
    nest: NestModule1
  }
}
