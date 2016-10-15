"use strict";

/**
 * Diff two directories of files.
 */
var async = require("async");
var readdir = require("recursive-readdir");

/*
var path = require("path");
var chalk = require("chalk");
var pkg = require("../package.json");
*/

// Gather file contents.
var getFiles = function (filesPath, callback) {
  readdir(filesPath, function (err, files) {
    if (err) { return void callback(err); }

    callback(null, files);
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
    console.log("TODO HERE", JSON.stringify(results, null, 2));
    callback(null, "TODO IMPLEMENT DIFF");
  });
};
