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
  mutations: Record<string, any> = {}
  actions: Record<string, any> = {}
  commit: Commit
  dispatch: Dispatch
  constructor(options: StoreOptions<S>) {
    console.log("options:", options)
    this.moduleCollection = new ModuleCollection(options)
    let store = this
    this.commit = function bountCommit(type: string, payload: any) {
      this.commit_.call(store, type, payload)
    }
    this.dispatch = function commitDispatch(type: string, payload: any) {
      this.dispatch_.call(store, type, payload)
    }
    // 注册模块
    let rootState = this.moduleCollection.root.state
    console.log("开始注册模块 installModule:")
    installModule(store, rootState, [], this.moduleCollection.root)
    console.log("模块注册完后的rootState:", rootState)
  }

  install(app: App) {
    app.provide(injectKey, this)
  }

  test() {
    return '我是store'
  }

  commit_(type: string, payload: any) {
    if(!this.mutations[type]) {
      console.error(("[vuex unknow mutation type]: " + type))
    }
    this.mutations[type](payload)
  }

  dispatch_(type: string, payload: any) {
    if(!this.actions[type]) {
      console.error(("[vuex unknow action type]: " + type))
    }
    this.actions[type](payload)
  }
}

/**
 * @param store 
 * @param rootState_ 根state
 * @param path   保存模块名【命名空间名】的数组
 * @param module 当前模块
 */
function installModule<R>(store: Store<R>, rootState_: R, path: string[], module: ModuleWrapper<any, R>) {
  let isRoot = !path.length
  console.log('path:', path)
  if(!isRoot) { // 1.如果不是跟模块
    // 拿到父级的state对象
    let parentState: any = getParentState(rootState_, path.slice(0, -1))
    // 把当前模块的state对象和当前模块名合成一个对象，加到父级state对象上
    parentState[path[path.length - 1]] = module.state
  }
  module.forEachChild((child, key) => {
    installModule(store, rootState_, path.concat(key), child)
  })
}

function getParentState<R>(rootState: R, path: string[]) {
  return path.reduce((state, key) => {
    return (state as any)[key]
  }, rootState)
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

  forEachChild(fn: ChildModuleWrapperToKey<R>) {
    Object.keys(this.children).forEach(key => {
      fn(this.children[key], key)
    })
  }
}

type ChildModuleWrapperToKey<R> = (moduleWrapper: ModuleWrapper<any, R>, key: string) => void

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
      let parentModule = this.get(path.slice(0 ,-1))
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

class Util {
  static forEachValue(obj: object, fn: Function) {
    Object.keys(obj).forEach(key => {
      fn((obj as any)[key], key)
    })
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