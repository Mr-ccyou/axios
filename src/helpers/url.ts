// 格式化url
// 需求分析:
// 1.参数值为数组, params: {foo: ['bar', 'baz']} => foo[]=bar&foo[]baz
// 2.参数值为对象, params: {foo: {bar: 'baz'}}  => JSON.stringify + encodeURIComponent
// 3.参数值是日期, params: date => date.toIOSString()
// 4.参数值含有特殊字符, params: '@:$,[] ' 保留
// 5.空值忽略
// 6.丢弃url中哈希标志
// 6.保留url中的原有参数

function encode(val: string): string {
  // 某些特殊字符保留
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

import { isDate, isObject } from '../utlis/check'
export function formateUrl(url: string, params?: any): string {
  if (!params) return url

  let result: string[] = []

  Object.keys(params).forEach(key => {
    const val = params[key]
    if (!val) return

    let values = []

    if (Array.isArray(val)) {
      val.forEach(item => {
        result.push(`${key}[]=${item}`)
      })
    } else if (isDate(val)) {
      result.push(`${key}=${val.toISOString()}`)
    } else if (isObject(val)) {
      console.log(JSON.stringify(val))
      result.push(`${key}=${encode(JSON.stringify(val))}`)
    } else {
      result.push(`${key}=${encode(val)}`)
    }
  })

  let query = result.join('&')

  let hashIndex = url.indexOf('#')
  if (hashIndex > -1) {
    url = url.slice(0, hashIndex)
  }

  url += url.indexOf('?') > -1 ? `&${query}` : `?${query}`

  return url
}
