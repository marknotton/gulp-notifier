# Notifier

![Made For NPM](https://img.shields.io/badge/Made%20for-NPM-orange.svg) ![Made For Gulp](https://img.shields.io/badge/Made%20for-Gulp-red.svg)

Manage CLI and popup notification messages.

## Installation
```
npm i @marknotton/notifier --save-dev
```
```js
const notifier = require('@marknotton/notifier');
```

## Usage
```js
gulp.task('someTask', () => {
  return gulp.src([...])
  .pipe(plumber({errorHandler: notifier.error }))
  .pipe(concat('ccombined.js))
  .pipe(gulp.dest('/some/location/'))
  .pipe(notifier.success())
});
```

## Options
| Option | Type | Default | Details |
|--|--|--|--|
| project    | String | - | Project name. Will appear as a subheading |
| exclusions | String | - | Files that match any part of this string will be excluded from any notification |
| prefix     | String | - | String to add before the notification message |
| suffix     | String | - | String to add after the notification message |
| popups     | Bool   | true | Prevent popups from showing. Console logs will still be rendered. Remote servers won't need popups and may even cause errors. |
| success    | String | <img src="https://i.imgur.com/G6fTWAs.png" alt="Success" align="left" height="20" /> | Icon to use on success messages. Can be relative to the project folder or an absolute URL |
| error      | String | <img src="https://i.imgur.com/VsfiLjV.png" alt="Success" align="left" height="20" /> | Icon to use on error messages. Can be relative to the project folder or an absolute URL |
| messages   | String | Files compiled successfully | The message you want to display. This can be a shorthand name that references an object key defined in the defaults function (see below)   |
| extra      | Array/String| - | Manually add extra files to log out, regardless of whether they are  actually part of the stream |

A string will be defined as the message or message shorthand.

```js
notifier.success('js', { project : 'My Project', ...})
```
Notice the use of a shorthand name as the first parameter. This will look for the keys in the default settings object. So you can list all your messages in one place.

## Defining your default settings

You can preset the above options with the settings function. This will be refereed as your default options for every notifier instance.
```
notifier.settings({
  project : 'My Project,
  success : 'images/icon.png',
  exclusions:'.map',
  messages  : {
    js      : 'Javascripts are all done!',
    sass    : 'Looking gooooood!'
  }
});
```
