const fs = require("fs");

const JSONMask = require("json-mask");
const npm = require("npm");
const resolvePackagePath = require("resolve-package-path");
const semver = require("semver");
const semverGt = require("semver/functions/gt");

export function cli(args: string[]) {
  npm.load({ depth: 0 }, (e: Error, npmInstance: Object) => {
    const a = npm.commands.ls([], true, (err: Error, data: any) => {
      // Get list of direct dependencies
      const dependencies = Object.keys(data.dependencies);

      let currentMinVersion: string | undefined;

      // For every direct dependency...
      dependencies.forEach((dependency) => {
        // 1. Get package.json folder path
        const packagePath = resolvePackagePath(dependency);

        // 2. Read out engines.node info from that package.json file
        const rawData = fs.readFileSync(packagePath);
        const packageJSON = JSON.parse(rawData);
        const nodeEngineJSONPart = JSONMask(packageJSON, "engines/node");
        const nodeSemVer =
          "engines" in nodeEngineJSONPart
            ? nodeEngineJSONPart.engines.node
            : null;

        // NOTE: If none is provided, we ignore this dependency. This not
        // necessarily means that there is no hidden dependency-
        if (!nodeSemVer) {
          return;
        }

        const validRange = semver.validRange(nodeSemVer);

        // If semver is not a valid range... 
        if (!validRange) {
          throw new Error(`${dependency}: ${nodeSemVer} is not a valid SemVer range.`);
        }

        // Calculate the minimum Node version that fulfills the package's node
        // semver
        const minNodeVersionObjectForCurrentSemVer = semver.minVersion(
            validRange
        );

        // In case no min version couldn't be calculated --> we throw an error
        if (!minNodeVersionObjectForCurrentSemVer) {
          throw new Error(
            `Unable to calculate a minimum node version for "${dependency}" based on SemVer range "${validRange}"`
          );
        }

        // Minium Node version for this dependency
        const minVersion = minNodeVersionObjectForCurrentSemVer.version;

        // If we haven't saved any Node version to our temporary variable, we
        // set the minium node version of this dependency as the first one.
        if (!currentMinVersion) {
          return (currentMinVersion = minVersion);
        }

        // If the minimum version for this dependency is greater then everything
        // else we had before ==> update the min version
        if (semverGt(minVersion, currentMinVersion)) {
          return (currentMinVersion = minVersion);
        }
      });

      console.log(`Minimum necessary Node version is ${currentMinVersion}`);
    });
  });

  debugger;
}
