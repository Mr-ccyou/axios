export function isObject(params: any): params is Object {
  return Object.prototype.toString.call(params) === '[object Object]'
}

export function isDate(params: any): params is Date {
  return Object.prototype.toString.call(params) === '[object Date]'
}
