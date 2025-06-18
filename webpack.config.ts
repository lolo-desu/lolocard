import HtmlInlineScriptWebpackPlugin from 'html-inline-script-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import url from 'node:url';
import { Server } from 'socket.io';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
const require = createRequire(import.meta.url);
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Config {
  port: number;
  entries: Entry[];
}
interface Entry {
  script: string;
  html?: string;
  minimize?: boolean;
}

const config: Config = {
  port: 6621,
  entries: [
    ...fs.globSync(['src/**/index.ts']).map(script => {
      const html = path.join(path.dirname(script), 'index.html');
      if (fs.existsSync(html)) {
        return { script, html };
      }
      return { script };
    }),
  ],
};

let io: Server;
function watch_it(compiler: webpack.Compiler) {
  if (compiler.options.watch) {
    if (!io) {
      const port = config.port ?? 6621;
      io = new Server(port, { cors: { origin: '*' } });
      console.info(`[Listener] 已启动酒馆监听服务, 正在监听: http://0.0.0.0:${port}`);
      io.on('connect', socket => {
        console.info(`[Listener] 成功连接到酒馆网页 '${socket.id}', 初始化推送...`);
        socket.on('disconnect', reason => {
          console.info(`[Listener] 与酒馆网页 '${socket.id}' 断开连接: ${reason}`);
        });
      });
    }

    compiler.hooks.done.tap('updater', () => {
      console.info('\n[Listener] 检测到完成编译, 推送更新事件...');
      io.emit('iframe_updated');
    });
  }
}

function parse_configuration(entry: Entry): (_env: any, argv: any) => webpack.Configuration {
  const script_filepath = path.parse(entry.script);
  const should_minimize = entry.minimize ?? true;

  let plugins: webpack.Configuration['plugins'] = [];
  if (entry.html === undefined) {
    plugins.push(new MiniCssExtractPlugin());
  } else {
    plugins.push(
      new HtmlWebpackPlugin({
        template: path.join(__dirname, entry.html),
        filename: path.parse(entry.html).base,
        scriptLoading: 'blocking',
        cache: false,
      }),
      new HtmlInlineScriptWebpackPlugin(),
      new MiniCssExtractPlugin(),
      new HTMLInlineCSSWebpackPlugin({
        styleTagFactory({ style }: { style: string }) {
          return `<style>${style}</style>`;
        },
      }),
    );
  }
  plugins.push({ apply: watch_it });

  return (_env, argv) => ({
    experiments: {
      outputModule: true,
    },
    devtool: argv.mode === 'production' ? false : 'eval-source-map',
    entry: path.join(__dirname, entry.script),
    target: 'browserslist',
    output: {
      devtoolModuleFilenameTemplate: 'webpack://tavern_helper_template/[resource-path]?[loaders]',
      filename: `${script_filepath.name}.js`,
      path: path.join(__dirname, 'dist', path.relative(path.join(__dirname, 'src'), script_filepath.dir)),
      chunkFilename: `${script_filepath.name}.[contenthash].chunk.js`,
      asyncChunks: true,
      chunkLoading: 'import',
      clean: true,
      publicPath: '',
      library: {
        type: 'module',
      },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
              resourceQuery: /raw/,
              type: 'asset/source',
            },
            {
              test: /\.(sa|sc|c)ss$/,
              use: [
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      config: path.resolve(__dirname, 'postcss.config.js'),
                    },
                  },
                },
                'sass-loader',
              ],
              resourceQuery: /raw/,
              type: 'asset/source',
            },
            {
              resourceQuery: /raw/,
              type: 'asset/source',
            },
            {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
              exclude: /node_modules/,
            },
            {
              test: /\.html?$/,
              use: 'html-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.(sa|sc|c)ss$/,
              use: [
                MiniCssExtractPlugin.loader,
                { loader: 'css-loader', options: { url: false } },
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      config: path.resolve(__dirname, 'postcss.config.js'),
                    },
                  },
                },
                'sass-loader',
              ],
              exclude: /node_modules/,
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx', '.css'],
      plugins: [
        new TsconfigPathsPlugin({
          extensions: ['.ts', '.js', '.tsx', '.jsx'],
          configFile: path.join(__dirname, 'tsconfig.json'),
        }),
      ],
      alias: {},
    },
    plugins: plugins,
    optimization: {
      minimize: should_minimize,
      minimizer: [new TerserPlugin()],
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          default: {
            name: 'default',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    externalsType: 'var',
    externals: [/^_$/i, /^(jquery|\$)$/i, /^jqueryui$/i, /^toastr$/i, /^yaml$/i],
  });
}

export default config.entries.map(parse_configuration);
