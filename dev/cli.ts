import minNode from "./minNode";

async function cli(args: string[]) {
  const minNodeVersion = await minNode().catch(console.error);
  console.log(
    `The minimum necessary Node version is at least ${minNodeVersion}.`
  );
}

export default cli;
