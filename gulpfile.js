'use strict';
// generated on 2014-04-24 using generator-gulp-webapp 0.0.8

var gulp = require('gulp');


// load plugins
// see https://www.npmjs.org/package/gulp-load-plugins
var $ = require('gulp-load-plugins')();

gulp.task('templates', function() {
  return gulp.src('app/templates/pages/**/**/**/**/**/*.jade')
    .pipe($.jade({
      basedir: "app/templates",
      pretty: true
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe($.sass({
            style: 'expanded',
            includePaths: require('node-bourbon').includePaths
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter($.jshintStylish))
        .pipe($.size());
});

gulp.task('html', ['wiredep', 'styles', 'scripts', 'templates'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('.tmp/**/**/**/**/*.html')
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src(['app/images/**/*', 'app/bower_components/ghost-shield/dist/images/**/*'])
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src(['app/bower_components/ghost-shield/dist/webfonts/*'])
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});

gulp.task('cname', function () {
    return gulp.src('CNAME')
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['clean', 'cname', 'html', 'images', 'fonts' ]);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app'))
        // look in ghost shield too! XD
        .use(connect.static('app/bower_components/ghost-shield/dist'))
        .use(connect.static('.tmp'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://0.0.0.0:9000');
        });
});

gulp.task('serve', ['connect', 'styles', 'templates'], function () {
    require('opn')('http://0.0.0.0:9000');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        '.tmp/templates/**/*.jade',
        'app/*.html',
        '.tmp/styles/**/*.*',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('app/templates/**/*.jade', ['templates']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('deploy', [], function() {
  gulp.src("dist/**/*")
    .pipe($.ghPages({
        remoteUrl: 'git@github.com:masondesu/cool-new-ironyard-site.git',
        remote: 'origin',
        branch: 'gh-pages'
    }));
});

