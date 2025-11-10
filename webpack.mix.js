const mix = require('laravel-mix');
const path = require('path');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. We are setting up React with proper
 | hot module replacement and optimizations for production builds.
 |
 */

mix.js('resources/js/index.js', 'public/js/app.js')
   .react()
   .postCss('resources/css/app.css', 'public/css', [
       require('tailwindcss'),
       require('autoprefixer'),
   ])
   .webpackConfig({
       output: {
           chunkFilename: 'js/[name].js?id=[chunkhash]',
       },
       resolve: {
           extensions: ['.js', '.jsx'],
           alias: {
               '@': path.resolve('resources/js'),
           },
       },
   })
   .version();

// Development settings
if (!mix.inProduction()) {
    mix.sourceMaps()
       .webpackConfig({
           devtool: 'source-map'
       });
}
