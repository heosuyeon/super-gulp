import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
// import sass from "gulp-sass";
// sass.compiler = require("node-sass");
import dartSass from "sass";
import gulpSass from "gulp-sass";
import autoPrefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

const sass = gulpSass(dartSass);

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

// gulp pug plugin을 통해 모든 pug 파일을 HTML로 바꾸는 task
// 파일이 들어오면 -> 무언가 처리를 하고 -> 어디에 둘지
const pug = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const img = () =>
  gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest));

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoPrefixer())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const clean = () => del(["build/", ".publish"]);

const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const gh = () => gulp.src("build/**/*").pipe(ghPages());

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

// postDev는 웹 서버를 실행하고, 파일의 변동 사항을 지켜본다
const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, gh, clean]);
