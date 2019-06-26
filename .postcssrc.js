// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": {
    "postcss-import": {},
    "postcss-url": {},
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {},
    "postcss-px-to-viewport": {
              viewportWidth: 1242,
              viewportHeight: 2188,
              unitPrecision: 5,
              viewportUnit: 'vw' ,
              selectorBlackList: ['van-toast','van-toast--text','van-toast--middle','.ignore','.hairlines','.van-loading'],
              minPixelValue: 1,
              mediaQuery: false
           }
  }
}
