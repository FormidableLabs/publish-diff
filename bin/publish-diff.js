#!/usr/bin/env node
"use strict";

var opts = require("../lib/args").parse();
var pubDiff = require("../lib/index").diff;

pubDiff(opts, function (err, diff) {
  if (err) {
    console.error(err.stack || err); // eslint-disable-line no-console
    process.exit(1); // eslint-disable-line no-process-exit
  }

  console.log("TODO IMPLEMENT", diff); // eslint-disable-line
});
