<!--[![Travis Status][trav_img]][trav_site]
[![Coverage Status][cov_img]][cov_site]-->

Publish Diff
============

View diffs of what you _will_ publish `npm` before you really do!

The motivation here is that when you publish from a local checkout of a project
unintended / uncommitted / extra file changes can creep into the ultimately
published package, creating confusion and heartache.

`publish-diff` offers an opportunity to see what you're _going_ to publish
**before you actually do** as a convenient, git-style diff against the `npm`
registry.

## Installation

Install this package as a global dependency.

```sh
$ npm install -g publish-diff
```

## Usage

```
 Usage: publish-diff [options]

  Preview npm publish changes.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  Examples:

    # Compare npm registry `latest` version vs local `./package.json`
    $ publish-diff
```

<!-- TODO: BASIC -->
<!-- TODO: Note: doesn't matter git state, it's what will **actually* be published.
     This is what you want to check.
  -->
<!-- TODO: With prepublish, preversion -->
<!-- TODO: May need to undo with `postpublish`, `postversion` as applicable -->

[trav_img]: https://api.travis-ci.org/FormidableLabs/publish-diff.svg
[trav_site]: https://travis-ci.org/FormidableLabs/publish-diff
[cov_img]: https://img.shields.io/coveralls/FormidableLabs/publish-diff.svg
[cov_site]: https://coveralls.io/r/FormidableLabs/publish-diff
