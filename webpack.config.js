const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {
        'static/index': './src/index.js'
    },
    output: {
        path: path.resolve(__dirname,'./dist'),
        filename: '[name].[chunkhash].js'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /(node_modules)/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: [
                        ["@babel/preset-env"]
                    ],
                    plugins: [
                        "@babel/plugin-proposal-class-properties",
                    ]
                }
            },
        }]
    },
    devServer: {
        hot: true,
        inline: true,
        port: 8181,
        clientLogLevel: 'none'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            scriptLoading: 'blocking'
        })
    ]
}
