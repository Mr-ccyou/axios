import { isDate, isObject } from '../utlis/check'

// 普通对象处理成json字符串传递, 其它类型, xmlrequest对象自行处理
export function formateData(data: any): any {
  if (isObject(data)) {
    return JSON.stringify(data)
  } else {
    return data
  }
}
