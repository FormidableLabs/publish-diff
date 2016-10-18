"use strict";

/**
 * Various utilities.
 */
var chalk = require("chalk");

var DIFF_HEADER_LINES = 4; // number of lines in a diff output header.

/**
 * Color a diff like git does.
 *
 * @param   {String} diff Diff
 * @returns {String}      Colorized diff
 */
module.exports.colorDiff = function (diff) {
  return (diff || "")
    .split("\n")
    .map(function (line, i) {
      // Header
      if (i < DIFF_HEADER_LINES) { return chalk.bold(line); }
      if (/^\@/.test(line)) { return chalk.cyan(line); }
      if (/^\-/.test(line)) { return chalk.red(line); }
      if (/^\+/.test(line)) { return chalk.green(line); }
      return line;
    })
    .join("\n");
};
