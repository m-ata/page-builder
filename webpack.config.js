var webpack = require('webpack')

module.exports = {
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['react', 'es2015', 'stage-2'],
                    },
                },
            }, {
                test: /\.css$/,
                include: paths.appSrc,
                loaders: [
                    require.resolve('style-loader'),
                    require.resolve('css-loader'),
                ],
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=application/font-woff',
            }, {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=application/font-woff',
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=application/octet-stream',
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader',
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=image/svg+xml',
            },
        ],
    },
    resolve: {
        alias: {
            FroalaEditor: 'file_name',
        },
        modules: ['../node_modules/froala-editor/js', 'node_modules'],
    },
    plugins: [
        new webpack.ProvidePlugin({
            FroalaEditor: 'file_name',
        }),
    ],
}

file_name: froala_editor.min.js / froala_editor.pkgd.min.js / plugins.pkgd.min.js
