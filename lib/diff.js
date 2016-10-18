"use strict";

/**
 * Diff two directories of files.
 */
var path = require("path");
var fs = require("fs");

var async = require("async");
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
//
// Returns object of form:
//
// ```js
// {
//   "path1.js": null, // no diff,
//   "path2.js": "TEXT_OF_DIFF"
// }
// ```
//
// eslint-disable-next-line max-statements
var diff = function (opts, obj, callback) {
  opts = opts || {};
  var oldName = opts.new.name;
  var newName = opts.old.name;
  if (!oldName) { return void callback(new Error("Missing opts.old.name")); }
  if (!newName) { return void callback(new Error("Missing opts.new.name")); }

  obj = obj || {};
  var oldFiles = obj.old;
  var newFiles = obj.new;
  if (!oldFiles) { return void callback(new Error("Missing obj.old")); }
  if (!newFiles) { return void callback(new Error("Missing obj.new")); }

  // Assemble sorted list of unique keys.
  var keys = []
    // Create non-unique array of all keys
    .concat(Object.keys(oldFiles), Object.keys(newFiles))
    .sort()
    // Keep only unique keys
    .filter(function (val, i, vals) { return vals[i - 1] !== val; });

  // Convert to array of diff sections.
  var diffObj = keys
    // Convert to diff.
    // eslint-disable-next-line complexity
    .map(function (key) {
      var oldFile = oldFiles[key] || {};
      var newFile = newFiles[key] || {};

      // Files are straight up equal.
      if (oldFile.contents === newFile.contents) {
        return [key, null];
      }

      // Start with assumption that there's no binary diff.
      var binDiff = false;

      // 1+ file is binary.
      if (oldFile.isBinary || newFile.isBinary) {
        // Binary diff if 1 file is missing, not binary, or 2 files differe.
        binDiff = !oldFile || !oldFile.isBinary || !newFile || !newFile.isBinary ||
          !oldFile.contents.equals(newFile.contents);

        // If found binary files, but no diff, then legitimately no diff.
        if (!binDiff) { return [key, null]; }
      }

      // Create headers with no diff for binary diffs. Normal otherwise.
      return [key, jsdiff.createPatch(
        key,
        binDiff ? "" : oldFile.contents || "",
        binDiff ? "" : newFile.contents || "",
        oldName,
        newName
      ) + (binDiff ? "Binary files differ\n" : "")];
    })
    // Convert to object.
    .reduce(function (memo, pair) {
      memo[pair[0]] = pair[1];
      return memo;
    }, {});

  callback(null, diffObj);
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
    diff: ["old", "new", diff.bind(null, opts)]
  }, function (err, results) {
    callback(err, (results || {}).diff);
  });
};
