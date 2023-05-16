import { App, inject, reactive } from 'vue'

const injectKey = 'store'

export function useStore<S>(): Store<S> {
  return inject(injectKey) as any
}

export function createStore<S>(options: StoreOptions<S>): Store<S> {
  return new Store<S>(options)
} 

export class Store<S = any> {
  moduleCollection: ModuleCollection<S>
  mutations: Record<string, any> = {}
  actions: Record<string, any> = {}
  getters: GetterTree<any, S> = {}
  commit: Commit
  dispatch: Dispatch
  _committing: boolean
  _state: any
  _modulesNamespaceMap: Record<string, ModuleWrapper<any, S>> = {}
  _makeLocalGettersCache: object = {}

  constructor(options: StoreOptions<S>) {
    this.moduleCollection = new ModuleCollection(options)
    this._modulesNamespaceMap = Object.create(null)
    this._makeLocalGettersCache = Object.create(null)
    
    let store = this
    let ref = this;
    let dispatch = ref.dispatch_;
    let commit = ref.commit_;
    this._committing = false
    this.commit = function bountCommit(type: string, payload: any) {
      commit.call(store, type, payload)
    }
    this.dispatch = function commitDispatch(type: string, payload: any) {
      dispatch.call(store, type, payload)
    }
    // 注册模块
    let rootState = this.moduleCollection.root.state
    installModule(store, rootState, [], this.moduleCollection.root)

    this.reactiveState(rootState)
  }
  
  get state(): S {
    return this._state.data
  }

  install(app: App) {
    app.provide(injectKey, this)
  }

  _withCommit(fn: () => void) {
    let committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing
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
  // 将rootstate变成响应式
  reactiveState<S>(rootState: S) {
    this._state = reactive({ data: rootState })
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
  let namespace = store.moduleCollection.getNamespace(path)
  if (module.namespaced) {// 如果需要设置命名空间
    if (store._modulesNamespaceMap[namespace]) {// 如果命名空间已经存在
      console.error(("[vuex] duplicate namespace " + namespace + " for the namespaced module " + (path.join('/'))));
    }
    store._modulesNamespaceMap[namespace] = module
  }
  let actionContext: ActionContext<any, R> = makeLocalContext(store, namespace, path, module)
  if(!isRoot) { // 1.如果不是跟模块
    // 拿到父级的state对象
    let parentState: any = getParentState(rootState_, path.slice(0, -1))
    let moduleName = path[path.length - 1]
    store._withCommit(function () {
      //  如果父级 State 中 有以当前模块名命名，就抛出错误
      if (moduleName in (parentState as any)) {
        console.warn(
          ("[vuex] state field \"" + moduleName + "\" was overridden by a module with the same name at \"" + (path.join('.')) + "\"")
        );
      }
      // 把当前模块的state对象和当前模块名合成一个对象，加到父级state对象上
      parentState[moduleName] = module.state
    })
  }

  module.forEachChild((child, key) => {
    installModule(store, rootState_, path.concat(key), child)
  })
  module.forEachGetter((getter, key) => {
    let namespaceType = namespace + key
    Object.defineProperty(store.getters, namespaceType, {
      get: () => {
        return getter(actionContext.state, actionContext.getters, store.state, store.getters)
      }
    })
  })
  module.forEachMutation((mutation, key) => {
    let namespaceType = namespace + key
    store.mutations[namespaceType] = function(payload: any) {
      mutation.call(store, actionContext.state, payload)
    }
  })
  console.log(actionContext.getters, 131)
  module.forEachAction((action, key) => {
    let namespaceType = namespace + key
    store.actions[namespaceType] = function(payload: any) {
      action.call(store, actionContext, payload)
    }
  })
}

function makeLocalContext<R>(store: Store<R>, namespace: string, path: string[], module: ModuleWrapper<any, R>) {
  let noNamespace = namespace === '' // 根模块没有命名空间
  let actionContext: ActionContext<any, R> = {
    commit: noNamespace ? store.commit : function(type, payload) {
      type = namespace + type
      store.commit(type, payload)
    },
    dispatch: noNamespace ? store.dispatch : function(type, payload) {
      type = namespace + type
      store.dispatch(type, payload)
    },
    rootState: {} as R,
    rootGetters: {},
    state: {},
    getters: {}
  }
  
  Object.defineProperties(actionContext, {
    state: {
      get: function() {
        return getParentState(store.state, path)
      },
    },
    getters: {
      get: function() {
        return makeLocalGetters(store, namespace)
      }
    },
    rootState: {
      get: function() {
        return store.state
      },
    },
    rootGetters: {
      get: function() {
        return store.getters
      }
    }

  })

  return actionContext
}

function makeLocalGetters(store: any, namespacename: any) {
  //  如果 store 中没有存储 以 namespacename 为名字的getters
  if (!store._makeLocalGettersCache[namespacename]) {
    var gettersProxy = {};
    var splitPos = namespacename.length;
    const types = Object.getOwnPropertyNames(store.getters);
    types.forEach(function (type) {
      // getters方法名不匹配命名空间,跳过 
      if (type.slice(0, splitPos) !== namespacename) return
      // 提取去除命名空间后的部分[getter方法名]
      let getterMethodName = type.slice(splitPos)

      // 定义 getterMethodName 属性, get 选择器返回对应哟啊执行的方法
      // 页面获取 getAllProduct---store.getters.getAllProduct
      // store.getters["usermodule/getUserinfo"] 会执行 get 选择器
      Object.defineProperty(gettersProxy, getterMethodName, {
        get: function () {
          return store.getters[type];
        },
        enumerable: true
      })
    })

    // 把  gettersProxy 保存到 getters 缓存中
    store._makeLocalGettersCache[namespacename] = gettersProxy
  }
  return store._makeLocalGettersCache[namespacename]
}


// 获取父级的state
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
  
  addChild(key: string, moduleWrapper: ModuleWrapper<any, R>) {
    this.children[key] = moduleWrapper
  }
  
  getChild(key: string) {
    return this.children[key]
  }

  forEachChild(fn: ChildModuleWrapperToKey<R>) {
    Util.forEachValue(this.children, fn)
  }

  forEachGetter(fn: GetterToKey<R>) {
    if(this.rawModule.getters) {
      Util.forEachValue(this.rawModule.getters, fn)
    }
  }

  forEachMutation(fn: MutationToKey<S>) {
    if(this.rawModule.mutations) {
      Util.forEachValue(this.rawModule.mutations, fn)
    }
  }

  forEachAction(fn: ActionToKey<S, R>) {
    if(this.rawModule.actions) {
      Util.forEachValue(this.rawModule.actions, fn)
    }
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

  getNamespace(path: string[]) {
    let moduleWrapper  = this.root
    return path.reduce((namespace, key) => {
      moduleWrapper =  moduleWrapper.getChild(key)
      return namespace+(moduleWrapper.namespaced ? key + "/" : '')
    }, '')
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

export interface ActionContext<S, R> {
  dispatch: Dispatch;
  commit: Commit;
  state: S;
  getters: any,
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

//  type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any
type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any


type MutationToKey<S> = (mutation: Mutation<S>, key: string) => any
type GetterToKey<R> = (getter: Getter<any, R>, key: string) => any
type ActionToKey<S, R> = (action: Action<S, R>, key: string) => any

type ChildModuleWrapperToKey<R> = (moduleWrapper: ModuleWrapper<any, R>, key: string) => void