"use strict";

/**
 * Parse arguments for CLI.
 */
var program = require("commander");
var pkg = require("../package.json");

// Parse to arguments object.
var parseToArgs = function (argv) {
  return program
    // Help, usage
    .usage("")
    .version(pkg.version)
    .description(pkg.description)
    .on("--help", function () {
      process.stdout.write([
        "  Examples:\n",
        "    # Compare (old) npm registry `latest` version vs. (new) local `./package.json`",
        "    $ publish-diff"
      ].join("\n") + "\n\n");
    })

    // Flags
    .option("-o, --old <package>", "Old package to diff (default `<package>@latest`")
    .option("-n, --new <package>", "New package to diff (default `process.cwd()`")

    // Parse
    .parse(argv || process.argv);
};

/**
 * Parse CLI arguments into script options.
 *
 * @param {Array}     argv  CLI arguments array
 * @returns {Object}        Options for invoking script
 */
module.exports.parse = function (argv) { // eslint-disable-line no-unused-vars
  var args = parseToArgs();

  return {
    old: args.old || null,
    new: args.new || process.cwd()
  };
};
