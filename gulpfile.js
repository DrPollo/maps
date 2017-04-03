var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-clean-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var templateCache = require('gulp-angular-templatecache');
var gulpNgConfig = require('gulp-ng-config');
var override = require('json-override');
var fs = require('fs');
var fse = require('fs-extra');
var run = require('sync-exec');

var paths = {
    sass: ['./scss/*.scss'],
    templatecache: ['./www/templates/ng-templates/**/*.html']
};

gulp.task('deploy-all', function(){

    // setup packages
    try{
        run('npm build .');
    }catch(err){
        throw new gutil.PluginError({
            plugin: 'mergeconfig',
            message: 'npm build error'
        });
    }
    console.log('rebuild npm packages!');
    // fine setup packages

    // carico defaults
    var defaults = null;
    try{
        defaults = JSON.parse(fs.readFileSync('./domains/defaults.json','utf-8'));
    }catch(err){
        console.log('defaults.json parse error ',err);
        throw new gutil.PluginError({
            plugin: 'mergeconfig',
            message: 'defaults.json JSON.parse error'
        });
    }
    // fine carico defaults

    // catturo environment
    var env = false;
    if(gutil.env.prod)
        env = 'prod';
    if(gutil.env.test)
        env = 'test';
    if(gutil.env.dev)
        env = 'dev';
    // catturo environment


    // ciclo i file environment
    var files = fs.readdirSync('domains/');
    console.log('files to process: ',files.length);
    for(var i in files){
        var file = files[i];
        if(file.search('.json') != -1 && file != 'config.json') {
            console.log('loading ',file);
            var config = null;
            var extras = null;
            try {
                extras = JSON.parse(fs.readFileSync('./domains/' + file, 'utf-8'));
            } catch (err) {
                console.error(file, ' parse error ', err);
                // throw new gutil.PluginError({
                //     plugin: 'mergeconfig',
                //     message: file.name + ".json JSON.parse error"
                // });
            }
            // i need to skip?
            var ok = true;
            if (extras && file != "defaults.json"){
                try{
                    config = override(defaults, extras, true);
                } catch(err){
                    console.error(file, ' merge error ', err);
                    // skip
                    ok = false;
                }
            }else if(file == "defaults.json"){
                config = defaults;
            }

            if(ok){
                var domain = file.slice(0,-5);
                console.log('setup domain:', domain);

                // setup variabilit e url
                switch (env) {
                    case 'prod':
                        console.log('env prod');
                        config.myConfig.api_base_domain = "api.firstlife.org/";
                        config.myConfig.dev = false;
                        break;
                    case 'test':
                        console.log('env test');
                        config.myConfig.api_base_domain = "api.test.firstlife.di.unito.it/";
                        config.myConfig.dev = false;
                        break;
                    case 'dev':
                        console.log('env dev');
                        config.myConfig.api_base_domain = "api.dev.firstlife.di.unito.it/";
                        config.myConfig.dev = false;
                        break;
                    default:
                        config.myConfig.dev = true;
                }
                console.log('setup env host: ', config.myConfig.api_base_domain);
                fs.writeFileSync('./www/config.json', JSON.stringify(config), 'utf-8', function (e) {
                    console.log('setup env: ', e ? e : 'ok!');
                });
                // end setup the environment


                // build config file
                gulp.src('./www/config.json').pipe(gulpNgConfig('firstlife.config'))
                    .pipe(gulp.dest('./www/js'));
                console.log('buildconfig ok!');
                // end build config file


                // copy file to target directory
                var dir = (domain != 'defaults') ?  '../firstlife-' + domain : '../firstlife';
                console.log('moving to directory',dir);
                fse.copySync('www', dir, {mkdirp: true, clobber: true}, function (err) {
                    console.log('move clent ', err ? err : 'ok!');
                });
                console.log("move file ok!");
                // end copy file to target directory

                // fix directory owner
                var user = gutil.env.user ? gutil.env.user : '';
                var group = gutil.env.group ? gutil.env.group : '';
                if (gutil.env.apache && sh.exec('chown -R '+user+':'+group+' '+dir).code !== 0) {
                    sh.echo('Error: chown failed');
                    sh.exit(1);
                }else{
                    console.log('fix owner ok');
                }
            }
        }
    }
});

gulp.task('deploy',['config','move']);

gulp.task('move',function(){
    var dir = '../firstlife'
    if(gutil.env.domain)
        dir = '../firstlife-'+gutil.env.domain;
    
    fse.copySync('www', dir, {mkdirp: true,clobber:true}, function(err) {console.log('move clent ',err ? err : 'ok!');}); 
    console.log("move file ok!");
});

gulp.task('config',['rebuild','mergeconfig','setupenv','buildconfig']);

gulp.task('rebuild',function(){
    try{
        run('npm build .');
    }catch(err){
         throw new gutil.PluginError({
                plugin: 'mergeconfig',
                message: 'npm build error'
            });
    }
    console.log('rebuild npm packages!');
});

gulp.task('setupenv',function(){
    var config = JSON.parse(fs.readFileSync('./domains/config.json','utf-8'));
    var domain_name = (config.myConfig.domain_name && config.myConfig.domain_name != 'firstlife') ? config.myConfig.domain_name : null;
    if(gutil.env.prod){
        console.log('env prod');
        config.myConfig.api_base_domain = "api.firstlife.org/";
        config.myConfig.dev = false;
    }else if(gutil.env.test){
        console.log('env test');
        config.myConfig.api_base_domain = "api.test.firstlife.di.unito.it/";
        config.myConfig.dev = false;
    }else if(gutil.env.dev){
        console.log('env dev');
        config.myConfig.api_base_domain = "api.dev.firstlife.di.unito.it/";
        config.myConfig.dev = false;
    }
    console.log('setup env host: ',config.myConfig.api_base_domain);
    fs.writeFileSync('./www/config.json',JSON.stringify(config),'utf-8', function(e){ console.log('setup env: ',e ? e : 'ok!');});
});

gulp.task('mergeconfig', function(){
    var defaults = null;
    try{
        defaults = JSON.parse(fs.readFileSync('./domains/defaults.json','utf-8'));
    }catch(err){
        console.log('defaults.json parse error ',err);
        throw new gutil.PluginError({
                plugin: 'mergeconfig',
                message: 'defaults.json JSON.parse error'
            });
    }
    var domain = null;
    var config = null;
    if(gutil.env.domain){
        domain = gutil.env.domain;
    }
    if(!domain){
        config = defaults;
    }else{
        var extras = null;
        try{
            extras = JSON.parse(fs.readFileSync('./domains/'+domain+'.json','utf-8'));
        }catch(err){
            console.log(domain,'.json parse error ',err);
            throw new gutil.PluginError({
                plugin: 'mergeconfig',
                message: domain+".json JSON.parse error"
            });
        }
        if(extras)
            config = override(defaults,extras,true);
            
    }
    fs.writeFileSync('./www/config.json',JSON.stringify(config),'utf-8', function(e){ console.log('merge result: ',e ? e : 'ok!');});
});

gulp.task('buildconfig', function () {
    gulp.src('./www/config.json')
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