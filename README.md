# AionixOne SDK

TypeScript and Python clients for the public AionixOne product API. The SDK
contains client code and public protocol types. Product servers, Cloud account
and billing APIs, private contracts and repository history are not included.

## Source ownership

`typescript/packages` and `python/packages` are generated delivery sources.
Operation selection and reachable types come from the product's public contract
projection, including the declared public authoring and session protocol types.
Fix generated behavior at its contract or generator source; do not maintain a
second implementation by editing these outputs. The scripts, examples and
workspace documentation outside the generated package roots are authored SDK
files. A standalone source export can be built without the private generator.

## Validate a declarative YAML file

The standalone export includes `schemas/index.json`. Look up a declaration by
its `apiVersion`, `service` and `resourceType`. The `schema` path is relative to
the index. Each file is a self-contained JSON Schema (draft 2020-12).
For example, with check-jsonschema installed, validate a parameter YAML offline:

```sh
check-jsonschema --schemafile schemas/v1/paramstore/param.schema.json my-param.yaml
```

Schema validation checks document structure. Applying a declaration also checks
resource references, permissions and service-specific rules.

## Build and package

Use Bun 1.3.9 and the checked-in TypeScript workspace lock file:

```sh
cd typescript
bun install --frozen-lockfile --ignore-scripts
bun run build
bun run pack --output /absolute/empty/typescript-artifacts
```

The build order is derived from package dependencies. Bun packs the workspace
dependencies as exact package versions. The output contains `.tgz` archives;
these commands never publish to a registry.

Python packages require CPython 3.14. Install `uv`, then from this directory:

```sh
python3 scripts/python.py --python python3.14 --output /absolute/empty/python-artifacts
```

The build creates source distributions and builds wheels from them in temporary
directories. Each package declares its build backend and exact SDK dependencies.
No private root catalog, Rust compiler, Cargo or xtask is needed by either build.

## Install a local release

Install the complete set of TypeScript tarballs into an empty application with
`npm install --offline --ignore-scripts /absolute/typescript-artifacts/*.tgz`. For Python, create a 3.14 virtual
environment and run `uv pip install --no-index --find-links /absolute/python-artifacts aionix-client`.
The examples show a read-only parameter listing; use your own product endpoint,
tenant and API credential. Do not commit credentials.

The source export's `SOURCE.json` records file digests and version, and
`PUBLIC_API.json` documents the same public operation selection used to generate
both SDKs. Neither file is a second API source of truth.

## License

Apache-2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE). This license applies to
the SDK scope only. The private AionixOne product and Cloud are separate works.
Local build and export do not mean the source or packages have been published.
