import axios from '../../dist/system.es5.js'

async function send() {
    let res = await axios({
        url: '/post/header',
        method: 'POST',
        data: { a: 1, b: 1 },
        type: 'json'
    })

    console.log(res)


    res = await axios({
        url: '/post/header',
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json, text/plain, *'
        },
        data: { a: 1, b: 1 }
    })

    let data = new FormData()
    data.append('name', '1')

    res = await axios({
        url: '/post/formdata',
        method: 'POST',
        data
    })

}

send()
