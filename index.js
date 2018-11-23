////////////////////////////////////////////////////////////////////////////////
// Notifier
////////////////////////////////////////////////////////////////////////////////

// =============================================================================
// Settings
// =============================================================================

'use strict'

// Dependencies
const through  = require('through2'),
      log      = require('loggerer'),
      chalk    = require('chalk'),
      path     = require('path'),
      fs       = require('fs'),
      notify   = require('gulp-notify');

module.exports.success    = success;
module.exports.error      = error;
module.exports.settings   = settings;
module.exports.renderLogs = renderLogs;
module.exports.logs       = logs;
module.exports.timestamp  = timestamp;

notify.logLevel(0);

let cache  = false;
let caches = [];
let logged = [];
let defaultMessage = 'Files compiled successfully';
let defaultTheme = chalk.dim.white;

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
  },
	themes : {
		scripts  : chalk.hex('#F0DB4F'),
		vendors  : chalk.hex('#7DB704'),
		symbols  : chalk.hex('#E6A41F'),
		sass     : chalk.hex('#C76395'),
	}
};

let types = {
	'Created' : chalk.hex('#F0DB4F'),
	'Updated' : chalk.hex('#7DB704'),
	'Skipped' : chalk.hex('#E6A41F'),
	'Deleted' : chalk.hex('#C76395'),
	'Complete' : chalk.hex('#F0DB4F'),
}

// =============================================================================
// Define default settings
// =============================================================================

function settings(settings) {
  options = Object.assign(options, settings);
}

// =============================================================================
// Successes
// =============================================================================
function success() {

  var args = [].slice.call(arguments);
  let succesOptions = Object.assign({}, options);;
  let message = defaultMessage;
	let theme = defaultTheme;

	args.forEach(function(arg) {
    switch(typeof arg) {
      case 'object':
        succesOptions = Object.assign(succesOptions, arg);
      break;
      case 'string':
        message = succesOptions.messages[arg] || arg;
        theme = succesOptions.themes[arg] || defaultTheme;
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

			var messageLog = `${chalk.hex('#5ED3F3')(logType+":")} ${theme(file)} - ${chalk.hex('#66797B')(message)}`;

			if ( logType == 'Updated') {
				messageLog = `${chalk.dim.white(logType+":")} ${theme(file) } - ${chalk.hex('#66797B')(message)}`;
			} else {

			}

			log(logType, file, message);

      // if ( succesOptions.delay ) {
      //   logged.push(timestamp(messageLog))
      // } else {
      //   log(messageLog);
      // }
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

				var messageLog = `${chalk.hex('#5ED3F3')(logType+":")} ${theme(filepath)} - ${chalk.hex('#66797B')(message)}`;

				if ( logType == 'Updated') {
					messageLog = `${chalk.dim.white(logType+":")} ${theme(filepath)} - ${chalk.hex('#66797B')(message)}`;
				}

        // if ( succesOptions.delay ) {
          // logged.push(timestamp(messageLog))
        // } else {
          log(logType, filepath, message);
        // }
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

function timestamp(message) {
	return `[${(new Date()).toTimeString().substr(0,8)}] ${message}`;
}

// =============================================================================
// Output all logged messages
// =============================================================================

function logs(output = true, clear = false) {

	if (output) {
	  logged.forEach(message => {
	    log(message);
	  })
	}

	if (clear) {
		var temp = logged;
		logged = [];
		return temp;
	}

  return logged;
}

function renderLogs(logs) {

	let befores = []
	let afters = []

	logs.forEach(message => {
		let regex = /(?!{[^{]*) - (?![^{}]*})/g;
		let splitted = message.split(regex);
		if ( splitted.length == 2 ) {
			befores.push(splitted[0])
			afters.push(splitted[1])
		}
	})

var longest = befores.reduce(function (a, b) { return a.length > b.length ? a : b; });

// (?!{[^{]*) - (?![^{}]*})

for (const [i, message] of befores.entries()) {
    console.log(befores[i] + ' '.repeat((longest.length - befores[i].length) + 2) + afters[i]);
}

	// console.log(longest);
	//
	// befores.forEach(message => {
	// 	console.log(splitted[0], splitted[1]);
	// })

	// logs.forEach(message => {
	// 	console.log(splitted[0], splitted[1]);
	// })
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
