"use strict";

var pkg = require("../package.json");
var program = require("commander");

module.exports.parse = function (argv) {
  return program
    .version(pkg.version)
    .parse(argv || process.argv);
};
