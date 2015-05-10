"use strict";

process.env.NODE_ENV = 'development';
var production = process.env.NODE_ENV === 'production';
// Флаг для Dev режима
var globalClean = true;

/********  START Function  ********/
var wrapBuild = function (curString) {
    return configData.buildPath + '/' + curString;
};
var wrapSrc = function (curString) {
    return configData.srcPath + '/' + curString;
};

var watchToFolder = function (str) {
    return str.substr(0, str.indexOf('*'));
};

var watchToChangeBuild = function (stringWatch) {
    return wrapBuild(watchToFolder(stringWatch));
};
/********  END Function  ********/

/* Production */
var gulp              = require('gulp'),
    _if               = require('gulp-if'),
    minifyCss         = require('gulp-minify-css'),
    concat            = require('gulp-concat'),
    uglify            = require('gulp-uglify'),
    changed           = require('gulp-changed'),
    imagemin          = require('gulp-imagemin'),
    pngquant          = require('imagemin-pngquant'),

    autoprefixer      = require('autoprefixer-core'),
    prefix            = require('gulp-autoprefixer'),
    gFilter           = require('gulp-filter'),
    mainBowerFiles    = require('main-bower-files'),

    postcss           = require('gulp-postcss'),
    postcssSimplevars = require('postcss-simple-vars'),
    postcssNested     = require('postcss-nested'),
    postcssMixins     = require('postcss-mixins'),
    postcssImport     = require('postcss-import'),
    postcssColorFunc  = require('postcss-color-function'),
    postcssPxtorem    = require('postcss-pxtorem'),
    colorAlpha        = require('postcss-color-alpha'),

    rename            = require('gulp-rename'),
    del               = require('del'),
    vinylPaths        = require('vinyl-paths');

/* Development*/
var sourcemaps  = require('gulp-sourcemaps'),
    rigger      = require('gulp-rigger'),
    rev         = require('gulp-rev-append'),
    gutil       = require('gulp-util'),
    browserSync = require('browser-sync'),
    watch       = require('gulp-watch'),
    stripDebug  = require('gulp-strip-debug'),
    reload      = browserSync.reload;

var configData = require('./build.config.json');

if (!!configData.buildPath == false) {
    console.log('Не задан параметр выходной директории build');
    process.exit(0);
}

var configLocal = {
    currentsrcPath: __dirname + '/' + configData.srcPath,
    confautoprefixer: {browsers: ["> 0%"]},//{browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']},
    structSrcFolder: {cwd: configData.srcPath, base: configData.srcPath},
    structBuildFolder: {cwd: configData.buildPath, base: configData.buildPath},
    minifyCss: {removeEmpty: true, keepSpecialComments: 0},
    browserSync: {
        server: {
            baseDir: configData.buildPath
        },
        reloadDelay: 2000,
        tunnel: true,
        host: 'localhost',
        port: 9000,
        logPrefix: "cbv"
    }
};

gulp.task('default', ['build', 'webserver', 'watch']);
gulp.task('production', ['setEnvProd', 'build', 'movToProd']);
gulp.task('build', ['html', 'js', 'css', 'fonts', 'img']);

//gulp.task('build-clean',['copy-bower'], function () {
gulp.task('build-clean', function () {
    if (globalClean) {
        globalClean = false;
        return gulp.src([configData.buildPath], {read: false})
            .pipe(stripDebug())
            .pipe(vinylPaths(del));
    }
});

gulp.task('webserver', function () {
    browserSync(configLocal.browserSync);
});


/********  START Production  ********/

gulp.task('setEnvProd', function () {
    if (!production) {
        process.env.NODE_ENV = 'production';
        production = process.env.NODE_ENV === 'production';
        configLocal.minifyCss.keepSpecialComments = '*';
    }
});

gulp.task('gen-productioin', ['build'], function () {
    // Если дошли до сюда, значит всё норм очищаем папку с Production и записываем в неё новую сборку
    return gulp.src([configData.productionPath], {read: false})
        .pipe(vinylPaths(del));

});

gulp.task('movToProd', ['gen-productioin'], function () {

    return gulp.src(configData.buildPath + '/**/*.*')
        .pipe(gulp.dest(configData.productionPath));
});

/********  END Production  ********/


/********  START General  ********/

/*  Обработчик HTML шаблонов файлов */
gulp.task('html', ['build-clean'], function () {
    return gulp.src(configData.src.html, configLocal.structSrcFolder)
        .pipe(_if(!production, changed(watchToChangeBuild(configData.watch.html))))
        .pipe(_if(!production, rev()))
        .pipe(_if(!production, gulp.dest(configData.buildPath)))
        .pipe(_if(!production, reload({stream: true})));
});

/*  Обработчик JS файлов */
gulp.task('js', ['build-clean'], function () {
    return gulp.src(configData.src.js, configLocal.structSrcFolder)
        .pipe(changed(watchToChangeBuild(configData.watch.js)))
        .pipe(_if(!production, sourcemaps.init())) // Для Dev режима
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(_if(!production, sourcemaps.write()))
        .pipe(gulp.dest(configData.buildPath))
        .pipe(_if(!production, reload({stream: true})));
});

gulp.task('postcss', ['build-clean'], function () {
    // Обрабатываем файлы css
    var processors = [
        autoprefixer(configLocal.confautoprefixer),
        postcssImport({from: configData.src.postcss}),
        postcssPxtorem({root_value: 14, unit_precision: 3, replace: true}),
        postcssSimplevars,
        postcssNested,
        colorAlpha,
        // Функции которые используются для построения css файлов, названия методов берутся из имен файлов
        postcssMixins({mixinsDir: configLocal.currentsrcPath + '/' + configData.src.mixinsDir})
    ];

    return gulp.src(configData.src.postcss, {cwd: configData.srcPath})
        .pipe(changed(watchToChangeBuild(configData.watch.postcss)))
        .pipe(_if(!production, sourcemaps.init())) // Для Dev режима
        .pipe(postcss(processors))
        .pipe(rename({suffix: '.min', extname: '.css'}))
        .pipe(minifyCss(configLocal.minifyCss))
        .pipe(_if(!production, sourcemaps.write()))
        .pipe(gulp.dest(
            function (file) {

                // Убеждаемся, что с первого символа
                var start = file.base.indexOf(configLocal.currentsrcPath);
                var fileDest = '';

                //fs.writeFileSync('./test.txt', file.base);

                if (start == 0) {

                    // Заменяем все changed из конфгурационного файла
                    fileDest = file.base.substr(configLocal.currentsrcPath.length);
                    for (var key in configData.change.postcss) {
                        fileDest = fileDest.replace(key, configData.change.postcss[key]);
                    }

                    (fileDest[0] == '/') && (fileDest = fileDest.substr(1));
                } else {
                    fileDest = 'css';
                }


                return wrapBuild(fileDest);
            }
        ))
        .pipe(_if(!production, reload({stream: true})));
});

/*  Копирование всех шрифтов из папки в папку */
gulp.task('fonts', ['build-clean'], function () {
    return gulp.src(configData.src.fonts, configLocal.structSrcFolder)
        .pipe(changed(watchToChangeBuild(configData.watch.fonts)))
        .pipe(gulp.dest(configData.buildPath))
        .pipe(_if(!production, reload({stream: true})));
});

/*  Обрабока стилей */
gulp.task('css', ['postcss'], function () {
    return gulp.src(configData.src.css, configLocal.structSrcFolder)
        .pipe(changed(watchToChangeBuild(configData.watch.css)))
        .pipe(_if(production, sourcemaps.init())) // Для Dev режима
        .pipe(prefix(configLocal.confautoprefixer))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss(configLocal.minifyCss))
        .pipe(_if(!production, sourcemaps.write()))
        .pipe(gulp.dest(configData.buildPath))
        .pipe(_if(!production, reload({stream: true})));
});

/* IMG */
gulp.task('img', ['build-clean'], function () {
    return gulp.src(configData.src.img, configLocal.structSrcFolder)
        .pipe(changed(watchToChangeBuild(configData.watch.img)))
        // Pass in options to the task
        .pipe(_if(production,
            imagemin({
                optimizationLevel: 5,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()],
                interlaced: true
            }))
    )
        .pipe(gulp.dest(configData.buildPath))
        .pipe(_if(!production, reload({stream: true})));
});


gulp.task('watch', function () {
    watch([wrapSrc(configData.watch.html)], function (event, cb) {
        gulp.start('html');
    });
    watch([wrapSrc(configData.watch.css)], function (event, cb) {
        gulp.start('css');
    });
    watch([wrapSrc(configData.watch.js)], function (event, cb) {
        gulp.start('js');
    });
    watch([wrapSrc(configData.watch.img)], function (event, cb) {
        gulp.start('img');
    });
    watch([wrapSrc(configData.watch.fonts)], function (event, cb) {
        gulp.start('fonts');
    });
});

// Copypast bower_components for development
gulp.task('copy-bower', function () {
    var jsFilter = gFilter('**/*.js');
    var cssFilter = gFilter('**/*.css');
    var fontFilter = gFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);
    var imgFilter = gFilter(['*.jpg', '*.png', '*.gif']);
    gulp.src(mainBowerFiles())
        .pipe(jsFilter)
        .pipe(gulp.dest('Content/NewDesign/javascripts/components'))
        .pipe(jsFilter.restore())
        .pipe(fontFilter)
        .pipe(gulp.dest('Content/NewDesign/fonts'))
        .pipe(fontFilter.restore())
        .pipe(imgFilter)
        .pipe(gulp.dest('Content/NewDesign/images'))
        .pipe(imgFilter.restore());
    // .pipe(cssFilter)
    // .pipe(gulp.dest('Content/NewDesign/stylesheets/components'));
});

/********  END General  ********/