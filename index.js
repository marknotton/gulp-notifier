////////////////////////////////////////////////////////////////////////////////
// Notifier
////////////////////////////////////////////////////////////////////////////////

// =============================================================================
// Settings
// =============================================================================

'use strict'

// Dependencies
const through  = require('through2'),
      log      = require('fancy-log'),
      chalk    = require('chalk'),
      path     = require('path'),
      fs       = require('fs'),
      notify   = require('gulp-notify');

module.exports.success  = success;
module.exports.error    = error;
module.exports.defaults = defaults;
module.exports.logs     = logs;

let cache  = false;
let caches = [];
let logged = [];
let defaultMessage = 'Files compiled successfully';

let options = {
  project    : undefined,
  exclusions : undefined,
  extra      : undefined,
  suffix     : undefined,
  prefix     : undefined,
  popups     : true,
  delay      : false,
  success    : 'https://i.imgur.com/G6fTWAs.png',
  error      : 'https://i.imgur.com/VsfiLjV.png',
  messages   : {
    default  : defaultMessage
  }
};

// =============================================================================
// Define default settings
// =============================================================================

function defaults(settings) {
  options = Object.assign(options, settings);
}

// =============================================================================
// Successes
// =============================================================================
function success() {

  logged = [];
  var args = [].slice.call(arguments);
  let succesOptions = Object.assign({}, options);;
  let message = defaultMessage;

	args.forEach(function(arg) {
    switch(typeof arg) {
      case 'object':
        succesOptions = Object.assign(succesOptions, arg);
      break;
      case 'string':
        message = succesOptions.messages[arg] || arg;
      break;
    }
	});

  let first = true;
  let logType = "Created";
  let prefix = typeof succesOptions.prefix !== 'undefined' ? succesOptions.prefix + ' ' : '';
  let suffix = typeof succesOptions.suffix !== 'undefined' ? ' ' + succesOptions.suffix : '';

  message = prefix + message + suffix;

  if (caches.includes(message) && message !== defaultMessage) {
    logType = "Updated";
  }

  caches.push(message);

  if ( typeof succesOptions.extra !== 'undefined') {
    var extra = typeof succesOptions.extra == 'object' ? succesOptions.extra : [succesOptions.extra];
    extra.forEach(file => {

      var messageLog = `${chalk.cyan(logType+":")} ${chalk.green(file)}`;

      if ( succesOptions.delay ) {
        logged.push(messageLog)
      } else {
        log(messageLog);
      }
    })
    succesOptions.extra = undefined;
  }

  return notify({
    icon     : _icon(),
    subtitle : succesOptions.project,
    title    : logType + " <%= file.relative %>",
    message  : (file) => {

      let filepath = path.relative(process.cwd(), file.path);

      if (typeof succesOptions.exclusions !== 'undefined' && filepath.includes(succesOptions.exclusions)) {
        return false;
      } else {

        var messageLog = `${chalk.cyan(logType+":")} ${chalk.green(filepath)}`;

        if ( succesOptions.delay ) {
          logged.push(messageLog)
        } else {
          log(messageLog);
        }
      }

      if (first == false) { return false; }
      first = false;

      if ( options.popups ) {
        return message;
      }
    }
  });
}

// =============================================================================
// Errors
// =============================================================================

function error(error) {

  const line = error.loc ? error.loc.line : (error.line ? error.line : 'Unknown');
  const file = (error.fileName ? error.fileName : (error.file ? error.file : (error.relativePath ? error.relativePath : ''))).replace(process.cwd(), '');
  const path = error.relativePath || 'path';
  const task = error.plugin || 'Task unknown';
  const name = error.name || 'Name unknown';

  // Easy error reporting
  const warning = chalk.white.bgRed;
  const keyword = chalk.red.bgWhite;

  if ( options.popups ) {
    notify({
      icon: options.error,
      title: name,
      subtitle: options.project,
      message: `Line ${line} in ${file}`,
    }).write(error);
  }

  log(`${warning(" " +  task + " Error: ")} ${name} in ${file}: ${keyword(" line " + line + " ")} \n ${error.message ? error.message.replace(process.cwd(), '') : error.toString()}`);

  // Prevents any watchers from stopping
  this.emit('end');

}

// =============================================================================
// Output all logged messages
// =============================================================================

function logs() {
  logged.forEach(message => {
    log(message);
  })
  return logged;
}

// =============================================================================
// Private
// =============================================================================

function _icon() {
  if (cache) { return cache }
  try {
  	fs.accessSync(path.resolve(options.success))
    return cache = options.success;
  } catch(e){
    return cache = 'https://i.imgur.com/G6fTWAs.png';
  }
}


function _messages(message, suffix, prefix) {

  var prefix = typeof prefix !== 'undefined' ? prefix + ' ' : '';
  var suffix = typeof suffix !== 'undefined' ? ' ' + suffix : '';

  return prefix + message + suffix;

}
