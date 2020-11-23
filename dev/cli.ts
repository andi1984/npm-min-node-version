import minNode from "./minNode";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2))
  .usage("Usage: $0 --dir [path]")
  .default("dir", process.cwd())
  .demandOption(["dir"]).argv;

async function cli() {
  const minNodeVersion = await minNode(argv.dir).catch(console.error);
  console.log(
    `The minimum necessary Node version is at least ${minNodeVersion}.`
  );
}

export default cli;
