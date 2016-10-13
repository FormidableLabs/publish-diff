"use strict";

var pkg = require("../package.json");
var program = require("commander");

module.exports.parse = function (argv) {
  return program
    .usage("") // TODO: Future options `[old] [new]`
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
