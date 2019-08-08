// 1. 定义一个类, 参数是一个函数excuctor, 参数是string类型, 返回空
// 2. 通过该函数将promise的resolve暴露出去
// 3. 通过config获得CancelToken的实例
// 4. 通过promise.then()监听cancel事件, cancel调用, promise转为resolved状态, 执行内部请求终止的方法

import { ResolvePromise, Executor, CancelTokenSource, CancelErr, Canceler } from '../types'
import { Cancel } from './CancelErr'

export default class CancelToken {
  promise: Promise<CancelErr>

  constructor(executor: Executor) {
    let resolvePromise: ResolvePromise<CancelErr>
    this.promise = new Promise<CancelErr>(resolve => {
      resolvePromise = resolve
    })

    executor(function(message) {
      let cancel = new Cancel(message)
      resolvePromise(cancel)
    })
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler

    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
