import axios from '../../dist/system.es5.js'

axios({
    url: '/error/timeout',
    method: 'GET',
    params: { foo: ['bar', 'baz'] },
    timeout: 2000
})

axios({
    url: '/error/failed',
    method: 'GET',
    params: { foo: ['bar', 'baz'] },
    timeout: 2000
})


axios({
    url: '/error/404',
    method: 'GET',
    params: { foo: ['bar', 'baz'] },
    timeout: 2000
})
