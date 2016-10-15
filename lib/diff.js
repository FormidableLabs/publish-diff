"use strict";

/**
 * Diff two directories of files.
 */
var fs = require("fs");

var async = require("async");
var readdir = require("recursive-readdir");

/*
var path = require("path");
var chalk = require("chalk");
var pkg = require("../package.json");
*/

// Gather file contents.
var getFiles = function (filesPath, callback) {
  // Get file path tree.
  readdir(filesPath, function (dirErr, files) {
    if (dirErr) { return void callback(dirErr); }

    // Get all file contents.
    async.map(files, function (filePath, cb) {
      fs.readFile(filePath, function (fileErr, data) {
        cb(fileErr, [filePath, data]);
      });
    }, function (filesErr, results) {
      // Convert to an object for `path: <contents buffer>`
      var obj = (results || []).reduce(function (memo, pair) {
        memo[pair[0]] = pair[1];
        return memo;
      }, {});

      callback(filesErr, obj);
    });
  });
};

/**
 * Diff two directories of files.
 *
 * @param {Object}    opts      Options object
 * @param {String}    opts.old  Old directory
 * @param {String}    opts.new  New directory
 * @param {Function}  callback  Callback `(err, diffString)`
 * @returns {void}
 */
module.exports.diff = function (opts, callback) {
  opts = opts || {};

  if (!(opts.old || {}).files) { return void callback(new Error("Missing opts.old.files")); }
  if (!(opts.new || {}).files) { return void callback(new Error("Missing opts.new.files")); }

  async.auto({
    old: getFiles.bind(null, opts.old.files),
    new: getFiles.bind(null, opts.new.files)
  }, function (err, results) {

    // TODO: DIFF stage
    // TODO: Detect binary files and don't diff. -- isbinaryfile file-type from builder-init

    console.log("TODO HERE", JSON.stringify(results, null, 2)); // eslint-disable-line
    callback(null, "TODO IMPLEMENT DIFF");
  });
};
