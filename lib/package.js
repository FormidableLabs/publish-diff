"use strict";

/**
 * Pack and expand packages into temp files.
 *
 * _Note_: A lot of this is from / overlaps with
 * https://github.com/FormidableLabs/builder-init/blob/master/lib/task.js
 * and could possibly be abstracted.
 */
var childProc = require("child_process");
var fs = require("fs");
var path = require("path");
var zlib = require("zlib");

var async = require("async");
var tar = require("tar");
var temp = require("temp").track(); // track: Clean up all files on process exit.

// Ensure callback called only once.
var once = function (fn) {
  var called = false;
  return function () {
    called = called || fn.apply(null, arguments) || true;
  };
};

// Build the args for `npm pack`
var buildNpmArgs = function (name, registry) {
  var args = ["pack"];

  // Normalize name if start with `.`, `/`, or OS-specific path separator.
  name = name.trim();
  if (name && [".", "/", path.sep].indexOf(name[0]) === 0) {
    name = path.resolve(name);
  }
  args.push(name);

  // Add registry.
  if (registry) {
    args.push("--registry", registry);
  }

  return args;
};

// Copy PWD rcfile if found.
var copyRc = function (obj, callback) {
  if (!obj.tmpDir) { return void callback(new Error("No temp dir specified")); }

  var rcSrc = path.resolve(".npmrc");
  var rcDst = path.resolve(obj.tmpDir, ".npmrc");

  async.auto({
    read: function (cb) {
      fs.readFile(rcSrc, function (err, data) {
        // Allow not found.
        if (err && err.code !== "ENOENT") {
          return void cb(err);
        }

        cb(null, data);
      });
    },
    write: ["read", function (results, cb) {
      if (!obj.read) { return void cb(); }

      fs.writeFile(rcDst, results.read, cb);
    }]
  }, callback);
};

// Execute `npm pack`.
var npmPack = function (info, obj, callback) {
  // Unpack results.
  var cwd = obj.tmpDir;
  if (!cwd) { return void callback(new Error("No tmpDir specified")); }

  // Wrap.
  callback = once(callback);

  // Set up command and arguments assuming Linux / Mac.
  var cmd = "npm";
  var args = buildNpmArgs(info.name, info.registry);

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
  proc.on("error", callback);
  proc.stdout.on("data", function (data) {
    stdout += data;
  });
  proc.on("close", function (code) {
    var fullCmd = cmd + " " + args.join(" ");

    if (code !== 0) {
      return void callback(new Error("'" + fullCmd + "' exited with error code: " + code));
    }
    if (!(stdout || "").trim()) {
      return void callback(new Error("'" + fullCmd + "' did not capture file name"));
    }

    callback(null, path.join(cwd, stdout.trim()));
  });
};

// Extract package archive.
var extract = function (obj, callback) {
  if (!obj.tmpDir) { return void callback(new Error("No temp dir specified")); }
  if (!obj.npmPack) { return void callback(new Error("No archive specified")); }

  callback = once(callback);

  var extractedDir = path.resolve(obj.tmpDir, "extracted");

  fs.createReadStream(obj.npmPack)
    .pipe(zlib.createUnzip())
    .pipe(new tar.Extract({
      path: extractedDir,
      strip: 1 // Get rid of `<package-name>/` level of directory
    }))
    .on("error", callback)
    .on("close", callback.bind(null, null, extractedDir));
};

// Get extracted `package.json:name`
var pkgName = function (obj, callback) {
  var pkgPath = path.resolve(obj.tmpDir, "extracted/package.json");

  fs.readFile(pkgPath, function (err, data) {
    callback(err, data ? JSON.parse(data).name : null);
  });
};

/**
 * Pack and expand a package by `npm pack`-compatible argument.
 *
 * @param {Object}    opts            The package name and optional registry.
 * @param {String}    opts.name       The package name / path to install.
 * @param {String}    [opts.registry] The npm registry for the `npm pack` call.
 * @param {Function}  callback        Callback `(err, data)`.
 * @returns {void}
 */
module.exports.get = function (opts, callback) {
  var name = opts.name;

  if (!name) { return void callback(new Error("No name specified")); }

  // Create a temporary directory to stash the gzip file, unzip it and return
  // the paths for use in template ingestion.
  async.auto({
    tmpDir: temp.mkdir.bind(temp, null),

    copyRc: ["tmpDir", copyRc],

    npmPack: ["copyRc", npmPack.bind(null, opts)],

    extract: ["npmPack", extract],

    pkgName: ["extract", pkgName]
  }, function (err, results) {
    callback(err, {
      name: name,
      pkgName: results.pkgName,
      files: results.extract
    });
  });
};
