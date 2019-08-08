import { AxiosInstance } from './types'
import Axios from './core/Axios'
import { extend } from './utlis/index'
import CancelToken from './core/CancelToken'
import { isCancelErr } from './core/CancelErr'

function createInstance(): AxiosInstance {
  const context = new Axios()
  const instance = context.request.bind(context)
  extend(instance, context)
  return instance as AxiosInstance
}

const axios = createInstance()
axios.CancelToken = CancelToken
axios.isCancelErr = isCancelErr

export default axios
