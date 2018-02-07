[![Travis Status][trav_img]][trav_site]
<!--[![Coverage Status][cov_img]][cov_site]-->

Publish Diff
============

View diffs of what you _will_ publish to `npm` **before** you really do!

Publishing a package from a local repository runs the risk of last minute
human mistakes like:

- deletions
- mutations
- additions

to the files sent to the `npm` registry.

`publish-diff` offers the piece of mind that you will publish exactly what you
intend to publish with convenient, **git-style diffs** against the `npm`
registry from your local project.

## Installation

Install this package as a global dependency.

```sh
$ npm install -g publish-diff
```

## Usage

The basics:


```
  Usage: publish-diff [options]

  Preview npm publish changes.


  Options:

    -V, --version              output the version number
    -o, --old <package>        Old package to diff (default `<package>@latest`)
    -n, --new <package>        New package to diff (default `process.cwd()`)
    -r, --registry <registry>  The npm registry to diff the package against
    -f, --filter <pattern>     File glob patterns to filter to
    --no-colors                Disable colors in the outputted diff
    -h, --help                 output usage information

  Examples:

    # Compare (old) npm registry `latest` version vs. (new) local `process.cwd()`
    $ publish-diff

    # Compare (old) npm version vs. (new) latest npm version
    $ publish-diff -o rowdy@0.4.0 -n rowdy@latest

    # Compare (old) git tag/hash vs. (new) git tag/hash
    $ publish-diff -o FormidableLabs/rowdy#v0.4.0 -n FormidableLabs/rowdy#v0.5.0

    # Filter differences to only lib and src directories
    $ publish-diff -o radium@0.21.1 -n radium@0.21.2 --filter='{lib,src}/**'

    # Filter differences to ignore dist directory
    $ publish-diff -o radium@0.21.1 -n radium@0.21.2 --filter='!dist/**'
```

### Local Diffs

The most common case is to compare the `latest` published version of a
package (old) against the current working directory (new). In this case,
`publish-diff` will infer the package's `name` from the `package.json` file.

```sh
$ publish-diff
```

The script takes `-o|--old` and `-n|--new` values to determine what to diff.

* `-n|--new`: Defaults to current working directory (`process.cwd()`) in the
  local filesystem. This assumes the common case of publishing a new version
  from your machine.
* `-o|--old`: Defaults to the `package.json:name` of the package extracted from
  the `--new` argument at its latest version in the `npm` registry.

For a package `<pkg>` already published to the `npm` registry the default case
expands to:

```sh
$ publish-diff -o <local cwd> -n <latest npm version>

# Diff local version vs latest on npm registry
$ publish-diff
$ publish-diff -n .
$ publish-diff -o <pkg>@latest -n .
$ publish-diff -o <pkg>@latest

# Diff local version vs tag or old version
$ publish-diff -o <pkg>@beta
$ publish-diff -o <pkg>@1.2.3

# Diff local version vs other local version
$ publish-diff -o /path/to/some-version
$ publish-diff -o /path/to/some-version -n .
$ publish-diff -o /path/to/some-version -n /path/to/other-version
```

### Remote Diffs

Under the hood, `publish-diff` relies on the amazingly flexible
[`npm pack`](https://docs.npmjs.com/cli/pack) to create the "real deal" version
of a package that is already / will be published. This also gives us some extra
flexibility in specifying the old and new packages to compare against as
`publish-diff` permits passing the `-o` and `-n` arguments with any value that
would otherwise be permissible to `npm pack`.

This means you can view remote differences across already published versions of
packages without needing a local checkout:

```sh
$ publish-diff -n <npm name + version>
$ publish-diff -o <npm name + version> -n <npm name + version>

# Diff old version vs. latest on npm registry
$ publish-diff -o rowdy@0.4.0   -n rowdy@latest
$ publish-diff -o radium@0.17.2 -n radium

# Diff two old versions on npm registry
$ publish-diff -o rowdy@0.4.0   -n rowdy@0.5.0
$ publish-diff -o radium@0.17.2 -n radium@0.18.0
```

And you can do the same with git versions:

```sh
# Diff git tag/hash vs latest on npm registry
$ publish-diff -o FormidableLabs/rowdy#v0.4.0  -n rowdy
$ publish-diff -o FormidableLabs/rowdy#504735c -n rowdy@latest
$ publish-diff -o FormidableLabs/rowdy#v0.4.0  -n rowdy@latest

# Diff two old versions from git tag/hash
$ publish-diff -o FormidableLabs/rowdy#v0.4.0  -n FormidableLabs/rowdy#v0.5.0
$ publish-diff -o FormidableLabs/rowdy#504735c -n FormidableLabs/rowdy#fe25a22
```

Note that when doing local / git-based comparisons that portions of the `npm`
publish / version lifecycles may be missing and you may need to manually
approximate this (discussed in detail in the next section).

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
it will invoke the following `package.json` tasks if found:

- `preversion`
- `version`

After versioning, the following task is run if found:

- `postversion`

Translating this to `publish-diff`, if you want to simulate what will actually
be published, a more accurate command line sequence would be:

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

## Notes

### `.npmrc` Files

`publish-diff` follows the `npm` rules for searching for `.npmrc` files --
https://docs.npmjs.com/files/npmrc#files -- which approximates to:

- `${process.cwd()}/.npmrc`
- `~/.npmrc`
- `$NODE_GLOBAL_PATH/etc/npmrc`
- `$SYSTEM_PATH/npm/npmrc`

`publish-diff` shells to `npm pack` which will out-of-the-box work with all but
the first of these rc file locations. The complexity is that for the actual
`npm pack` command, `publish-diff` creates and switches to a temporary
directory. To compensate for this behavior, if a `${process.cwd()}/.npmrc` file
is found, that is _also_ copied to the temporary directory before initiating
any underlying `npm` commands.

[trav_img]: https://api.travis-ci.org/FormidableLabs/publish-diff.svg
[trav_site]: https://travis-ci.org/FormidableLabs/publish-diff
[cov_img]: https://img.shields.io/coveralls/FormidableLabs/publish-diff.svg
[cov_site]: https://coveralls.io/r/FormidableLabs/publish-diff
