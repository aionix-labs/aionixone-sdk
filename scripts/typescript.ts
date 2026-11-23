import { readdir, readFile, mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../typescript');
type Package = {
  directory: string;
  name: string;
  version: string;
  license: string;
  dependencies?: Record<string, string>;
};

async function run(args: string[], cwd: string): Promise<void> {
  const child = Bun.spawn(args, { cwd, stdout: 'inherit', stderr: 'inherit' });
  if (await child.exited !== 0) throw new Error(`SDK command failed: ${args.join(' ')}`);
}

const packages = new Map<string, Package>();
for (const entry of await readdir(path.join(root, 'packages'), { withFileTypes: true })) {
  if (!entry.isDirectory()) throw new Error(`Expected a physical SDK package: ${entry.name}`);
  const directory = path.join(root, 'packages', entry.name);
  const metadata = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
  if (packages.has(metadata.name)) throw new Error(`Duplicate SDK package: ${metadata.name}`);
  packages.set(metadata.name, { ...metadata, directory });
}
const version = packages.get('@aionix/client')?.version;
if (!version || [...packages.values()].some(pkg => pkg.version !== version)) {
  throw new Error('SDK packages must have one release version');
}

const ordered: Package[] = [];
const visiting = new Set<string>();
const visited = new Set<string>();
function visit(name: string): void {
  if (visited.has(name)) return;
  const pkg = packages.get(name);
  if (!pkg) throw new Error(`SDK dependency is outside the source workspace: ${name}`);
  if (visiting.has(name)) throw new Error(`SDK dependency cycle: ${name}`);
  visiting.add(name);
  for (const [dependency, requirement] of Object.entries(pkg.dependencies ?? {})) {
    if (requirement !== 'workspace:*') throw new Error(`Expected SDK workspace dependency: ${dependency}`);
    visit(dependency);
  }
  visiting.delete(name);
  visited.add(name);
  ordered.push(pkg);
}
visit('@aionix/client');
if (visited.size !== packages.size) throw new Error('SDK workspace contains packages outside the client dependency closure');

const [command, ...args] = process.argv.slice(2);
if (command === 'build' && args.length === 0) {
  for (const pkg of ordered) await run(['bun', 'run', 'build'], pkg.directory);
  console.log(`Built ${ordered.length} SDK packages (${version})`);
} else if (command === 'pack' && args.length === 2 && args[0] === '--output') {
  const output = path.resolve(args[1]);
  await mkdir(output, { recursive: true });
  const resolved = await realpath(output);
  if (resolved === root || resolved.startsWith(root + path.sep)) throw new Error('Package output must be outside the SDK workspace');
  if ((await readdir(output)).length) throw new Error('Package output must be empty');
  // Bun owns workspace dependency normalization in the actual publish artifact.
  const license = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).license;
  const texts = await Promise.all(['LICENSE', 'NOTICE'].map(async name => (
    { name, bytes: await readFile(path.join(root, '..', name)) }
  )));
  for (const pkg of ordered) {
    if (pkg.license !== license) throw new Error(`SDK license differs from workspace: ${pkg.name}`);
    const filename = `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`;
    await run(['bun', 'pm', 'pack', '--ignore-scripts', '--quiet', '--filename', path.join(resolved, filename)], pkg.directory);
    const files = await new Bun.Archive(await Bun.file(path.join(resolved, filename)).bytes()).files();
    const metadata = JSON.parse(await files.get('package/package.json')!.text());
    if (metadata.name !== pkg.name || metadata.version !== pkg.version || metadata.license !== license || metadata.private !== undefined) {
      throw new Error(`Published SDK metadata differs: ${pkg.name}`);
    }
    for (const {name, bytes} of texts) {
      const file = files.get(`package/${name}`);
      if (!bytes.length || !file || !bytes.equals(Buffer.from(await file.arrayBuffer()))) {
        throw new Error(`Published SDK ${name} differs: ${pkg.name}`);
      }
    }
  }
  console.log(`Packed ${ordered.length} SDK packages (${version})`);
} else {
  throw new Error('Usage: bun scripts/typescript.ts build | pack --output <empty-directory>');
}
