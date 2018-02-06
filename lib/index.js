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
 * @param {Object}    opts            options object
 * @param {String}    [opts.old]      Old package
 * @param {String}    opts.new        New package
 * @param {String}    [opts.registry] Package registry
 * @param {String}    [opts.filter]   File glob filter
 * @param {Function}  callback        Callback `(err, results)`.
 * @returns {void}
 */
module.exports.diff = function (opts, callback) {
  opts = opts || {};
  var oldPkg = opts.old;
  var newPkg = opts.new;
  var registry = opts.registry;
  var filter = opts.filter;

  // Validation
  if (!newPkg) { return void callback(new Error("Missing opts.new package")); }

  async.auto({
    // Bind in options.
    filter: function (cb) { cb(null, filter); },

    new: getPkg.bind(null, {
      name: newPkg,
      registry: registry
    }),

    // If have explicit old package, go parallel. If not, do serial and infer
    // name of `<package>@latest` on npm registry.
    old: oldPkg ? getPkg.bind(null, {
      name: oldPkg,
      registry: registry
    }) :
    ["new", function (results, cb) {
      getPkg({
        name: results.new.pkgName,
        registry: registry
      }, cb);
    }],

    diff: ["new", "old", "filter", diff]
  }, callback);
};
