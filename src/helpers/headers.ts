import { isObject } from '../utlis/check'
import { Method } from '../types'

function normalizeHeaders(headers: any, name: string): any {
  let isSetName = false

  Object.keys(headers).forEach(key => {
    if (key.toUpperCase() === name.toUpperCase()) {
      headers[name] = headers[key]
      delete headers[key]
      isSetName = true
    }
  })

  if (!isSetName) {
    headers[name] = 'application/json; charset=utf-8'
  }

  return headers
}

export function formateHeaders(data: any, headers: any): any {
  if (isObject(data)) {
    headers = normalizeHeaders(headers, 'Content-Type')
  }

  return headers
}

export function flatternHeaders(headers: any, method: Method): any {
  const result: any = {}

  for (let key in headers) {
    if (!isObject(headers[key])) {
      result[key] = headers[key]
    }
  }

  if (headers[method]) {
    for (let key in headers[method]) {
      if (!result[key]) {
        result[key] = headers[method][key]
      }
    }
  }

  for (let key in headers['common']) {
    if (!result[key]) {
      result[key] = headers['common'][key]
    }
  }

  return result
}
