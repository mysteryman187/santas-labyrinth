var path = require('path')
var webpack = require('webpack')
//var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var isometric = path.join(__dirname, '/node_modules/phaser-plugin-isometric/dist/phaser-plugin-isometric');
var p2 = path.join(__dirname, '/node_modules/p2/src/p2');

module.exports = {
    entry: './src/main.js',
    output: { path: __dirname, filename: 'bundle.js' },   
    devtool: 'cheap-source-map',
    watch: true,
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-2']
                }
            },
            { test: /package.json/, loader: 'json' },
            { test: /pixi\.js/, loader: 'expose?PIXI' },
            { test: /phaser-split\.js$/, loader: 'expose?Phaser' },
            { test: /p2\.js/, loader: 'expose?p2' }
        ]
    },
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    },
    resolve: {
        alias: {
            'phaser': phaser,
            'pixi': pixi,
            'isometric': isometric,
            'p2': p2            
        }
    }
}