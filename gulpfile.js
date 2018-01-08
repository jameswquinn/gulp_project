/**
 *
 *  gulpfile.js
 *  Copyright 2015 James William Quinn. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
'use strict';

/**
 *
 * Loads gulp plugins from package dependencies and attaches them to an object of your choice.
 * https://github.com/jackfranklin/gulp-load-plugins
 *
 */

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const critical = require('critical');
const twigMarkdown = require('twig-markdown');
const bs = require('browser-sync');
const runOrder = require('run-sequence');
const trash = require('trash');
const deploy = require('gulp-deploy-git');
const frontMatter = require('gulp-front-matter');
const moment = require('moment');

/**
 *
 * Array to store PostCSS plugins
 *
 */

const postcssOptions = [
    require('lost')(),
    require('rucksack-css')({
        autoprefixer: false
    }),
    require('postcss-url')({
        filter: 'img/*.jpg',
        url: "inline"
    }),
    require('postcss-inline-svg'),
    require('postcss-svgo'),
    require('postcss-assets')({
        cachebuster: true
    }),
    require('postcss-type-scale')(),
    require('postcss-quantity-queries')(),
    require('postcss-short')(),
    require('postcss-sorting'),
    require('precss')(),
    require('postcss-cssnext')({
        browsers: ['last 2 versions', 'Firefox > 20'],
        warnForDuplicates: true
    }),
    require('postcss-uncss')({
        html: ['_gh_pages/**/*.html']
    }),
    require('postcss-csso')({
        preset: 'default'
    }),
];

const scssOptions = [
    require('autoprefixer')({
        browsers: ['last 2 versions', 'Firefox > 20']
    }),
    require('postcss-uncss')({
        html: ['_gh_pages/**/*.html']
    }),
    require('postcss-csso')({
        preset: 'default'
    }),
];

/**
 *
 * Customize your site in 'config' directory
 *
 */

const structure = require('./config/structure')
const twigOptions = require('./config/twig')
const responsiveOpions = require('./config/responsive')
const reporter = require('./config/reporter')
const server = require('./config/server')

/**
 *
 * Build index page by itself
 *
 */

gulp.task('index', () => {
    gulp.src(structure.src.index)
        .pipe($.plumber(reporter.onError))
        .pipe(frontMatter({ property: 'data', remove: false }))
        .pipe($.twig(twigOptions))
        .pipe($.htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true
        }))
        .pipe($.prettify())
        .pipe(gulp.dest(structure.dest.dir))
        .pipe(bs.stream())
})

gulp.task('pages', () => {
    gulp.src(structure.src.pages)
        .pipe($.plumber(reporter.onError))
        .pipe(frontMatter({ property: 'data', remove: false }))
        .pipe($.twig(twigOptions))
        .pipe($.htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true
        }))
        .pipe($.prettify())
        .pipe($.rename(file => {
            file.dirname = require('path').join(file.dirname, file.basename)
            file.basename = 'index'
            file.extname = '.html'
        }))
        .pipe(gulp.dest(structure.dest.dir))
        .pipe(bs.stream())
})

/**
 *
 * Compile and automatically prefix stylesheets
 *
 */

gulp.task('scss', () => {
    gulp.src(structure.src.scss)
        .pipe($.plumber(reporter.onError))
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe($.rename({
            basename: "app",
            suffix: '.min'
        }))
        .pipe($.postcss(scssOptions))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(structure.dest.css))
        .pipe(bs.stream())
})

gulp.task('css', () => {
    gulp.src(structure.src.css)
        .pipe($.plumber(reporter.onError))
        .pipe($.sourcemaps.init())
        .pipe($.rename({
            basename: "app",
            suffix: '.min'
        }))
        .pipe($.postcss(postcssOptions))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(structure.dest.css))
        .pipe(bs.stream())
})

gulp.task('js', () => {
    gulp.src(structure.src.js)
        .pipe($.plumber(reporter.onError))
        .pipe($.sourcemaps.init())
        .pipe($.concat('main.min.js'))
        .pipe($.uglify())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(structure.dest.js))
        .pipe(bs.stream())
})

/**
 *
 * Lint JavaScript
 *
 */

gulp.task('lint', () => {
    gulp.src(structure.src.js)
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe($.eslint({
            "rules": {
                "camelcase": 1,
                "comma-dangle": 2,
                "quotes": 0
            }
        }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe($.eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe($.eslint.failAfterError());
});

/**
 *
 * Optimize and build multiple responsive images
 *
 */
gulp.task('img', function() {
    return gulp.src(structure.src.img)
        .pipe($.plumber(reporter.onError))
        .pipe($.responsive(responsiveOpions))
        .pipe(gulp.dest(structure.dest.img))
        .pipe(bs.stream())
})

gulp.task('misc', () => {
    gulp.src(structure.src.misc)
        .pipe($.plumber(reporter.onError))
        .pipe(gulp.dest(structure.dest.misc))
        .pipe($.robots({
            useragent: '*',
            allow: ['folder1/', 'folder2/'],
            disallow: ['cgi-bin/']
        }))
        .pipe(gulp.dest(structure.dest.misc))
        .pipe($.humans({
            thanks: [
                'Node (@nodejs on Twitter)',
                'Gulp (@gulpjs on Twitter)'
            ],
            site: [
                'Standards: HTML5, CSS3',
                'Components: jQuery, Normalize.css',
                'Software: Atom'
            ],
            note: 'Built with love by ...'
        }))
        .pipe(gulp.dest(structure.dest.misc))
        .pipe(bs.stream())
})

/**
 *
 * Remove contents from build directory
 *
 */

gulp.task('clean', () => {
    trash([structure.dest.clean]).then(() => {
        console.log(`'${structure.dest.dir}' contents moved to trash.`);
    })
})

gulp.task('sitemap', () => {
    gulp.src(structure.src.root)
        .pipe($.sitemap({
            siteUrl: 'https://www.your_url_here.co'
        }))
        .pipe(gulp.dest(structure.dest.dir));
})

gulp.task('deploy', () => {
    gulp.src(structure.src.deploy)
        .pipe(deploy({
            repository: 'https://username@github.com/username/my-repo.git',
            branches: ['gh-pages']
        }))
        .pipe(deploy({
            repository: 'https://username@github.com/username/my-repo.git',
            branches: ['master']
        }))
})

gulp.task('permalinks', () => {
    var options = {
        helpers: {
            foo: function() {
                return this.context.stem.toUpperCase();
            },
            date: function() {
                return moment().format('YYYY/MM/DD');
                // writes to '_gh_pages/blog/2017/02/15/MY-FILE-STEM.html'
            }
        }
    }

    gulp.src(structure.src.posts)
        .pipe($.permalinks('blog/:date/:foo.md', options))
        .pipe(gulp.dest(structure.dest.dir));
});

/**
 *
 * Launch the dev server and watch for changes
 *
 */

gulp.task('serve', () => {
    gulp.watch(structure.src.scss, ['scss'])
    gulp.watch(structure.src.js, ['js'])
    gulp.watch(structure.src.img, ['img'])
    gulp.watch(structure.src.index, ['index'])
    gulp.watch(structure.src.pages, ['pages'])
    gulp.watch(structure.src.layouts, ['pages', 'index'])
    bs(server)
})

/**
 *
 * Generate & Inline Critical-path CSS
 *
 */

gulp.task('critical', (cb) => {
    critical.generate({
        // Inline the generated critical-path CSS
        // - true generates HTML
        // - false generates CSS
        inline: true,

        // Your base directory
        base: '_gh_pages',

        // HTML source
        //html: '<html>...</html>',

        // HTML source file
        src: 'index.html',

        // Your CSS Files (optional)
        //css: ['dist/styles/main.css'],

        dimensions: [{
            // Viewport width
            width: 320,

            // Viewport height
            height: 480
        }, {
            // Viewport width
            width: 1300,

            // Viewport height
            height: 900
        }],

        // Target for final HTML output.
        // use some CSS file when the inline option is not set
        dest: 'index-critical.html',

        // Minify critical-path CSS when inlining
        minify: true,

        // Extract inlined styles from referenced stylesheets
        //extract: true,

        // Complete Timeout for Operation
        timeout: 30000,

        // Prefix for asset directory
        //pathPrefix: '/MySubfolderDocrot',

        // ignore CSS rules
        //ignore: ['font-face', /some-regexp/],

        // overwrite default options
        ignoreOptions: {}
    });
});

/**
 *
 * default 'gulp' task
 *
 */

gulp.task('default', () => {
    runOrder('pages', 'index', 'js', 'img', 'serve', 'misc', 'sitemap', 'scss')
})

/*

index.md
---
title: Home
description: Description of this page.
---

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.


index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="description" content="<%= file.frontMatter.description %>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My Website ∙ <%= file.frontMatter.title %></title>
  </head>
  <body>

    <%= contents %>

  </body>
</html>


// gulpfile.js
const gulp = require('gulp');
const frontMatter = require('gulp-front-matter');
const $ = require('gulp-load-plugins')();

gulp.task('views', function () {
  return gulp.src('app/*.md')
    .pipe($.frontMatter())
    .pipe($.markdown())
    .pipe($.wrap({src: 'app/default.html'}))
    .pipe($.htmlmin({
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeOptionalTags: true
}))
    .pipe($.rename(file => {
        file.dirname = require('path').join(file.dirname, file.basename)
        file.basename = 'index'
        file.extname = '.html'
    }))
    .pipe(gulp.dest('.tmp'));
});
*/
