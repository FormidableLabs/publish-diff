[![Travis Status][trav_img]][trav_site]
<!--[![Coverage Status][cov_img]][cov_site]-->

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

Show help, version:

```sh
$ publish-diff -h
$ publish-diff -v
```

## Usage

The most basic default case is to compare the `latest` published version of a
package (old) against the current working directory (new). In this case,
`publish-diff` will infer the package's `name` from the `package.json` file.

```sh
$ publish-diff
```

### npm Lifecycle Complexities

One complexity that comes up frequently is `npm` lifecycle events that occur
in publishing that need to be simulated to accurately generate a preview diff.
Specifically, if the following taks is present in a `package.json` file, it
will occur before actual publishing:

- `prepublish`

After publishing, the following tasks run if found:

- `publish`
- `postpublish`

If a project uses an `npm version` workflow to control versioning of git source
will invoke the following `package.json` tasks if found:

- `preversion`
- `version`

After versioning, the following task is run if found:

- `postversion`

Translating this to `publish-diff`, if you want to simulate what will actually
be published a more accurate command line sequence would be:

```sh
$ npm run prepublish && \
  publish-diff && \
  npm run postpublish
```

The gotcha here is that if there is a `package.json:publish` script it would
not be run and you will need to manually approximate that because running
`npm run publish` would **actually publish**, defeating the point of previewing
your diff.

For a `version` workflow, an appropriate command line sequence may look
something like:

```sh
$ npm run preversion && \
  publish-diff && \
  npm run postversion
```

Similar to `publish`, you would not want to run `npm run version` because it
has side effects -- in this case, mutating the git state of your project.
Projects with an actual `package.json:version` script would need manual cleanup.

[trav_img]: https://api.travis-ci.org/FormidableLabs/publish-diff.svg
[trav_site]: https://travis-ci.org/FormidableLabs/publish-diff
[cov_img]: https://img.shields.io/coveralls/FormidableLabs/publish-diff.svg
[cov_site]: https://coveralls.io/r/FormidableLabs/publish-diff
