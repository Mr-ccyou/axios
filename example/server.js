
const webpack = require('webpack')

// 容器, 可以将打包后的文件传递给服务器
const webpackDevMiddleware = require('webpack-dev-middleware')
// 热重载
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('./webpack.config')
const bodyParser = require('body-parser')
const express = require('express')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

const app = new express()
const compiler = webpack(webpackConfig)

app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: 'errors-only'
}))

app.use(webpackHotMiddleware(compiler))
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const router = express.Router()
router.get('/simple/get', (req, res) => {
    res.json({
        msg: 'hello, world'
    })
})

router.get('/base/get', (req, res) => {
    res.json(req.query)
})

router.post('/post/header', (req, res) => {
    res.json('hello')
})

router.post('/post/formdata', multipartMiddleware, (req, res) => {
    console.log(req.body, req.files);
    res.json(req.body)
})

router.get('/error/timeout', (req, res) => {
    setTimeout(() => {
        res.json(req.query)
    }, 3000)
})

router.get('/error/failed', (req, res) => {
    if (Math.random()>0.5) {
        res.status(500)
        res.end()
    } else {
        res.json(req.query)
    }
})

app.use(router)

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server listening in http://localhost:${port}`)
})
