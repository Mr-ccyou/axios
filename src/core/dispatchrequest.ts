import { axiosRequestConfig, axiosPromise, axiosResponse } from '../types'
import { xhr } from './xhr'
import { formateUrl } from '../helpers/url'
import { formateData } from '../helpers/data'
import { formateHeaders, flatternHeaders } from '../helpers/headers'

export default function dispatchRequest(config: axiosRequestConfig): axiosPromise {
  processConfig(config)
  return xhr(config).then(res => {
    return transformData(res)
  })
}

// 处理请求配置
function processConfig(config: axiosRequestConfig): void {
  config.url = transformUrl(config)
  config.headers = transformHeaders(config)
  config.data = transformRequest(config)
  config.headers = flatternHeaders(config.headers, config.method!)
}

// 生成规范的url
function transformUrl(config: axiosRequestConfig): string {
  const { url, params } = config
  return formateUrl(url!, params)
}

// 处理post请求的数据
function transformRequest(config: axiosRequestConfig): any {
  const { data } = config
  return formateData(data)
}

// 处理headers
function transformHeaders(config: axiosRequestConfig): any {
  const { data, headers = {} } = config
  return formateHeaders(data, headers)
}

// 返回的数据转json
function transformData(res: axiosResponse): axiosResponse {
  if (typeof res.data === 'string') {
    try {
      res.data = JSON.parse(res.data)
    } catch (e) {
      // do nothing
    }
  }
  return res
}
