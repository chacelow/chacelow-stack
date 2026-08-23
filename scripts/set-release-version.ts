import { readFile, writeFile } from "node:fs/promises";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error("Usage: bun scripts/set-release-version.ts <major.minor.patch>");
}

const readPackage = async (path: string): Promise<Record<string, unknown>> =>
  JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;

const writePackage = async (path: string, packageJson: Record<string, unknown>): Promise<void> => {
  await writeFile(path, `${JSON.stringify(packageJson, null, 2)}\n`);
};

const typesPath = "packages/types/package.json";
const generatorPath = "packages/template-generator/package.json";
const cliPath = "apps/cli/package.json";

const typesPackage = await readPackage(typesPath);
typesPackage.version = version;
await writePackage(typesPath, typesPackage);

const generatorPackage = await readPackage(generatorPath);
generatorPackage.version = version;
(generatorPackage.dependencies as Record<string, string>)["@chacelow-stack/types"] = version;
await writePackage(generatorPath, generatorPackage);

const cliPackage = await readPackage(cliPath);
cliPackage.version = version;
const cliDependencies = cliPackage.dependencies as Record<string, string>;
cliDependencies["@chacelow-stack/types"] = version;
cliDependencies["@chacelow-stack/template-generator"] = version;
await writePackage(cliPath, cliPackage);

console.log(`Prepared npm packages for ${version}`);
