// Folder Structure Defaults
const build  = '_gh_pages'
const pages  = '_pages'
const assets = 'assets'
const css    = 'css'
const scss   = 'scss'
const js     = 'js'
const img    = 'img'
const misc   = 'misc'
const clean  = '{!.git,*}'
const posts = '_posts'

// Where to look for source files
exports.src = {
  index:   `${pages}/index.html`,
  pages:   `${pages}/!(index).html`,
  layouts: `${pages}/**/_*.html`,
  css:     `${assets}/${css}/*.css`,
  scss:    `${assets}/${css}/${scss}/*.{scss,sass}`,
  js:      `${assets}/${js}/**/*`,
  img:     `${assets}/${img}/**/*`,
  misc:    `${misc}/**/*`,
  posts:   `${posts}/**/*.{markdown,md}`,
  root:    `${build}/**/*.html`,
  deploy:  `${build}/**/**/*`
}

// Where to build your site
exports.dest = {
  dir:   `${build}`,
  css:   `${build}/${css}`,
  js:    `${build}/${js}`,
  img:   `${build}/${img}`,
  clean: `${build}/${clean}`,
  misc:  `${build}/`
}
