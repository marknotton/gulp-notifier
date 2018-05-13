////////////////////////////////////////////////////////////////////////////////
// Settings
////////////////////////////////////////////////////////////////////////////////

'use strict'

// Dependencies
const through  = require('through2'),
      log      = require('fancy-log'),
      chalk    = require('chalk'),
      path     = require('path'),
      fs       = require('fs'),
      notify   = require('gulp-notify');

module.exports.success = success;
module.exports.error   = error;
module.exports.setup   = setup;

let successes   = undefined;
let projectname = 'Project';
let customIcon  = 'https://i.imgur.com/G6fTWAs.png';
let cachedIcon  = false;
let exclusions  = undefined;

////////////////////////////////////////////////////////////////////////////////
// Setup
////////////////////////////////////////////////////////////////////////////////

function setup(project, options) {
  projectname = project || 'Project';
  customIcon  = options["icon"];
  exclusions  = options["exclusions"] || undefined;
  successes   = options["successes"];
}

////////////////////////////////////////////////////////////////////////////////
// Successes
////////////////////////////////////////////////////////////////////////////////

function success(handle, extra) {

  var first = true;

  if ( typeof extra == 'object') {
    extra.forEach(file => {
      log(`${chalk.cyan("Created:")} ${chalk.green(file)}`);
    })
    extra = false;
  }

  return notify({
    icon     : getIcon(),
    subtitle    : projectname,
    title : "Created <%= file.relative %>",
    message  : function(file) {

      let filepath = path.relative(process.cwd(), file.path);
      if (typeof exclusions !== 'undefined' && filepath.includes(exclusions)) {
        return false;
      } else {
        log(`${chalk.cyan("Created:")} ${chalk.green(filepath)}`);
      }

      if (first == false) { return false; }
      first = false;

      return messages(handle, extra);
    }
  });
}

////////////////////////////////////////////////////////////////////////////////
// Errors
////////////////////////////////////////////////////////////////////////////////

function error(error) {

  const line = error.loc ? error.loc.line : (error.line ? error.line : 'Unknown');
  const file = (error.fileName ? error.fileName : (error.file ? error.file : (error.relativePath ? error.relativePath : ''))).replace(process.cwd(), '');
  const path = error.relativePath || 'path';
  const task = error.plugin || 'Task unknown';
  const name = error.name || 'Name unknown';

  // Easy error reporting
  const warning = chalk.white.bgRed;
  const keyword = chalk.red.bgWhite;

  notify({
    icon: "https://i.imgur.com/VsfiLjV.png",
    title: `${projectname} : ${name}`,
    message: `Line ${line} in ${file}`,
  }).write(error);

  log(`${warning(" " +  task + " Error: ")} ${name} in ${file}: ${keyword(" line " + line + " ")} \n ${error.message ? error.message.replace(process.cwd(), '') : error.toString()}`);

  // Prevents any watchers from stopping
  this.emit('end');

}

////////////////////////////////////////////////////////////////////////////////
// Private
////////////////////////////////////////////////////////////////////////////////

function getIcon() {
  if (cachedIcon) { return cachedIcon }
  try {
  	fs.accessSync(path.resolve(customIcon))
    return cachedIcon = customIcon;
  } catch(e){
    return cachedIcon = 'https://i.imgur.com/G6fTWAs.png';
  }
}


function messages(handle, extra) {

  var extra = extra && typeof extra !== 'undefined' ? ' ' + extra : '';

  return successes[handle] + extra;

}
