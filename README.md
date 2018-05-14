# Gulp Notifier

Gulp success &amp; error notifications within streams.

### Installation
```
npm i gulp-notifier --save
```
```js
const notifier = require('gulp-notifier');
```

### Usage
```
gulp.task('someTask', () => {
  return gulp.src([...])
  .pipe(plumber({errorHandler: notifier.error }))
  .pipe(concat('ccombined.js))
  .pipe(gulp.dest('/some/location/'))
  .pipe(notifier.success())
});
```

You can pass in a string or object of options. A string will be defined as the message or message shorthand.
```
notifier.success('You precompiled the files', { project : 'My Project'})
```
### Options
| Option | Type | Default | Details |
|--|--|--|--|
| project    | String | - | Project name. Will appear as a subheading |
| exclusions | String | - | Files that match any part of this string will be excluded from any notification |
| extra      | Array or String| - | Manually add extra files to log out, regardless of whether they actually part of the stream |
| prefix     | String | - | String to add before the notification message |
| suffix     | String | - | String to add after the notification message |
| success    | String | ![https://i.imgur.com/G6fTWAs.png](https://i.imgur.com/G6fTWAs.png =20x) | Icon to use on success messages. Can be relative to the project folder or an absolute URL |
| error      | String | ![https://i.imgur.com/G6fTWAs.png](https://i.imgur.com/VsfiLjV.png =20x) | Icon to use on error messages. Can be relative to the project folder or an absolute URL |
| messages   | String | Files compiled successfully | The message you want to display. This can be a shorthand name that references an object key defined in the defaults function (see below)   |

### Defaults

You can define all your own default options outside of the stream.
```
notifier.defaults({
  project : 'My Project,
  success : 'images/icon.png',
  exclusions:'.map',
  messages  : {
    core    : 'Core script files ' + (combineJS ? 'precompiled' : (versioning ? 'versionised' : 'compiled')) + ' successfully',
    js      : 'Javascripts are all done!',
    sass    : 'Looking gooooood!'
  }
});
```
