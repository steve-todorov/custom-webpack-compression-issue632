import * as webpack from 'webpack';
import {Plugin} from 'webpack';
import * as path from 'path';
import * as angularJson from '../angular.json';
import * as packageJson from '../package.json';

import {CustomWebpackBrowserSchema} from '@angular-builders/custom-webpack/dist';
import * as CompressionPlugin from 'compression-webpack-plugin';
import * as ManifestPlugin from 'webpack-manifest-plugin';

const appName = angularJson.defaultProject;
const buildOptions = angularJson.projects[appName].architect.build.options;

const projectRootPath = (...appendPaths) => {
    return path.resolve(__dirname, '../', appendPaths ? appendPaths.join('/') : '');
};

const appPath = projectRootPath('src', 'app');

const distPath = (...appendPaths) => {
    const rootPath = buildOptions.outputPath;
    const deployUrl = ('' + buildOptions.deployUrl).replace(/(^\/|\/+$)/mg, '');
    const count = (deployUrl.match(/\//g) || []).length;
    let traverse = '';

    for (let i = 0; i <= count; i++) {
        traverse += '../';
    }

    return path.resolve(rootPath, traverse, appendPaths ? appendPaths.join('/') : '');
};

const assetsPath = (...appendPaths) => {
    return distPath('static/assets', appendPaths);
};

console.log();
console.table([
    {key: 'rootPath', value: projectRootPath()},
    {key: 'appPath', value: appPath},
    {key: 'distPath', value: distPath()},
    {key: 'outputPath', value: buildOptions.outputPath},
    {key: 'assetsPath', value: assetsPath()},
    {key: 'baseHref', value: buildOptions.baseHref},
    {key: 'deployUrl', value: buildOptions.deployUrl},
    {key: 'version', value: packageJson.version}
], ['key', 'value']);
console.log('\n');

function commonPlugins(): Plugin[] | any {
    return [] as Plugin[] | any;
}

function productionPlugins(): Plugin[] | any {
    return [
        new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|woff|woff2|ttf|svg|eot)$/,
            threshold: 10240,
            minRatio: 0.9,
        }),
        new CompressionPlugin({
            filename: '[path].br[query]',
            algorithm: 'brotliCompress',
            test: /\.(js|css|woff|woff2|ttf|svg|eot)$/,
            compressionOptions: {level: 11},
            threshold: 10240,
            minRatio: 0.9,
        }),
        new ManifestPlugin({
            fileName: '../../assets-manifest.json',
            seed: {
                'index.html': '/'
            }
        })
    ] as Plugin[] | any;
}

export default (config: webpack.Configuration, options: CustomWebpackBrowserSchema) => {

    config.plugins = [...config.plugins, ...commonPlugins()];

    if (config.mode === 'production') {
        config.plugins = [...config.plugins, ...productionPlugins()];
    }

    console.log(`[Webpack] Enabled plugins: \n${config.plugins.map(p => p.constructor.name).join(', ')}\n`);

    return config;
};
