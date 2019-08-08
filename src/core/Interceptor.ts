/**
 * 拦截器实现思路
 * 1) axios.interceptors.request.use (resolve, reject)
 * 2) 定义拦截器类AxiosInterceptor, use方法, eject方法
 * 3) resolve 方法的参数可能是response(响应拦截器) 或者是 config(请求拦截器), 所以需要定义泛型
 * 4) reject 方法接收error
 *
 */

import { ResolveFn, RejectedFn } from '../types'

interface Interceptor<T> {
  id: number
  resolve: ResolveFn<T>
  reject?: RejectedFn
}

export default class AxiosInterceptor<T> {
  private id: number
  private interceptors: Array<Interceptor<T>>

  constructor() {
    this.interceptors = []
    this.id = 0
  }

  use(resolve: ResolveFn<T>, reject?: RejectedFn): number {
    const interceptor: Interceptor<T> = {
      resolve,
      reject,
      id: this.id
    }
    this.interceptors.push(interceptor)
    this.id++
    return interceptor.id
  }

  eject(id: number): void {
    this.interceptors = this.interceptors.filter(item => {
      return item.id !== id
    })
  }

  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(item => {
      fn(item)
    })
  }
}
