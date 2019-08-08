import axios from '../../dist/system.es5.js'

async function send() {

    let res = await axios.get('/base/get', { params: {a:1, b:2}})
    console.log(res)

    res = await axios.post('/post/header', { a: 2, b: 1 }, {
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json, text/plain, *'
        }
    })

    console.log(res)

    res = await axios.request({
        url: '/post/header',
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json, text/plain, *'
        },
        data: { a: 2, b: 2 }
    })

    console.log(res)

    // 函数重载
    res = await axios('/post/header', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json, text/plain, *'
        },
        data: { a: 3, b: 3 }
    })

    console.log(res)

}

send()
