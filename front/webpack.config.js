const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { SourceMapDevToolPlugin, ProvidePlugin } = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    devtool: "source-map",
    mode: 'development',
    entry: {
        app: './src/index.tsx',
        'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
        // 'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
        // 'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
        // 'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
        // 'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker'
    },
    devServer: {
        hot: true
    },
    externals: ['worker_threads', 'ws', 'perf_hooks', 'child_process'],
    resolve: {
        alias: {
            'scene': path.resolve(__dirname, '../scene/'),
            'src': path.resolve(__dirname, 'src/'),
            'web': path.resolve(__dirname, 'web/'),
        },
        extensions: ['*', '.js', '.jsx', '.tsx', '.ts', '.scss'],
        fallback: {
            assert: require.resolve('assert'),
            buffer: require.resolve('buffer'),
            path: require.resolve('path-browserify'),
            process: require.resolve('process/browser'),
            stream: require.resolve('stream-browserify'),
            url: require.resolve('url'),
            util: require.resolve("util"),
            fs: 'memfs'
        }
    },
    output: {
        globalObject: 'self',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    target: 'web',
    module: {
        noParse: [require.resolve('typescript/lib/typescript.js')],
        rules: [
            {
                test: /\.(wasm|data)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]',
                }
            },
            {
                test: /\.json$/,
                type: 'json',
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    'sass-loader'
                ],
            },
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
                            plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean)
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ttf$/,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new SourceMapDevToolPlugin({
            filename: "[file].map"
        }),
        new ProvidePlugin({
            process: 'process/browser',
        }),
        new HtmlWebPackPlugin({
            template: 'src/index.html'
        }),
        isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean)
};