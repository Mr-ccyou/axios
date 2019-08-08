import axios from '../../dist/system.es5.js'

let CancelToken = axios.CancelToken
let cancel
let random = Math.random()
let source = CancelToken.source()

// source方法 返回一个 对象
// 包含cancel: cancel方法, 和一个包含token: CancelToken实例
axios({
    url: '/simple/get',
    method: 'GET',
    params: { a: random, b: 2 },
    cancelToken: source.token
}).catch((e) => {
    console.log(axios.isCancelErr(e))
    console.log(e.message)
})

if (random > 0.5) {
    source.cancel('stop1')
    console.log('我要停止1')
}

axios({
    url: '/simple/get',
    method: 'GET',
    params: { a: random, b: 2 },
    cancelToken: new CancelToken((c) => {
        cancel = c
    })
}).catch((e) => {
    console.log(axios.isCancelErr(e))
    console.log(e.message)
})

if (random < 0.5) {
    cancel('stop2')
    console.log('我要停止2')
}

