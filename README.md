<!--[![Travis Status][trav_img]][trav_site]
[![Coverage Status][cov_img]][cov_site]-->

Publish Diff
============

View diffs of what you _will_ publish `npm` before you really do!

The motivation here is that when you publish from a local checkout of a project
unintended / uncommitted / extra file changes can creep into the ultimately
published package, creating confusion and heartache.

`publish-diff` offers an opportunity to see what you're _going_ to publish
*before you actually do* as a convenient diff against the `npm` registry.

## Installation

Install this package as a global dependency.

```sh
$ npm install -g publish-diff
```

## Usage

<!-- TODO: BASIC -->
<!-- TODO: With prepublish, preversion -->

[trav_img]: https://api.travis-ci.org/FormidableLabs/publish-diff.svg
[trav_site]: https://travis-ci.org/FormidableLabs/publish-diff
[cov_img]: https://img.shields.io/coveralls/FormidableLabs/publish-diff.svg
[cov_site]: https://coveralls.io/r/FormidableLabs/publish-diff