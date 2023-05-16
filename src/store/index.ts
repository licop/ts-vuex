import { createStore } from '../vuex4'
import { RootState } from './rootstate'
import { CountModule } from './moduleCollection'
import { NestModule } from './counter/nest'


export default createStore<RootState>({
  state: {
    navList: [1, 3, 5]
  },
  modules: {
    Count: CountModule,
    nest: NestModule
  }
})