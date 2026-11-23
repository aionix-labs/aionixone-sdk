# TypeScript workspace

Run `bun install --frozen-lockfile --ignore-scripts`, then `bun run build` here.
`bun run pack --output /absolute/empty/directory` produces local package archives.

`packages/*/src` contains the generated implementation and declarations.
The client uses the web Fetch API and Web Streams. Package exports are ES modules.
Use `AionixOne` from `@aionix/client` for the complete API; individual service
packages share the same core transport and contract types.

See [SDK instructions](../README.md) for source ownership and local installation.
