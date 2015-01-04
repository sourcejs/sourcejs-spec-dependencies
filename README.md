# Spec Dependencies (crosslinks)

Spec Dependencies is [SourceJS](http://sourcejs.com) plugin for adding crosslinks section into each spec. It predicts used specs through the css selectors used in current spec.

![image](http://monosnap.com/image/gG9KatayyGGg5BxYt3704OIIQHUg0V.png)

Compatible with SourceJS v0.4+.

## Install

To install, run npm in `sourcejs/user` folder:

```
npm install sourcejs-spec-status --save
```

Then run Grunt update in SourceJS root:

```
grunt update
```

After install, entering spec pages you will se prediction box.

## How to use

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
