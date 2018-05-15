'use strict';

var fs = require('fs');
var handleInput = require('coveralls').handleInput;

fs.readFile('./coverage/lcovonly', 'utf8', function(err, content) {
  if (err) {
    throw err;
  }

  handleInput(content, function(msg) {
    if (msg) {
      throw msg;
    }
    console.log("successfully uploaded");
  });
});