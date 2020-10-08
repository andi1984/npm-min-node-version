# Min-Node

## Idea

NPM already provides for package authors to specify which Node versions their package can be used with, namely the [engines](https://docs.npmjs.com/files/package.json#engines) field in the package.json file.

## Motivation

But there is currently no way, except manually clicking through all your node_modules dependencies, to grasp an idea of which the minimum Node version is that you need to have to use your project and all its dependencies.

So it would be super nice to run

`npx min-node`

and get an answer to this question. Well... now you can do exactly that!

## Disclaimer

**This package WILL NOT PROVIDE and CAN NOT GUARANTEE you a 100% accurate answer to this question.**

Why not? Well, we do not live in a perfect world and thus there are certain factors and assumptions that influence the quality of the result.

### Assumption: Node range specified on a dependency fulfills the Node ranges of all its own dependencies

Example: Your project has package "foo" as a dependency. "foo" itself has a dependency on its own called "bar".

To simplify the logic here we assume that the minimum node version that "foo" requires also matches the Node range specified on "bar" and any other dependency "foo" might have besides "bar".

With this assumption it is "enough" to check the direct dependencies of your project instead of checking the whole dependency tree.

### Factor package.json Quality: What about packages that do not provide the `engines` field in their package.json?

Short answer: We ignore those packages for now, but still they all might have hidden Node dependencies which are not taken into account at all.

You will just find them while trying it out.

## Tl;dr

Don't take the results too seriously. The package is meant to be used for getting a broad idea which Node version might be required to fit all dependencies.

The result you get back is baked under all those assumptions and factors explained above.

But one thing is for sure: The exact specified minimum node version you need is not less than what we gave you as an orientation. It can just be higher as that one.