import { createStore } from '../vuex4'
import { RootState } from './rootstate'
import { CountModule } from './moduleCollection'
import { NestModule } from './counter/nest'

export default createStore<RootState>({
  state: {
    navList: [1, 2, 4]
  },
  modules: {
    CountModule: CountModule,
    nestModue: NestModule
  }
})