"use strict";

/**
 * Diff two directories of files.
 */
var path = require("path");
var fs = require("fs");

var async = require("async");
var chalk = require("chalk");
var isBinaryFile = require("isbinaryfile");
var jsdiff = require("diff");
var fileType = require("file-type");
var readdir = require("recursive-readdir");

// Use heuristics to detect if buffer is binary file.
var isBinary = function (buffer) {
  return (
    // First, check magic numbers to see if we are a possible text file.
    //
    // _Note_: While a `sync`-named method, there's no actual sync I/O when
    // size parameter is provided.
    isBinaryFile.sync(buffer, buffer.length) ||

    // Then check if we have known non-text file types.
    !!fileType(buffer)
  );
};

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
        var fullPath = pair[0];
        var relPath = path.relative(filesPath, fullPath);
        var buf = pair[1];
        var isBin = isBinary(buf);

        memo[relPath] = {
          relPath: relPath,
          fullPath: fullPath,
          contents: isBin ? buf : buf.toString("utf-8"),
          isBinary: isBin
        };

        return memo;
      }, {});

      callback(filesErr, obj);
    });
  });
};

// Diff file system objects.
var diff = function (obj, callback) {
  obj = obj || {};
  var oldFiles = obj.old;
  var newFiles = obj.new;

  if (!obj.old) { return void callback(new Error("Missing obj.old")); }
  if (!obj.new) { return void callback(new Error("Missing obj.new")); }

  // Assemble sorted list of unique keys.
  var keys = []
    // Create non-unique array of all keys
    .concat(Object.keys(oldFiles), Object.keys(newFiles))
    .sort()
    // Keep only unique keys
    .filter(function (val, i, vals) { return vals[i - 1] !== val; });

  // Convert to array of diff sections.
  var diffs = keys
    // Convert to diff.
    .map(function (key) {
      var oldFile = oldFiles[key] || {};
      var newFile = newFiles[key] || {};

      // Files are straight up equal.
      if (oldFile.contents === newFile.contents) {
        return null;
      }

      // Start with assumption that there's no binary diff.
      var binDiff = false;

      // 1+ file is binary.
      if (oldFile.isBinary || newFile.isBinary) {
        // Binary diff if 1 file is missing, not binary, or 2 files differe.
        binDiff = !oldFile || !oldFile.isBinary || !newFile || !newFile.isBinary ||
          !oldFile.contents.equals(newFile.contents);

        // If found binary files, but no diff, then legitimately no diff.
        if (!binDiff) { return null; }
      }

      // Create headers with no diff for binary diffs. Normal otherwise.
      return jsdiff.createPatch(
        key,
        binDiff ? "" : oldFile.contents || "",
        binDiff ? "" : newFile.contents || "",
        "<TODO - OLD PKG NAME>",
        "<TODO - NEW PKG NAME>"
      ) + (binDiff ? "Binary files differ" : "");
    })
    // Remove empty diffs.
    .filter(function (x) { return !!x; });

  callback(null, diffs);
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
    new: getFiles.bind(null, opts.new.files),
    diff: ["old", "new", diff]
  }, function (err, results) {

    // TODO: DIFF stage

    console.log("TODO HERE", results.diff.join("\n\n")); // eslint-disable-line
    callback(null, "TODO IMPLEMENT DIFF");
  });
};
