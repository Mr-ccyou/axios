import axios from '../../dist/system.es5.js'

axios({
    url: '/base/get',
    method: 'GET',
    params: { foo: ['bar', 'baz'] }
})

// axios({
//     url: '/base/get',
//     method: 'GET',
//     params: { foo: { bar: 'baz' } }
// })

// const date = new Date()
// axios({
//     url: '/base/get',
//     method: 'GET',
//     params: { foo: date }
// })

// axios({
//     url: '/base/get',
//     method: 'GET',
//     params: { foo: '@:$,[] ' }
// })


// axios({
//     url: '/base/get#hash',
//     method: 'GET',
//     params: { foo: 'bar' }
// })


// axios({
//     url: '/base/get?test=123#hash',
//     method: 'GET',
//     params: { foo: 'bar' }
// })

console.log(axios.defaults)
