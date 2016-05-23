var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var templateCache = require('gulp-angular-templatecache');
var gulpNgConfig = require('gulp-ng-config');
var override = require('json-override');
var fs = require('fs');

var paths = {
    sass: ['./scss/**/*.scss'],
    templatecache: ['./www/templates/ng-templates/**/*.html']
};


gulp.task('configsetup',['mergeconfig','setupenv','buildconfig']);

gulp.task('setupenv',function(){
    var config = JSON.parse(fs.readFileSync('./domains/config.json','utf-8'));
    if(gutil.env.prod){
        console.log('env prod');
        config.myConfig.api_base_domain = "api.firstlife.di.unito.it/";
        config.myConfig.dev = false;
    }else if(gutil.env.test){
        console.log('env test');
        config.myConfig.api_base_domain = "api.test.firstlife.di.unito.it/";
        config.myConfig.dev = false;
    }else if(gutil.env.test){
        console.log('env dev');
        config.myConfig.api_base_domain = "api.dev.firstlife.di.unito.it/";
    }
    console.log('setup env host ',config.myConfig.api_base_domain);
    fs.writeFile('./domains/config.json',JSON.stringify(config),'utf-8', function(e){ console.log('setup env: ',e ? e : 'ok!');}); 
});

gulp.task('mergeconfig', function(){
    var defaults = JSON.parse(fs.readFileSync('./domains/defaults.json','utf-8'));
    var domain = null;
    var config = null;
    if(gutil.env.domain){
        domain = gutil.env.domain;
    }
    if(!domain){
        config = defaults
    }else{
        var extras = JSON.parse(fs.readFileSync('./domains/'+domain+'.json','utf-8'));
        config = override(defaults,extras,true);
    }
    fs.writeFileSync('./domains/config.json',JSON.stringify(config),'utf-8', function(e){ console.log('merge result: ',e ? e : 'ok!');});
});

gulp.task('buildconfig', function () {
    gulp.src('./domains/config.json')
        .pipe(gulpNgConfig('firstlife.config'))
        .pipe(gulp.dest('./www/js'));
    console.log('buildconfig ok!');
});


gulp.task('default', ['sass', 'templatecache']);

gulp.task('templatecache', function (done) {
    gulp.src('./www/templates/**/*.html')
        .pipe(templateCache({standalone:true}))
        .pipe(gulp.dest('./www/js'))
        .on('end', done);
});

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
        keepSpecialComments: 0
    }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.templatecache, ['templatecache']);
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
        gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
