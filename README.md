### Vuex 2.0 源码分析
在一般情况之下, 我们普遍使用 global event bus 来解决全局状态共享, 组件通讯的问题, 当遇到大型应用的时候, 这种方式将使代码变得难以维护, Vuex应运而生, 接下来我将从源码的角度分析Vuex的整个实现过程.

#### 目录结构

![0b9014802d05880caaf144c6cba65091.png](en-resource://database/1111:1) 
整个Vuex的目录结构还是非常清晰地, index.js 是整个项目的入口, helpers.js 提供Vuex的辅助方法>, mixin.js 是$store注入到vue实例的方法, util.js 是一些工具函数, store.js是store类的实现 等等, 接下来就从项目入口一步步分析整个源码.

#### 项目入口

 首先我们可以从index.js看起:
```
 export default {
    Store,
    install,
    version: '__VERSION__',
    mapState,
    mapMutations,
    mapGetters,
    mapActions,
    createNamespacedHelpers
 }
```
可以看到, index.js就是导出了一个Vuex对象, 这里可以看到Vuex暴露的api, Store就是一个Vuex提供的状态存储类, 通常就是使用 new Vuex.Store(...)的方式, 来创建一个Vuex的实例. 接下来看, install 方法, 在store.js中;
```
export function install (_Vue) {
       if (Vue && _Vue === Vue) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(
                    '[vuex] already installed. Vue.use(Vuex) should be called only once.'
                )
            }
            return
        }
       Vue = _Vue
       applyMixin(Vue)
   }
```
install 方法有个重复install的检测报错, 并将传入的_Vue赋值给自己定义的Vue变量, 而这个Vue变量已经变导出, 整个项目就可以使用Vue, 而不用安装Vue;
```
 export let Vue
```
接着调用applyMixin方法, 该方法在mixin.js当中;
```
export default function (Vue) {
    const version = Number(Vue.version.split('.')[0])
    Vue.mixin({ beforeCreate: vuexInit })
}
```
所以, applyMixin方法的逻辑就是全局混入一个beforeCreate钩子函数-vuexInit;
```
function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
        this.$store = typeof options.store === 'function'
            ? options.store()
            : options.store
    } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
    }
}
```
整个代码很简单, 就是将用户传入的store注入到每个vue实例的$store属性中去, 从而在每个实例我们都可以通过调用this.$store.xx访问到Vuex的数据和状态;

#### Store类
在我们使用Vuex的时候, 通常会实例化一个Vuex.Store类, 传入一个对象, 对象包括state、getters、mutations、actions、modules, 而我们实例化的时候, Vuex到底做了什么呢? 带着这个疑问, 我们一起来看store.js中的代码, 首先是构造函数;
```

constructor (options = {}) {

    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
        install(window.Vue)
    }
    
    if (process.env.NODE_ENV !== 'production') {
        assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
        assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
        assert(this instanceof Store, `store must be called with the new operator.`)
    }
    
    const {
        plugins = [],
        strict = false
    } = options
    
    // store internal state
    this._committing = false
    this._actions = Object.create(null)
    this._actionSubscribers = []
    this._mutations = Object.create(null)
    this._wrappedGetters = Object.create(null)
    this._modules = new ModuleCollection(options)
    this._modulesNamespaceMap = Object.create(null)
    this._subscribers = []
    this._watcherVM = new Vue()
    
    // bind commit and dispatch to self
    const store = this
    const { dispatch, commit } = this
    
    this.dispatch = function boundDispatch (type, payload) {
        return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
        return commit.call(store, type, payload, options)
    }
    // strict mode
    this.strict = strict
    const state = this._modules.root.state
   
    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    installModule(this, state, [], this._modules.root)
    
    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    resetStoreVM(this, state)
    
    // apply plugins
    plugins.forEach(plugin => plugin(this))
    
    const useDevtools = options.devtools !== undefined ? options.devtools :                     Vue.config.devtools
    if (useDevtools) {
        devtoolPlugin(this)
    }
}
````

构造函数一开始是判断当window.Vue存在的时候, 调用install方法, 确保script加载的Vuex可以正确被安装, 接着是三个断言函数, 确保Vue存在, 环境支持Promise, 当前环境的this是Store;

```
const {
    plugins = [],
    strict = false
} = options
```
利用es6的赋值结构拿到options中的plugins(默认是[]), strict(默认是false), plugins 表示应用的插件、strict 表示是否开启严格模式, 接着往下看;
```
// store internal state
this._committing = false
this._actions = Object.create(null)
this._actionSubscribers = []
this._mutations = Object.create(null)
this._wrappedGetters = Object.create(null)
this._modules = new ModuleCollection(options)
this._modulesNamespaceMap = Object.create(null)
this._subscribers = []
this._watcherVM = new Vue()
```
这里主要是初始化一些Vuex内部的属性, _开头, 一般代表着私有属性,
`this._committing`标志着一个提交状态;
`this._actions`存储用户的所有的actions;
`this.mutations`存储用户所有的mutations;
`this.wrappedGetters`存储用户所有的getters;
`this._subscribers`用来存储所有对 mutation 变化的订阅者;
`this._modules`表示所有modules的集合;
`this._modulesNamespaceMap`表示子模块名称记录.
继续往下看:
```
// bind commit and dispatch to self
const store = this
const { dispatch, commit } = this
this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
}
this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
}
// strict mode
this.strict = strict
const state = this._modules.root.state
```
这段代码就是通过赋值结构拿到store对象的dispatch, commit 方法, 并重新定义store的dispatch, commit 方法,  使他们的this指向store的实例, 具体的dispatch和comiit实现稍后分析.

#### Vuex核心
##### installModule方法
installModule方法主要是根据用户传入的options, 进行各个模块的安装和注册, 具体实现如下:
```
function installModule (store, rootState, path, module, hot) {
    const isRoot = !path.length
    const namespace = store._modules.getNamespace(path)
    
    // register in namespace map
    if (module.namespaced) {
        if (store._modulesNamespaceMap[namespace] && process.env.NODE_ENV !== 'production') {
        console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
        store._modulesNamespaceMap[namespace] = module
    }
    
    // set state
    if (!isRoot && !hot) {
        const parentState = getNestedState(rootState, path.slice(0, -1))
        const moduleName = path[path.length - 1]
        store._withCommit(() => {
            Vue.set(parentState, moduleName, module.state)
        })
    }
    
    const local = module.context = makeLocalContext(store, namespace, path)
    
    module.forEachMutation((mutation, key) => {
        const namespacedType = namespace + key
        registerMutation(store, namespacedType, mutation, local)
    })
    
    module.forEachAction((action, key) => {
        const type = action.root ? key : namespace + key
        const handler = action.handler || action
        registerAction(store, type, handler, local)
    })
    
    module.forEachGetter((getter, key) => {
        const namespacedType = namespace + key
        registerGetter(store, namespacedType, getter, local)
    })
    
    module.forEachChild((child, key) => {
        installModule(store, rootState, path.concat(key), child, hot)
    })
}
```
installModules方法需要传入5个参数, store, rootState, path, module, hot; store指的是当前Store实例, rootState是根实例的state, path当前子模块的路径数组, module指的是当前的安装模块, hot 当动态改变 modules 或者热更新的时候为 true。

先看这段代码:
```
if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && process.env.NODE_ENV !== 'production') {
    console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    store._modulesNamespaceMap[namespace] = module
}
```
这段代码主要是为了防止子模块命名重复, 故定义了一个map记录每个子模块;

接下来看下面的代码:
```
// set state
if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
        Vue.set(parentState, moduleName, module.state)
    })
}
```
这里判断当不为根且非热更新的情况，然后设置级联状态，这里乍一看不好理解，我们先放一放，稍后来回顾。

再往下看代码:

```
const local = module.context = makeLocalContext(store, namespace, path)
```
首先, 定义一个local变量来接收makeLocalContext函数返回的结果, makeLocalContext有三个参数,  store指的是根实例, namespace 指的是命名空间字符,  path是路径数组;
```
function makeLocalContext (store, namespace, path) {
    const noNamespace = namespace === ''
    const local = {
        dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
            const args = unifyObjectStyle(_type, _payload, _options)
            const { payload, options } = args
            let { type } = args
            if (!options || !options.root) {
                type = namespace + type
                if (process.env.NODE_ENV !== 'production' && !store._actions[type]) {
                    console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
            return
            }
        }
        return store.dispatch(type, payload)
    },
    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
        const args = unifyObjectStyle(_type, _payload, _options)
        const { payload, options } = args
        let { type } = args
        if (!options || !options.root) {
            type = namespace + type
            if (process.env.NODE_ENV !== 'production' && !store._mutations[type]) {
                console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
            return
            }
         }
        store.commit(type, payload, options)
        }  
    }
    // getters and state object must be gotten lazily
    // because they will be changed by vm update
    Object.defineProperties(local, {
        getters: {
            get: noNamespace
            ? () => store.getters
            : () => makeLocalGetters(store, namespace)
        },
        state: {
            get: () => getNestedState(store.state, path)
        }
    })
    return local
}
```
makeLocalContext 函数主要的功能就是根据是否有namespce定义不同的dispatch和commit, 并监听local的getters和sate的get属性, 那namespace是从何而来呢, 在installModule的开始:
```
const isRoot = !path.length
const namespace = store._modules.getNamespace(path)
```
namespace 是根据path数组通过_modules中的getNamespace获得, 而store._modules是ModuleCollection的实例, 所以可以到ModuleCollection中找到getNamespace方法:
```
getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
        module = module.getChild(key)
        return namespace + (module.namespaced ? key + '/' : '')
    }, '')
}
```
该函数通过对path路径数组reduce遍历, 获得模块的命名空间(eg: 'city/');,接下来是各个模块的注册流程, 首先看mutaiton的注册;
```
module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
})
```
forEachMutation函数一个循环遍历, 拿到用户传入的mutation函数和key值, 接着调用registerMutation函数;
```
// $store.state.commit('add', 1)
function registerMutation (store, type, handler, local) {
    const entry = store._mutations[type] || (store._mutations[type] = [])
    entry.push(function wrappedMutationHandler (payload) {
        handler.call(store, local.state, payload)
    })
}
```
这段代码的作用就是, 将所有的mutation函数封装成wrappedMutationHandler存入`store._mutations`这个对象当中, 我们结合前面提过的commit的过程, 可以更好的理解;
```
commit (_type, _payload, _options) {
    // check object-style commit
    const {
    type,
    payload,
    options
    } = unifyObjectStyle(_type, _payload, _options)
    
    const mutation = { type, payload }
    const entry = this._mutations[type]
    
    if (!entry) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[vuex] unknown mutation type: ${type}`)
        }
        return
    }
    
    this._withCommit(() => {
        entry.forEach(function commitIterator (handler) {
            handler(payload)
        })
    })
    
    this._subscribers.forEach(sub => sub(mutation, this.state))
    
    if (
    process.env.NODE_ENV !== 'production' &&
    options && options.silent
    ) {
        console.warn(
        `[vuex] mutation type: ${type}. Silent option has been removed. ` +
        'Use the filter functionality in the vue-devtools'
        )
    }
}
```
unifyObjectStyle 函数就是对参数的规范,  而后, 通过`
this._mutations[type]` 拿到type所对应的所有wrappedMutationHandler函数, 遍历执行, 传入payload, `this._withCommit`函数在源码中出现过很多次, 代码如下:
```
_withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
}

```
代码作用就是每次提交的时候, 将`this._committing`置为true, 执行完提交操作之后, 在重新置为初始状态, 确保只有mutation才能更改state的值, _subscribers相关代码暂时不看, 我们接下来看一看action的注册流程:
```
module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
})
```
这段代码和mutation的注册流程是类似的, 不同在于registerAction函数
```
function registerAction (store, type, handler, local) {
    const entry = store._actions[type] || (store._actions[type] = [])
    entry.push(function wrappedActionHandler (payload, cb) {
    
        let res = handler.call(store, {
            dispatch: local.dispatch,
            commit: local.commit,
            getters: local.getters,
            state: local.state,
            rootGetters: store.getters,
            rootState: store.state
        }, payload, cb)
        
        if (!isPromise(res)) {
            res = Promise.resolve(res)
        }
        
        if (store._devtoolHook) {
            return res.catch(err => {
                store._devtoolHook.emit('vuex:error', err)
                throw err
            })
        } else {
            return res
        }
    })
}
```
可以看到, 基于用户的action函数, 源码封多了一层wrappedActionHandler函数,  在action函数中, 可以获得一个context对象, 就是在这里做的处理, 然后, 它把action函数的执行结果封装成了Promise并返回, 结合dispatch函数可以更好的理解;
```
dispatch (_type, _payload) {
    // check object-style dispatch
    const {
        type,
        payload
    } = unifyObjectStyle(_type, _payload)
    
    const action = { type, payload }
    const entry = this._actions[type]
    
    if (!entry) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[vuex] unknown action type: ${type}`)
        }
        return
    }
    
    const result = entry.length > 1
        ? Promise.all(entry.map(handler => handler(payload)))
        : entry[0](payload)
        
        return result.then(res => {
            return res
        })
}
```
dispatch 拿到actions后, 根据数组长度, 执行Promise.all或者直接执行, 然后通过then函数拿到promise resolve的结果.

接下来是getters的注册
```
module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
})
```
registerGetter函数:
```
function registerGetter (store, type, rawGetter, local) {
    // 不允许重复
    if (store._wrappedGetters[type]) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[vuex] duplicate getter key: ${type}`)
        }
        return
    }
    store._wrappedGetters[type] = function wrappedGetter (store) {
        return rawGetter(
            local.state, // local state
            local.getters, // local getters
            store.state, // root state
            store.getters // root getters
        )
    }
}
```
将用户传入的rawGetter封装成wrappedGetter, 放入store._wrappedGetters的对象中,  函数的执行稍后再说, 我们继续子模块的安装;
```
module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
})
```
这段代码首先是对state.modules遍历, 递归调用installModule, 这时候的path是不为空数组的, 所以会走到这个逻辑;
```
// set state
if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
        Vue.set(parentState, moduleName, module.state)
    })
}
```
通过getNestedState找到它的父state,  它的模块key就是path的最后一项, `store._withCommit`上面已经解释过了,  然后通过Vue.set 将子模块响应式的添加到父state, 从而将子模块都注册完毕.

##### resetStoreVM 方法

resetStoreVM 函数第一部分
```
const oldVm = store._vm

// bind store public getters
store.getters = {}
const wrappedGetters = store._wrappedGetters
const computed = {}

forEachValue(wrappedGetters, (fn, key) => {
// use computed to leverage its lazy-caching mechanism
// direct inline function use will lead to closure preserving oldVm.
// using partial to return function with only arguments preserved in closure                enviroment.
    computed[key] = partial(fn, store)
    Object.defineProperty(store.getters, key, {
        get: () => store._vm[key],
        enumerable: true // for local getters
    })
})
    
    

```
首先, 拿到所有的wrappedGetter函数对象, 即包装过的用户传入的getters, 定义一个变量computed, 接受所有的函数, 并通过`Ojbect.defineProperty`在store.getters属性定义了get方法, 也就是说, 我们通过this.$store.getters.xx 会访问到 store._vm[xx], 而store._vm又是什么呢? 
```
// use a Vue instance to store the state tree
// suppress warnings just in case the user has added
// some funky global mixins
const silent = Vue.config.silent
Vue.config.silent = true     // 关闭vue警告, 提醒

store._vm = new Vue({
    data: {
        $$state: state
    },
    computed
})

Vue.config.silent = silent

```
显然, store._vm是一个Vue的实例, 包含所有用户getters的计算属性和 用户state的$$state属性, 而我们访问this.$store.state 其实就是访问这里的$$state属性, 原因在于, Store类直接定义了一个state的取值函数, 其中返回的正是这个$$state属性;
```
get state () {
    return this._vm._data.$$state
}
```
我们接着看;

```
// enable strict mode for new vm
if (store.strict) {
    enableStrictMode(store)
}

```
当在Vuex严格模式下, strict为true, 所以会执行enableStrictMode函数;
```
function enableStrictMode (store) {
    store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
        assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
    }, { deep: true, sync: true })
}
```
该函数利用Vue.$watch函数, 监听$$state的变化, 当store._committing 为false的话, 就会抛出不允许在mutation函数之外操作state;

接着我们再来看最后一部分;
```
if (oldVm) {
    if (hot) {
        // dispatch changes in all subscribed watchers
        // to force getter re-evaluation for hot reloading.
        store._withCommit(() => {
            oldVm._data.$$state = null
        })
    }
    Vue.nextTick(() => oldVm.$destroy())
}
```
oldVm保存着上一个store._vm对象的引用, 每次执行这个函数, 都会创建一个新的store._vm, 所以需要在这段代码中销毁;

至此, Store类初始化大致都讲完了, 接下来分析Vuex提供的辅助函数.

#### 辅助函数
##### mapstate
```
export const mapState = normalizeNamespace((namespace, states) => {
    const res = {}
    normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
        let state = this.$store.state
        let getters = this.$store.getters
        
        if (namespace) {
            const module = getModuleByNamespace(this.$store, 'mapState', namespace)
            if (!module) {
                return
            }
            state = module.context.state
            getters = module.context.getters
        }
        return typeof val === 'function'
            ? val.call(this, state, getters)
            : state[val]
        }
        // mark vuex getter for devtools
        res[key].vuex = true
    })
    return res
})
```
首先, 先说一说normalizeMap方法, 该方法主要是用于格式化参数, 用户使用mapState函数, 可以使传入一个字符串数组, 也可以是传入一个对象, 经过normalizeMap方法处理, 统一返回一个对象数组;;
```
// normalizeMap([1,2]) => [{key: 1, val: 1}, {key: 2, val: 2}] 
// normalizeMap({a: 1, b: 2}) => [{key: 'a', val: 1}, {key: 'b', val: 2}] 
function normalizeMap (map) {
    return Array.isArray(map)
        ? map.map(key => ({ key, val: key }))
        : Object.keys(map).map(key => ({ key, val: map[key] }))
}
```
接着, 对于处理过的对象数组遍历, 定义了一个res对象接收, key为键, mappedState方法为值;
```
function mappedState () {
    let state = this.$store.state
    let getters = this.$store.getters

    if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
            return
        }
        state = module.context.state
        getters = module.context.getters
    }
    return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
}
```
整个函数代码比较简单, 唯一需要注意的点是, 当传入了namespace时, 需要通过getModuleByNamespace函数找到该属性对应的module, 还记得在installModule中, 有在`store._modulesNamespaceMap`中记录namespace和模块间的对应关系, 因此, getModuleByNamespace就是通过这个map找到了module, 从而拿到了当前module的state和getters;

最后mapstate函数返回一个res函数对象, 用户可以直接利用...操作符导入到计算属性中.

##### mapMutations

mapMutations函数和mapstate函数是类似的, 唯一的区别在于mappedMutation是commit 函数代理, 并且它需要被导入到methods;
```
function mappedMutation (...args) {
    // Get the commit method from store
    let commit = this.$store.commit
    
    if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
            return
        }
        commit = module.context.commit
    }
    return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
}
```

mapActions, mapGetters 的实现也都大同小异, 便不再具体分析.




























