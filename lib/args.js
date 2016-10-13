"use strict";

/**
 * Parse arguments for CLI.
 */
var path = require("path");
var program = require("commander");
var pkg = require("../package.json");

// Parse to arguments object.
var parseToArgs = function (argv) {
  return program
    // TODO: Future options `[old] [new]`
    // https://github.com/FormidableLabs/publish-diff/issues/1
    .usage("")
    .version(pkg.version)
    .description(pkg.description)
    .on("--help", function () {
      process.stdout.write([
        "  Examples:\n",
        "    # Compare npm registry `latest` version vs local `./package.json`",
        "    $ publish-diff"
      ].join("\n") + "\n\n");
    })
    .parse(argv || process.argv);
};

/**
 * Parse CLI arguments into script options.
 *
 * @param {Array}     argv  CLI arguments array
 * @returns {Object}        Options for invoking script
 */
module.exports.parse = function (argv) { // eslint-disable-line no-unused-vars
  parseToArgs(); // Currently unused args. Just for side-effects for `-h|-V`.

  var oldPkgPath = path.resolve("package.json");
  var oldPkg = require(oldPkgPath); // eslint-disable-line global-require
  if (!oldPkg.name) {
    throw new Error("Package " + oldPkgPath + " has no `name` field");
  }
  var newPkgPath = oldPkg.name + "@latest";

  return {
    old: path.dirname(oldPkgPath),
    new: newPkgPath
  };
};
