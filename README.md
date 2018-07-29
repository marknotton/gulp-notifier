# Gulp Notifier

Gulp success and error notifications.

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
notifier.success('js', { project : 'My Project'})
```
### Options
| Option | Type | Default | Details |
|--|--|--|--|
| project    | String | - | Project name. Will appear as a subheading |
| exclusions | String | - | Files that match any part of this string will be excluded from any notification |
| extra      | Array or String| - | Manually add extra files to log out, regardless of whether they actually part of the stream |
| prefix     | String | - | String to add before the notification message |
| suffix     | String | - | String to add after the notification message |
| popups     | Bool   | true | Prevent popups from showing. Console logs will still be rendered. Remote servers won't need popups and may even cause errors. |
| delay      | Bool   | false | If set to ```true```, all console messages will be logged into a array. All logs can then be triggers using the logs function   |
| success    | String | <img src="https://i.imgur.com/G6fTWAs.png" alt="Success" align="left" height="20" /> | Icon to use on success messages. Can be relative to the project folder or an absolute URL |
| error      | String | <img src="https://i.imgur.com/VsfiLjV.png" alt="Success" align="left" height="20" /> | Icon to use on error messages. Can be relative to the project folder or an absolute URL |
| messages   | String | Files compiled successfully | The message you want to display. This can be a shorthand name that references an object key defined in the defaults function (see below)   |

### Defaults

You can define all your own default options outside of the stream.
```
notifier.defaults({
  project : 'My Project,
  success : 'images/icon.png',
  exclusions:'.map',
  messages  : {
    js      : 'Javascripts are all done!',
    sass    : 'Looking gooooood!'
  }
});
```

### Logs

The logs function will log out all previously saved console messages. Designed to be used in conjunction with Gulps ```on end``` feature.

```
gulp.task('someTask', () => {
  return gulp.src([...])
  .pipe(notifier.success())
  .on('end', () => { notifier.logs() })
});
```
