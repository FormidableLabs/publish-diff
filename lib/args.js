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
        "\n  Examples:\n",
        "    # Compare (old) npm registry `latest` version vs. (new) local `process.cwd()`",
        "    $ publish-diff\n",
        "    # Compare (old) npm version vs. (new) latest npm version",
        "    $ publish-diff -o rowdy@0.4.0 -n rowdy@latest\n",
        "    # Compare (old) git tag/hash vs. (new) git tag/hash",
        "    $ publish-diff -o FormidableLabs/rowdy#v0.4.0 -n FormidableLabs/rowdy#v0.5.0\n",
        "    # Filter differences to only lib and src directories",
        "    $ publish-diff -o radium@0.21.1 -n radium@0.21.2 --filter='{lib,src}/**'\n",
        "    # Filter differences to ignore dist directory",
        "    $ publish-diff -o radium@0.21.1 -n radium@0.21.2 --filter='!dist/**'"
      ].join("\n") + "\n\n");
    })

    // Flags
    .option("-o, --old <package>", "Old package to diff (default `<package>@latest`)")
    .option("-n, --new <package>", "New package to diff (default `process.cwd()`)")
    .option("-r, --registry <registry>", "The npm registry to diff the package against")
    .option("-f, --filter <pattern>", "File glob patterns to filter to")
    .option("--no-colors", "Disable colors in the outputted diff")

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
    new: args.new || process.cwd(),
    colors: args.colors,
    registry: args.registry,
    filter: args.filter || null
  };
};
