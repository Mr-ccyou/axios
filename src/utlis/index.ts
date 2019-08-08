import { isObject } from './check'

export function extend<T, U>(to: T, from: U): T & U {
  for (let key in from) {
    ;(to as T & U)[key] = from[key] as any
  }

  return to as T & U
}

export function deepMerge(...objs: Array<any>): any {
  const result: any = {}

  // val1, common:{hello:{test:2}, test:12}
  // val2, common:{hello:{test:1}, test:32}

  objs.forEach((obj: any) => {
    if (isObject(obj)) {
      for (let key in obj) {
        if (isObject(obj[key])) {
          if (!result[key]) {
            result[key] = obj[key]
          } else {
            result[key] = deepMerge(result[key], obj[key])
          }
        } else {
          // 非对象, 认第一个值, 也就是用户配置
          if (!result[key]) {
            result[key] = obj[key]
          }
        }
      }
    }
  })

  return result
}
