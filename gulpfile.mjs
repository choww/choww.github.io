import gulp from 'gulp';
import plumber from 'gulp-plumber';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';
import stylus      from 'gulp-stylus';
import uglify      from 'gulp-uglify';
import concat      from 'gulp-concat';
import jeet        from 'jeet';
import rupture     from 'rupture';
import koutoSwiss  from 'kouto-swiss';
import prefixer    from 'autoprefixer-stylus';
import cp          from 'child_process';

var messages = {
	jekyllBuild: `<span style="color: grey">Running:</span> $ JEKYLL_ENV=${process.env.JEKYLL_ENV} jekyll build`
};

var jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', async function (done) {
	browserSync.notify(messages.jekyllBuild);
	return cp.spawn(jekyllCommand, ['build'], {stdio: 'inherit', env: process.env})
		.on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', async function () {
	browserSync.reload();
}));

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', gulp.series('jekyll-build', async function() {
	browserSync({
		server: {
			baseDir: '_site'
		}
	});
}));

/**
 * Stylus task
 */
gulp.task('stylus', async function(){
		gulp.src('src/styl/main.styl')
		.pipe(plumber())
		.pipe(stylus({
			use:[koutoSwiss(), prefixer(), jeet(),rupture()],
			compress: true
		}))
		.pipe(gulp.dest('_site/assets/css/'))
		.pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/css'));
});

/**
 * Javascript Task
 */
gulp.task('js', async function(){
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'))
		.pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('_site/assets/js/'));
});

/**
 * Imagemin Task
 */
gulp.task('imagemin', async function() {
	return gulp.src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('assets/img/'));
});

/**
 * Watch stylus files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
	gulp.watch('src/styl/**/*.styl', gulp.series('stylus'));
	gulp.watch('src/js/**/*.js', gulp.series('js'));
	gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series('imagemin'));
	gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '_posts/*'], gulp.series('jekyll-rebuild'));
});

/**
 * Default task, running just `gulp` will compile the stylus,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.series('js', 'stylus', 'browser-sync', 'watch'));
