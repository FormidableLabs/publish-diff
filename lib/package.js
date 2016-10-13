"use strict";

/**
 * Pack and expand packages into temp files.
 *
 * _Note_: A lot of this is from / overlaps with
 * https://github.com/FormidableLabs/builder-init/blob/master/lib/task.js
 * and could possibly be abstracted.
 */
/*var childProc = require("child_process");
var path = require("path");
var zlib = require("zlib");
var fs = require("fs");
var async = require("async");
var chalk = require("chalk");
var tar = require("tar");
var temp = require("temp").track(); // track: Clean up all files on process exit.
var pkg = require("../package.json");*/

/**
 * Pack and expand a package by `npm pack`-compatible argument.
 *
 * @param {String}    name      The package name / path to install.
 * @param {Function}  callback  Callback `(err, data)`.
 * @returns {void}
 */
module.exports.get = function (name, callback) {
  if (!name) { return void callback(new Error("No name specified")); }

  callback(null, name); // TODO: IMPLEMENT.
};
