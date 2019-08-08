
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

module.exports = {
    mode : 'development',
    entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
        const fulldir = path.resolve(__dirname, dir)
        const entry = path.join(fulldir, 'app.ts')

        // 添加多入口
        if (fs.statSync(fulldir).isDirectory() && fs.existsSync(entry)) {
            entries[dir] = ['webpack-hot-middleware/client', entry]
        }

        return entries
    }, {}),
    output: {
        path: path.resolve(__dirname, 'bulid'),
        filename: '[name].js',
        publicPath: '/bulid/'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                use: [{
                    loader: 'tslint-loader'
                }],
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'tslint-loader',
                    options: {
                        transpaileOnly: true
                    }
                }],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [ new webpack.HotModuleReplacementPlugin() ]
}
