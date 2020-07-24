////////////////////////////////////////////////////////////////////////////////
// Notifier
////////////////////////////////////////////////////////////////////////////////

// =============================================================================
// Settings
// =============================================================================

'use strict'

// Dependencies
const path     = require('path'),
      fs       = require('fs'),
      notify   = require('gulp-notify'),
      log      = require('@marknotton/lumberjack'),
      through  = require('through2');

module.exports.success    = success;
module.exports.error      = error;
module.exports.settings   = settings;

notify.logLevel(0);

let cache  = false;
let caches = [];
let defaultMessage = 'Files compiled successfully';

// Look for an 'icon.png' file in the root of this project to use as a 'success' 
// image if one isn't manually defined.
try {
  if (fs.existsSync('./icon.png')) {
    var successIocn = './icon.png';
  }
} catch(err) {
  var successIocn = path.join(__dirname, 'assets/success.png');
}

let packageJson = path.resolve(process.cwd(), '');

if (!packageJson.endsWith('package.json')) {
  packageJson = path.join(packageJson, 'package.json');
}

if (fs.existsSync(packageJson)) {
  let pkg = JSON.parse(fs.readFileSync(packageJson));

  var projectNae = pkg.name.replace(/-/g," ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
} 

let options = {
  project    : projectNae || undefined,
  exclusions : '.map',
  extra      : undefined,
  suffix     : undefined,
  prefix     : undefined,
  popups     : "ENVIRONMENT" in process.env && process.env.ENVIRONMENT == 'dev',
  success    : successIocn,
  error      : path.join(__dirname, 'assets/error.png'),
  messages   : {
    default  : defaultMessage
  }
};

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
  let succesOptions = Object.assign({}, options);
  let message = defaultMessage;

	if ( args.length ) {
		args.forEach(function(arg) {
	    switch(typeof arg) {
	      case 'object':
	        succesOptions = Object.assign(succesOptions, arg);
	      break;
	      case 'string':
	        message = succesOptions.messages[arg] || arg;
        break;
        case 'boolean':
	        logFiles = arg;
	      break;
	    }
		});
	}

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
			log(logType, file, message);
    })
    succesOptions.extra = undefined;
  }

  if ( !succesOptions.popups ) {
    let stream = through.obj(function (file, enc, cb) {
      let filepath = path.relative(process.cwd(), file.path)
      if ( !filepath.includes(succesOptions.exclusions) ) {
        log(logType, filepath, message);
      }
      cb(null);
    })
    return stream;
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
        log(logType, filepath, message);
      }

      if (first == false) { return false; }
      first = false;

      return message
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

  if ( options.popups ) {
    notify({
      icon: options.error,
      title: name,
      subtitle: options.project,
      message: `Line ${line} in ${file}`,
    }).write(error);
  }

	let message = `${name} in ${file}: ${" line " + line + " "} \n ${error.message ? error.message.replace(process.cwd(), '') : error.toString()}`

	log(task + " Error", message)

  // Prevents any watchers from stopping
  this.emit('end');

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
