"use strict";

/**
 * Create a diff from two packages.
 */
var async = require("async");
var getPkg = require("./package").get;

/**
 * Pack and expand a module by `npm pack`-compatible argument.
 *
 * @param {Object}    opts      Options object
 * @param {String}    opts.old  Old package
 * @param {String}    opts.new  New package
 * @param {Function}  callback  Callback `(err, diffString)`.
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
    oldPkg: getPkg.bind(null, oldPkg),
    newPkg: getPkg.bind(null, newPkg)
  }, function (err, results) {
    // eslint-disable-next-line
    callback(null, "TODO DIFF RESULT" + JSON.stringify(results, null, 2)); // TODO: IMPLEMENT.
  });
};
