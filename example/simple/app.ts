import axios from '../../dist/system.es5.js'

let res = axios({
    url: '/simple/get',
    method: 'GET',
    params: { a: 1, b: 2 }
})
