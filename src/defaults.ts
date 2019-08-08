import { axiosRequestConfig } from './types'

const defaults: axiosRequestConfig = {
  method: 'get',
  timeout: 0,
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  }
}

const methodWithData = ['post', 'put', 'patch']

// post 请求默认设置content-type 为 application/x-www-form-urlencoded
methodWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults
