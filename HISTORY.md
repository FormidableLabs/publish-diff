History
=======

<!--
## Unreleased

* XXX
-->

## 0.4.1

* Add `--filter` option.
  [#12](https://github.com/FormidableLabs/publish-diff/pull/12)

## 0.4.0

* Expand any module names starting with `.`, `/`, or OS-specific path slash to
  full absolute path to simulate `npm pack`-ing in CWD.
* Copy `.npmrc` from expected `npm` paths to temp directory.
  [#9](https://github.com/FormidableLabs/publish-diff/pull/9)

## 0.3.0

* Add --registry CLI option and resolving .npmrc as a fallback. (**[@joelday][]**)
  [#8](https://github.com/FormidableLabs/publish-diff/pull/8)

## 0.2.0

* Add --no-colors flag for disabling color in output.
  [#3](https://github.com/FormidableLabs/publish-diff/issues/3)

## 0.1.1

* Fix missing `package.json:bin` entry.

## 0.1.0

* Add `-o|--old` and `-n|--new` command line options.
  [#1](https://github.com/FormidableLabs/publish-diff/issues/1)
* Enhance documentation.
* Enable Travis CI.

## 0.0.1

* Initial release.

[@joelday]: https://github.com/joelday
[@ryan-roemer]: https://github.com/ryan-roemer
