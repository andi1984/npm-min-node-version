const fs = require("fs");

const JSONMask = require("json-mask");
const npm = require("npm");
const resolvePackagePath = require("resolve-package-path");
const semver = require("semver");
const semverGt = require("semver/functions/gt");

const minNode = (workspacePrefix: string = process.cwd()) => {
  return new Promise((resolve, reject) => {
    npm.load(
      { depth: 0, prefix: workspacePrefix },
      (e: Error, npmInstance: Object) => {
        npm.commands.ls([], true, (err: Error, data: any) => {
          if (err) {
            reject(err);
          }

          // Get list of direct dependencies
          const dependencies = Object.keys(data.dependencies);

          let currentMinVersion: string | undefined;

          // For every direct dependency...
          dependencies.forEach((dependency) => {
            // 1. Get package.json folder path searched from the folder the command
            //    is running in with disabled cache!
            const packagePath = resolvePackagePath(
              dependency,
              workspacePrefix,
              false
            );

            if (!packagePath || !fs.existsSync(packagePath)) {
              console.warn(
                `package.json for "${dependency}" could not be loaded. Thus it is not taken into account.`
              );
              return;
            }

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
              reject(
                `${dependency}: ${nodeSemVer} is not a valid SemVer range.`
              );
            }

            // Calculate the minimum Node version that fulfills the package's node
            // semver
            const minNodeVersionObjectForCurrentSemVer = semver.minVersion(
              validRange
            );

            // In case no min version couldn't be calculated --> we throw an error
            if (!minNodeVersionObjectForCurrentSemVer) {
              reject(
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

          // If we did not came up with a minimum version --> we throw an error
          if (currentMinVersion === undefined) {
            reject(
              `Unable to calculate a minimum node version. Sorry. Please file a ticket including your current package.json. Thanks!`
            );
          }

          resolve(currentMinVersion);
        });
      }
    );
  });
};

export default minNode;
