var 
  gulp = require('gulp'),

  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  templateCache = require('gulp-angular-templatecache'),
  ghtmlSrc = require('gulp-html-src'),
  gutil = require('gulp-util'),
  minifyCss = require('gulp-minify-css'),
  gulpif = require('gulp-if'),
  htmlreplace = require('gulp-html-replace'),
  minifyHTML = require('gulp-minify-html'),
  
  path = require('path'),
  spawn = require('child_process').spawn,
  streamqueue = require('streamqueue');

gulp.task('build', ['icon', 'js', 'css', 'index', 'fonts']);

gulp.task('publish', ['build'], function (done) {
  spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});    
    
gulp.task('index', function() {
  return gulp.src('src/index.html')
    .pipe(htmlreplace({
        'css': 'css/app.min.css',
        'js': 'js/app.min.js'
    }))
    .pipe(minifyHTML({spare: true, quotes: true}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('icon', function() {
   return gulp.src('src/icon.png').pipe(gulp.dest('dist/')); 
});

gulp.task('fonts', function() {
   return gulp.src('node_modules/font-awesome/fonts/*').pipe(gulp.dest('dist/fonts/')); 
});
    
gulp.task('js', function () {
  var scripts = gulp.src('src/index.html')
    .pipe(ghtmlSrc({getFileName: getFileName.bind(this, 'src')}));
    
  var templates = gulp.src(['src/**/*.html', '!src/index.html'])
    .pipe(minifyHTML({spare: true, quotes: true}))
    .pipe(templateCache('templates.js',  {root: '', module: 'ui'}));
    
  return  streamqueue({ objectMode: true }, scripts, templates)
    .pipe(gulpif(/[.]min[.]js$/, gutil.noop(), uglify()))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('css', function () {
  return gulp.src('src/index.html')
    .pipe(ghtmlSrc({getFileName: getFileName.bind(this, 'href'), presets: 'css'}))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat('app.min.css'))
    .pipe(gulp.dest('dist/css/'));
});

var vendorPrefix = "vendor/";
function getFileName(attr, node) {
  var file = node.attr(attr);
  if (file.indexOf(vendorPrefix) === 0)
    file = path.join("..", "node_modules", file.substr(vendorPrefix.length));
  return file;
}