import { createStore } from 'vuex'
import { RootState } from './rootstate'
import { CountModule, CartModule, ProductModule } from './moduleCollection'

export default createStore<RootState>({
  modules: {
    count: CountModule,
    products: ProductModule,
    cart: CartModule
  }
})