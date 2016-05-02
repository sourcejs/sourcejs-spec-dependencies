# Spec Dependencies (crosslinks)

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/sourcejs/Source)

Spec Dependencies is [SourceJS](http://sourcejs.com) plugin for adding crosslinks section into each spec. It predicts used specs through the css selectors used in current spec.

![image](http://monosnap.com/image/gG9KatayyGGg5BxYt3704OIIQHUg0V.png)

Compatible with SourceJS 0.6.x. For older versions use `0.1.x` branch.

## Install

To install, run npm in SourceJS project folder:

```
npm install sourcejs-spec-dependencies --save
```

Restart the app, and you're ready to go.


## How to use

### Configuration

By default plugin will parse documentation pages located in `/specs` folder, to extend the search folder list, update plugin options in `/options.js`:

```
{
  plugins: {
    specDependenciesTree: {
      includedDirs: ['specs', 'more-specs']
    }
  }
}
```

This conf will ensure that plugin checks both `/specs` and `/more-specs` folders to build the dependency tree.


### Manually set spec dependencies

Spec Dependencies automatically predicts all specs, that used in current spec by comparing CSS classes names with existing Spec names. If you also want to see next section to check which specs use current ("this spec used by"), you have to update `info.json` of the specs with "usedSpecs" property. Value of "usedSpecs" should be an array even for only element.

```
// info.json of Example spec (/url/to/example/spec)
{
  "author": ...,
  "title": ...,
  ...,
  "usedSpecs": ["/url/to/used/spec", "/url/to/used/spec1", ...]
}
```

Next, SourceJS core builds inverted dependencies tree and save it to `data/spec_dependencies_tree.json`:
```
{
    "/url/to/used/spec": [
        "/url/to/example/spec"
    ],
    "/url/to/used/spec1": [
       "/url/to/example/spec"
    ]
}
```

After that plugin uses this tree to build the "this spec used by" section.
