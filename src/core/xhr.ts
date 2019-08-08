import { axiosRequestConfig, axiosPromise, axiosResponse } from '../types'

function parseHeaders(headers: string): Object {
  let header: any = {}
  let res
  let reg = /(.+):\s(.+)\r/g

  // tslint:disable-next-line: no-conditional-assignment
  while ((res = reg.exec(headers)) !== null) {
    if (res[1] && res[2]) {
      header[res[1]] = res[2]
    }
  }

  return header
}

export function xhr(config: axiosRequestConfig): axiosPromise {
  return new Promise((resolve, reject) => {
    const {
      method = 'get',
      url,
      data = null,
      headers,
      type,
      timeout,
      cancelToken,
      withCredentials
    } = config

    const request = new XMLHttpRequest()

    if (type) {
      request.responseType = type
    }

    if (timeout) {
      request.timeout = timeout
    }

    if (cancelToken) {
      cancelToken.promise.then((message: string) => {
        console.log('abort')
        request.abort()
        reject(message)
      })
    }

    if (withCredentials) {
      request.withCredentials = withCredentials
    }

    request.open(method, url!, true)

    // 设置headers
    Object.keys(headers).forEach(name => {
      if (!data && name === 'Content-Type') {
        return
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    // 网络错误
    request.onerror = function() {
      reject(new Error('Network Error'))
    }

    // 超时错误
    request.ontimeout = function() {
      reject(new Error(`Timeout of ${timeout}ms of exceeded`))
    }

    // 请求变化事件
    request.onreadystatechange = function() {
      // 每当 readyState 改变时，就会触发 onreadystatechange 事件,
      // 0: 请求未初始化
      // 1: 服务器连接已建立
      // 2: 请求已接收
      // 3: 请求处理中
      // 4: 请求已完成，且响应已就绪
      if (request.readyState !== 4) {
        return
      }

      // 发生网络错误或者超时错误, status为0
      if (request.status === 0) {
        return
      }

      const headers = parseHeaders(request.getAllResponseHeaders())

      const response: axiosResponse = {
        data: type === 'text' ? request.responseText : request.response,
        statusText: request.statusText,
        status: request.status,
        headers,
        config,
        request
      }

      handleResponse(response)
    }

    request.send(data)

    function handleResponse(response: axiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(new Error(`request failed with status code ${response.status}`))
      }
    }
  })
}
