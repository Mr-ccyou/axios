export type Method =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'delete'
  | 'DELETE'
  | 'options'
  | 'OPTIONS'
  | 'head'
  | 'HEAD'
  | 'patch'
  | 'PATCH'

export interface axiosRequestConfig {
  url?: string
  method?: Method
  data?: any
  params?: any
  headers?: any
  type?: any
  timeout?: number
  cancelToken?: any
  withCredentials?: boolean
}

export interface axiosResponse {
  data: any
  status: number
  config: axiosRequestConfig
  statusText: string
  headers: any
  request: any
}

export interface axiosPromise extends Promise<axiosResponse> {}

export interface Axios {
  interceptors: {
    request: AxiosInterceptor<axiosRequestConfig>
    response: AxiosInterceptor<axiosResponse>
  }

  request(config: axiosRequestConfig): axiosPromise

  get(url: string, config?: axiosRequestConfig): axiosPromise

  head(url: string, config?: axiosRequestConfig): axiosPromise

  delete(url: string, config?: axiosRequestConfig): axiosPromise

  options(url: string, config?: axiosRequestConfig): axiosPromise

  post(url: string, data?: any, config?: axiosRequestConfig): axiosPromise

  put(url: string, data?: any, config?: axiosRequestConfig): axiosPromise

  dispatch(url: string, data?: any, config?: axiosRequestConfig): axiosPromise
}

export interface AxiosInstance extends Axios {
  isCancelErr: IsCancelErr
  CancelToken: CancelTokenStatic
  (config: axiosRequestConfig): axiosPromise
  (url: string, config?: axiosRequestConfig): axiosPromise
}

export interface ResolveFn<T> {
  (val: T): T | Promise<T>
}

export interface RejectedFn {
  (error: any): any
}

export interface AxiosInterceptor<T> {
  use(resolved: ResolveFn<T>, rejected: RejectedFn): number
  eject(id: number): void
}

export interface ResolvePromise<T> {
  (message: T): void
}

export interface Canceler {
  (message?: string): void
}

export interface Executor {
  (fn: Canceler): void
}

// 类实例类型定义
export interface CancelToken {
  promise: Promise<CancelErr>
}

// 类类型定义
export interface CancelTokenStatic {
  new (executor: Executor): CancelToken
  source(): CancelTokenSource
}

export interface CancelTokenSource {
  cancel: Canceler
  token: CancelToken
}

export interface CancelErr {
  message?: string
}

export interface IsCancelErr {
  (cancelErr: CancelErr): boolean
}
