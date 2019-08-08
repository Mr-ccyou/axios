import dispatchRequest from './dispatchrequest'
import {
  axiosRequestConfig,
  axiosPromise,
  Method,
  axiosResponse,
  ResolveFn,
  RejectedFn
} from '../types'
import AxiosInterceptor from './Interceptor'
import defaults from '../defaults'
import mergeConfig from './mergeConfig'

interface Interceptors {
  request: AxiosInterceptor<axiosRequestConfig>
  response: AxiosInterceptor<axiosResponse>
}

interface Interceptor<T> {
  id: number
  resolve: ResolveFn<T>
  reject?: RejectedFn
}

export default class Axios {
  interceptors: Interceptors
  defaults: axiosRequestConfig

  constructor() {
    this.interceptors = {
      request: new AxiosInterceptor<axiosRequestConfig>(),
      response: new AxiosInterceptor<axiosResponse>()
    }
    this.defaults = defaults
  }

  request(url: any, config?: any): axiosPromise {
    // 函数重载
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }
    // 合并默认配置和用户配置
    config = mergeConfig(config, this.defaults)

    let promise = Promise.resolve(config)

    let requestChain: Array<Interceptor<axiosRequestConfig>> = []
    this.interceptors.request.forEach(interceptor => {
      // 响应拦截器执行顺序 后 ->> 前
      requestChain.unshift(interceptor)
    })

    while (requestChain.length) {
      const interceptor: Interceptor<axiosRequestConfig> = requestChain.shift()!
      promise = promise.then(interceptor.resolve, interceptor.reject)
    }

    promise = promise.then(dispatchRequest)

    let responseChain: Array<Interceptor<axiosResponse>> = []
    this.interceptors.response.forEach(interceptor => {
      // 响应拦截器执行顺序 前 ->> 后
      responseChain.push(interceptor)
    })

    while (responseChain.length) {
      const interceptor: Interceptor<axiosResponse> = responseChain.shift()!
      promise = promise.then(interceptor.resolve, interceptor.reject)
    }

    return promise
  }

  get(url: string, config?: axiosRequestConfig): axiosPromise {
    return this._requestWithoutData(url, 'get', config)
  }

  delete(url: string, config?: axiosRequestConfig): axiosPromise {
    return this._requestWithoutData(url, 'delete', config)
  }

  head(url: string, config?: axiosRequestConfig): axiosPromise {
    return this._requestWithoutData(url, 'head', config)
  }

  options(url: string, config?: axiosRequestConfig): axiosPromise {
    return this._requestWithoutData(url, 'options', config)
  }

  post(url: string, data?: any, config?: axiosRequestConfig): axiosPromise {
    return this._requestWithData(url, 'post', data, config)
  }

  put(url: string, data?: any, config?: axiosRequestConfig): axiosPromise {
    return this._requestWithData(url, 'put', data, config)
  }

  patch(url: string, data?: any, config?: axiosRequestConfig): axiosPromise {
    return this._requestWithData(url, 'patch', data, config)
  }

  private _requestWithoutData(
    url: string,
    method: Method,
    config?: axiosRequestConfig
  ): axiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  private _requestWithData(
    url: string,
    method: Method,
    data?: any,
    config?: axiosRequestConfig
  ): axiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
