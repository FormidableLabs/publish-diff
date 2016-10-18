"use strict";

/**
 * Create a diff from two packages.
 */
var async = require("async");
var getPkg = require("./package").get;
var diff = require("./diff").diff;

/**
 * Pack and expand a module by `npm pack`-compatible argument.
 *
 * @param {Object}    opts      Options object
 * @param {String}    opts.old  Old package
 * @param {String}    opts.new  New package
 * @param {Function}  callback  Callback `(err, results)`.
 * @returns {void}
 */
module.exports.diff = function (opts, callback) {
  opts = opts || {};
  var oldPkg = opts.old;
  var newPkg = opts.new;

  // Validation
  if (!oldPkg) { return void callback(new Error("Missing opts.old package")); }
  if (!newPkg) { return void callback(new Error("Missing opts.new package")); }

  async.auto({
    old: getPkg.bind(null, oldPkg),
    new: getPkg.bind(null, newPkg),
    diff: ["old", "new", diff]
  }, callback);
};
