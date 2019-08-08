import axios from '../../dist/system.es5.js'

async function send() {

    // axios.interceptors.request.use(function (config) {
    //     config.headers.test += '1'
    //     return config
    // })

    // axios.interceptors.request.use(function (config) {
    //     config.headers.test += '2'
    //     return config
    // })

    // axios.interceptors.request.use(function (config) {
    //     config.headers.test += '3'
    //     return config
    // })

    // axios.interceptors.response.use(function (response) {
    //     response.data += '1'
    //     return response
    // })

    // let id = axios.interceptors.response.use(function (response) {
    //     response.data += '2'
    //     return response
    // })

    // axios.interceptors.response.use(function (response) {
    //     response.data += '3'
    //     return response
    // })

    // axios.interceptors.response.eject(id)

    axios.defaults.headers.common['reff'] = 12

    let res = await axios.post('/post/header', { a: 2, b: 1 }, {
        headers: {
            'test': '',
            'post': {
                'Content-Type': 'application/json1',
            },
            'common': {
                'reff': 'kkk'
            }
        }
    })

    console.log(res)
}

send()
