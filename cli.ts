import minNode from "./dev/min-node";
export async function cli(args: string[]) {
  const minNodeVersion = await minNode().catch(console.error);
  console.log(
    `The minimum necessary Node version is at least ${minNodeVersion}.`
  );
}
