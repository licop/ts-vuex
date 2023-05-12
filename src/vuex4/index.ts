import { App, inject } from 'vue'

const injectKey = 'store'

export function useStore<S>(): Store<S> {
  return inject(injectKey) as any
}

export function createStore<S>(options: StoreOptions<S>): Store<S> {
  return new Store<S>(options)
} 

class Store<S = any> {
  moduleCollection: ModuleCollection<S>
  constructor(options: StoreOptions<S>) {
    console.log("options:", options)
    this.moduleCollection = new ModuleCollection(options)
  }

  install(app: App) {
    app.provide(injectKey, this)
  }

  test() {
    return '我是store'
  }
}

class ModuleWrapper<S, R> {
  children: Record<string, ModuleWrapper<any, R>> = {}
  rawModule: Module<S, R>
  state: S
  namespaced: boolean

  constructor(rawModule_: Module<any, R>) {
    this.rawModule = rawModule_
    this.state = rawModule_.state || Object.create(null)
    this.namespaced = rawModule_.namespaced || false
  }
  
  addChild(key: string, moduleWapper: ModuleWrapper<any, R>) {
    this.children[key] = moduleWapper
  }
  
  getChild(key: string) {
    return this.children[key]
  }
}

class ModuleCollection<R> {
  root!: ModuleWrapper<any, R>
  constructor(rawRootModule: Module<any, R>) {
    this.register([], rawRootModule)
  }

  register(path: any[], rawModule: Module<any, R>) {
    let newModule = new ModuleWrapper<any, R>(rawModule)
    if(path.length === 0) { // path长度等于0为根模块
      this.root = newModule
    } else { // 添加子模块到父级模块
      console.log(path, path.slice(0 ,-1), 61)
      let parentModule = this.get(path.slice(0 ,-1))
      console.log(parentModule, 63)
      parentModule.addChild(path[path.length -1], newModule)
    }

    if(rawModule.modules) {
      Object.keys(rawModule.modules).forEach(key => {
        this.register(path.concat(key), (rawModule.modules as any)[key])
      })
    }
  }
  
  get(path: any[]): ModuleWrapper<any, R> {
    return path.reduce((module: ModuleWrapper<any, R>, key: string) => {
      return module.getChild(key)
    }, this.root)
  }
}


interface StoreOptions<S> {
  namespaced?: boolean
  state?: S
  getters?: GetterTree<S, S>
  mutations?: MutationTree<S>
  actions?: ActionTree<S, S>
  modules?: ModuleTree<S>;
}

interface ModuleTree<R> {
  [key: string]: Module<any, R>
}

export interface Module<S, R> {
  namespaced?: boolean
  state?: S
  getters?: GetterTree<S, R>
  mutations?: MutationTree<S>
  actions?: ActionTree<S, R>
  modules?: ModuleTree<R>;
}

interface ActionContext<S, R> {
  dispatch: Dispatch;
  commit: Commit;
  state: S;
  rootState: R;
  rootGetters: any;
}

type Dispatch = (type: string, payload?: any) => any
type Commit = (type: string, payload?: any) => any

// ActionTree
interface ActionTree<S, R> {
  [key: string]: Action<S, R>
}

type Action<S, R> = (context: ActionContext<S, R>, payload?: any) => void

// MutationTree
interface MutationTree<S> {
  [key: string]: Mutation<S>
}

type Mutation<S> = (state: S, payload?: any) => void

// GetterTree
interface GetterTree<S, R> {
  [key: string]: Getter<S, R>
}

type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any