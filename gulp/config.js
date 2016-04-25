'use strict';

module.exports = {

  serverport: 3000,

  environments: './environments.json',

  scripts: {
    watch: './app/scripts/**/*.{js,jsx}',
    vendor: {
      bundleName: 'vendor.bundle.js'
    },
    apps: {
      baseDir: './app/scripts/apps',
      destDir: 'apps/'
    },
    third: {
      baseDir: './app/scripts/vendor/*.{js,jsx}',
      dest: './dist/js/',
      watch: './app/scripts/vendor/*.{js,jsx}',
    },
    dest: './dist/js/'
  },

  assets: {
    fonts: {
      src: './app/assets/fonts/**/*.{jpeg,jpg,png,svg,eot,ttf,woff,woff2}',
      dest: './dist/assets/fonts/'
    },
    images: {
      src: './app/assets/images/**/*.{jpeg,jpg,png,svg}',
      dest: './dist/assets/images/'
    }
  },

  styles: {
    watch: './app/styles/**/*.scss',
    src: ['./app/styles/pages/*.scss', './app/styles/common/*.scss'],
    dest: './dist/css/'
  },

  html: {
    watch: './app/html/pages/**/*.html',
    src: './app/html/pages/**/*.html',
    dest: './dist/'
  },

  buildDir: './dist/'

};
