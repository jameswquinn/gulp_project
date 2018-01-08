const $ = require('gulp-load-plugins')()

module.exports = {

    '*.{jpg,png}': [{
      width: 1200,
      height: 628,
      negate: false,
      rename: {
        suffix: '-banner',
        extname: '.jpg',
      },
      format: 'jpeg',
    }, {
      width: 100,
      height: 100,
      rename: {
        suffix: '-100px',
        extname: '.jpg',
      },
      format: 'jpeg',
    }, {
      width: 240,
      height: 240,
      rename: {
        suffix: '-240px',
        extname: '.jpg',
      },
      format: 'jpeg',
    }, {
      width: 320,
      height: 320,
      rename: {
        suffix: '-320px',
        extname: '.jpg',
      },
      format: 'jpeg',
    }, {
      width: 500,
      rename: {
        suffix: '-500px',
        extname: '.jpg',
      },
      format: 'jpeg',
    }, {
      width: 640,
      rename: {
        suffix: '-640px',
        extname: '.jpg',
      },
      // format option can be omitted because
      // format of output image is detected from new filename
      // format: 'jpeg'
    }, {
      width: 800,
      rename: {
        suffix: '-800px',
        extname: '.jpg',
      },
      format: 'jpeg',
    }, {
      width: 1600,
      rename: {
        suffix: '-1600px',
        extname: '.jpg',
      },
      format: 'jpeg',
    }, {
      width: 2048,
      rename: {
        suffix: '-2048px',
        extname: '.jpg',
      },
      // Do not enlarge the output image if the input image are already less than the required dimensions.
      withoutEnlargement: true,
    }]

}
