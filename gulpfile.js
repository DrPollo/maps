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
var sequence = require('run-sequence');
var env = require('gulp-env');

var paths = {
    sass: ['./scss/*.scss'],
    templatecache: ['./www/templates/ng-templates/**/*.html']
};

gulp.task('golive', function(){
    var defaultBranch = 'dev';

    // reset delle modifiche locali
    var c1 = sh.exec('git reset --hard').code;
    console.log('reset repo result', (c1 === 0) ? 'ok' : 'error '+c1);
    if(c1 !== 0)
        throw new gutil.PluginError({
            plugin: 'git reset',
            message: "cannot reset git local repo"
        });

    // switch branch
    var c3 = sh.exec('git checkout ', (gutil.env.branch) ? gutil.env.branch : defaultBranch ).code;
    if(c3 !== 0)
        throw new gutil.PluginError({
            plugin: 'git checkout',
            message: "cannot switch branch to "+gutil.env.branch
        });
    console.log('swithched to branch',(gutil.env.branch) ? gutil.env.branch : defaultBranch );

    // pull del progetto
    var c2 = sh.exec('git pull').code;
    console.log('pull remote repo result',c2 === 0 ? 'ok' : 'error '+c2);
    if(c2 !== 0)
        throw new gutil.PluginError({
            plugin: 'git pull',
            message: "cannot pull remote repo"
        });
    console.log('local repo updated')

    // setup enviroment
    env({
        user: 'apache',
        group: 'apache'
    })
    gulp.start('deploy-all');

    console.log('golive ok!');
})

gulp.task('deploy-all', function(){
    var setup = null;
    if(gutil.env.prod)
        setup = 'prod';
    if(gutil.env.test)
        setup = 'test';
    if(gutil.env.dev)
        setup = 'dev';

    // carico i file environment
    try {
        var files = fs.readdirSync('domains/');
    } catch (err) {
        console.error('directory read error ', err);
        throw new gutil.PluginError({
            plugin: 'readdireSync',
            message: ".json directory read error"
        });
    }
    console.log('files to process: ',files.length);

    // rebuild packages
    sequence('rebuild');

    // ciclo i file
    for(var i in files){
        var file = files[i];
        if(file.search('.json') != -1 && file != 'config.json') {
            var domain = file.slice(0,-5);

            // build of command
            var cmd = 'gulp deploy --norebuild';

            // setup user
            if(gutil.env.user)
                cmd = cmd.concat(" --user="+gutil.env.user);
            // setup group
            if(gutil.env.group)
                cmd = cmd.concat(" --group="+gutil.env.group);
            // setup domain
            if(domain != 'defaults') {
                cmd = cmd.concat(" --domain=" + domain);
            }
            if(setup){
                cmd = cmd.concat(" --"+setup);
            }
            console.log('deploy of ',domain ? domain: 'firstlife',' result: ',sh.exec(cmd).code == 0 ? 'ok!' : 'error :(' );
        }
    }
    console.log('fine deploy-all');
    sh.exit(0);
});

gulp.task('deploy',['config','move']);

gulp.task('move',function(){
    var dir = '../firstlife'
    if(gutil.env.domain)
        dir = '../firstlife-'+gutil.env.domain;

    fse.copySync('www', dir, {mkdirp: true,clobber:true}, function(err) {console.log('move clent ',err ? err : 'ok!');});
    console.log("move file ok!");

    // fix directory owner
    var user = gutil.env.user ? gutil.env.user : '';
    var group = gutil.env.group ? gutil.env.group : '';
    if (user || group ) {
        var code = sh.exec('chown -R ' + user + ':' + group + ' ' + dir).code;
        if (code !== 0){
            console.error('Error: chown failed');
            //sh.exit(1);
        }else{
            //sh.exit(0);
            console.log('fix owner ',user,':',group, 'of dir',dir);
        }
    }
});

gulp.task('config',['rebuild','mergeconfig','setupenv','buildconfig']);

gulp.task('rebuild',function(){
    if(gutil.env.norebuild)
        return

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
    var path = './www/config.json';
    var config = JSON.parse(fs.readFileSync('./www/config.json','utf-8'));
    var domain_name = (config.myConfig.domain_name && config.myConfig.domain_name != 'firstlife') ? config.myConfig.domain_name : null;

    // setup defaults
    console.log('default env test');
    config.myConfig.api_base_domain = "api.dev.firstlife.di.unito.it/";
    config.myConfig.dev = false;

    // override defaults
    if(gutil.env.prod){
        console.log('env prod');
        config.myConfig.api_base_domain = "api.firstlife.org/";
        config.myConfig.dev = false;
    }else if(gutil.env.dev){
        console.log('env dev');
        config.myConfig.api_base_domain = "api.dev.firstlife.di.unito.it/";
        config.myConfig.dev = true;
    }

    console.log('setup env host: ',config.myConfig.api_base_domain);
    // cancello il file
    try{
        fs.unlinkSync(path);
    }catch (err) {
        console.log('nothing to delete');
    }
    fs.writeFileSync(path,JSON.stringify(config),'utf-8');
});

gulp.task('mergeconfig', function(){
    var defaults = null;
    var path = './www/config.json';
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
    // cancello il file
    try{
        fs.unlinkSync(path);
    }catch (err) {
        console.log('nothing to delete');
    }
    fs.writeFileSync(path,JSON.stringify(config),'utf-8');
});

gulp.task('buildconfig', function () {
    var path = './www/js/';
    // cancello il file
    try{
        fs.unlinkSync(path+'config.js');
    }catch (err) {
        console.log('nothing to delete');
    }
    try{
        var config = JSON.stringify(JSON.parse(fs.readFileSync('./www/config.json','utf-8')).myConfig);
    }catch (err) {
        console.error('cannot read config.json',err);
        throw new gutil.PluginError({
            plugin: 'readFileSync',
            message:"config.json read error"
        });
    }
    // create wrap
    var file = ('angular.module("firstlife.config", []).constant("myConfig",').concat(config, ");");
    try{
        fs.writeFileSync(path+'config.js',file,'utf-8');
    }catch (err) {
        console.error('cannot write config.js',err);
        throw new gutil.PluginError({
            plugin: 'writeFileSync',
            message:"config.js write error"
        });
    }
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