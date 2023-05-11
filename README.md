# Vuex4 源码架构

## Store 类

**属性**

- \_moduleCollection -- 模块集合对象
- \_modulesNamespaceMap -- 模块和命名空间映射
- dispatch -- 访问 actions 异步方法的函数类型的属性
- commit -- 访问 mutations 方法的函数类型的属性
- state -- 一个提供所有的组件渲染数据【指响应式数据】的对象或者函数【一般为对象】
- \_state -- state 响应式数据备份

**方法**

- commit\_ -- 一个可以访问 mutations 对象中方法的方法
- dispatch\_ -- 一个可以访问 actions 对象中方法的方法
- reactiveState -- 把根模块中的 state 变成响应式 state 的方法
- install -- app.use(store) 【store 中间件挂载到 app 上】时需要调用的方法

## useStore 函数

可以把挂载到 app 的 store 对象 inject 出来【inject 就是注入， 从别的地方拿到对象】

## createStore 函数

创建 store 类的函数对象

## ModuleCollection 类

封装和管理所有模块的类

**属性**:

- root -- 根模块属性

**方法**

- register -- 注册根模块和子模块的方法 【注册就是添加】
- getNameSpace -- 循环递归获取命名空间方法
- getChild -- 获取子模块方法

## ModuleWrapper 类

封装和管理某个模块的类

**属性**

- \_children -- 保存当前模块下的子模块
- \_rawModule -- 保存当前模块的属性
- state -- 保存当前模块的 state 属性
- namespaced -- 判断当前模块是否有命名空间属性
- context - 一个可以向 actions、mutations 中的方法参数传递 state，commit，dispatch 值的对象，此对象类型为 ActionContext

**方法**

- addChild -- 添加子模块
- getChild -- 获取子模块
- forEachMutation -- 当注册当前模块 mutations 到 store 时，把模块的 mutaitons 对象的所有方法解析成方法名到方法的映射这一部分功能
- forEachAction -- 当注册当前模块 actions 到 store 时，把模块的 actions 对象的所有方法解析成方法名到方法的映射这一部分功能
- forEachGetter -- 当注册当前模块 getters 到 store 时，把模块的 getters 对象的所有方法解析成方法名到方法的映射这一部分功能
- forEachGetter -- 当注册子模块 mutatios、actions、 getters 到 store 的注册之前，把所有的子模块解析成模块名到模块映射这一部分功能

## installModule 方法

模块注册方法

初始化跟模块，递归注册所有子模块，收集此类的所有模块 getters，mutations，actions 方法

就是把根模块和子模块 state 对象中的数据和 getters，mutations，actions 对象的方法全部收集到 store 对象中，**installModule**主要完成：

1. 判断所有模块中是否有重复的命名空间
2. 收集当前模块 state，并保存到父级的模块 state 中
3. 调用 makeLocalContext 方法，创建 ActionContext 类型的对象
4. 注册当前 mutations 到 store
5. 注册当前 actions 到 store
6. 注册当前 getters 到 store
7. 迭代当前模块下的所有子模块时，并完成子模块 mutation，actions，getters 到 store 的注册

## makeLocalContext 方法

此方法生成模块 ActionContext 类型的对象，对象属性包括 dispatch，commit，state 三部分

返回方法的对象主要向 actions， mutatiosns 中的方法参数传递 state，commit，dispatch 值
