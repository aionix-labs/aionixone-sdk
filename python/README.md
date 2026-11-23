# Python packages

Use CPython 3.14. Each package in `packages/` has its own `pyproject.toml` and
typed source. From the SDK root, run:

```sh
python3 scripts/python.py --python python3.14 --output /absolute/empty/directory
```

The output includes one sdist and wheel per package. Installing `aionix-client`
from this local package directory resolves the complete, exact-version SDK
dependency closure. The runtime uses Python's standard library.

See [SDK instructions](../README.md) for source ownership and installation.
