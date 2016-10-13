"use strict";

/**
 * Pack and expand packages into temp files.
 *
 * _Note_: A lot of this is from / overlaps with
 * https://github.com/FormidableLabs/builder-init/blob/master/lib/task.js
 * and could possibly be abstracted.
 */
var childProc = require("child_process");
var path = require("path");

var async = require("async");
var temp = require("temp").track(); // track: Clean up all files on process exit.

/*
var readdir = require("recursive-readdir");
var path = require("path");
var zlib = require("zlib");
var fs = require("fs");
var chalk = require("chalk");
var tar = require("tar");
var pkg = require("../package.json");
*/

// Execute `npm pack`.
var npmPack = function (name, obj, callback) {
  // Unpack results.
  var cwd = obj.tmpDir;
  if (!cwd) { return void callback(new Error("No tmpDir specified")); }

  // Ensure callback called only once.
  var cb = function () {
    callback.apply(null, arguments);
    cb = function () {};
  };

  // Set up command and arguments assuming Linux / Mac.
  var cmd = "npm";
  var args = ["pack", name];
  if (/^win/.test(process.platform)) {
    // Detect and adjust commands if windows.
    cmd = "cmd";
    args = ["/c", "npm"].concat(args);
  }

  // Use `npm pack MODULE` to do the dirty work of installing off of file, npm
  // git, github, etc.
  //
  // See: https://docs.npmjs.com/cli/pack
  var stdout = "";
  var proc = childProc.spawn(cmd, args, {
    cwd: cwd,
    env: process.env
  });
  proc.on("error", cb);
  proc.stdout.on("data", function (data) {
    stdout += data;
  });
  proc.on("close", function (code) {
    if (code !== 0) {
      return void cb(new Error("'npm pack " + name + "' exited with error code: " + code));
    }
    if (!(stdout || "").trim()) {
      return void cb(new Error("'npm pack " + name + "' did not capture file name"));
    }

    cb(null, path.join(cwd, stdout.trim()));
  });
};

/**
 * Pack and expand a package by `npm pack`-compatible argument.
 *
 * @param {String}    name      The package name / path to install.
 * @param {Function}  callback  Callback `(err, data)`.
 * @returns {void}
 */
module.exports.get = function (name, callback) {
  if (!name) { return void callback(new Error("No name specified")); }

  // Create a temporary directory to stash the gzip file, unzip it and return
  // the paths for use in template ingestion.
  async.auto({
    tmpDir: temp.mkdir.bind(temp, null),

    npmPack: ["tmpDir", npmPack.bind(null, name)]
  }, function (err, results) {
    callback(err, {
      name: name,
      dir: results.tmpDir,
      archive: results.npmPack
    }); // TODO: NEXT STEP RESULTS?
  });
};
