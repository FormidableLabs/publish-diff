#!/usr/bin/env node
"use strict";

var opts = require("../lib/args").parse();
var pubDiff = require("../lib/index").diff;
var colorDiff = require("../lib/util").colorDiff;

var identity = function (x) { return x; };

pubDiff(opts, function (err, results) {
  if (err) {
    console.error(err.stack || err); // eslint-disable-line no-console
    process.exit(1); // eslint-disable-line no-process-exit
  }

  // Filter to changed diffs and display.
  var output = Object.keys(results.diff)
    // Convert to just text values
    .map(function (k) { return results.diff[k]; })
    // Keep non-empty diffs
    .filter(identity)
    // Colorize
    .map(opts.colors ? colorDiff : identity)
    // Convert to string
    .join("\n");

  process.stdout.write(output + "\n");
});
