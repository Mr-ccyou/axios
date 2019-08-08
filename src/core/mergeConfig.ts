import { isObject } from '../utlis/check'
import { deepMerge } from '../utlis/index'

/**
 * 合并策略
 * 1.某些字段(url, data)只能从用户配置中取
 * 2.用户配置中有的, 认用户配置, 没有的取默认配置
 * config1: 用户配置, config2: 默认配置
 */

const strategyMap = Object.create(null)
const userKeys = ['url', 'data', 'params']
const mergeKeys = ['headers']

// 取用户配置的属性
function userStrategy(val1: any, val2: any): any {
  return val1
}

// 默认先取用户属性, 再去选默认配置
function defaultStrategy(val1: any, val2: any): any {
  if (typeof val1 !== 'undefined') {
    return val1
  } else {
    return val2
  }
}

// headers: {
//    'content-type': 'application/json',
//    'test': '',
//    'hello': '123',
//    post: {
//      content-type: 'application-xx'
//    },
//    common: {
//         withAthre: true
//    }
// }
// +
// headers: {
//     common: {
//         Accept: 'application/json, text/plain, */*'
//     },
//     post : {
//        content-type: 'application-yy'
//     }
// }
// =
// headers: {
// 'content-type': 'application/json',
// 'test': '',
// 'hello': '123',
//     common: {
//         Accept: 'application/json, text/plain, */*',
//         withAthre: true
//     },
//     post : {
//        content-type: 'application-yy'
//     }
// }

// headers 对象合并
function mergeStrategy(val1: any, val2: any): any {
  let result: any = {}

  for (let key in val1) {
    // 对象, 需要进一步合并
    if (isObject(val1[key])) {
      result[key] = deepMerge(val1[key], val2[key])
    } else {
      // 非对象, 先取用户配置的属性, 没有取默认配置
      if (typeof val1[key] !== 'undefined') {
        result[key] = val1[key]
      } else if (val2[key] !== 'undefined') {
        result[key] = val2[key]
      }
    }
  }

  // 取出默认配置中未出现在用户配置的属性
  for (let key in val2) {
    if (!result[key]) {
      result[key] = val2[key]
    }
  }

  return result
}

userKeys.forEach(key => {
  strategyMap[key] = userStrategy
})

mergeKeys.forEach(key => {
  strategyMap[key] = mergeStrategy
})

export default function mergeConfig(config1: any, config2?: any): any {
  if (!config2) {
    config2 = {}
  }

  const config = Object.create(null)

  for (let key in config1) {
    mergeFiled(key)
  }

  for (let key in config2) {
    if (!config[key]) {
      mergeFiled(key)
    }
  }

  // 策略模式
  function mergeFiled(key: string): void {
    let strategy = strategyMap[key] || defaultStrategy
    config[key] = strategy(config1[key], config2[key])
  }

  return config
}
