#!/usr/bin/env python3
"""Build sdist and wheel artifacts from SDK sources without a private checkout."""
from __future__ import annotations

import argparse
from email.parser import BytesParser
from pathlib import Path
import shutil
import subprocess
import tempfile
import tomllib
import tarfile
import zipfile


def verify_artifacts(directory: Path, project: dict, output: Path) -> None:
    name = project['name'].replace('-', '_')
    stem = f"{name}-{project['version']}"
    texts = {name: (directory.parents[2] / name).read_bytes() for name in ("LICENSE", "NOTICE")}
    with tarfile.open(output / f"{stem}.tar.gz") as archive:
        sdist = {entry.name: archive.extractfile(entry).read() for entry in archive.getmembers() if entry.isfile()}
    wheels = list(output.glob(f"{stem}-*.whl"))
    if len(wheels) != 1:
        raise ValueError(f"expected one SDK wheel: {stem}")
    with zipfile.ZipFile(wheels[0]) as archive:
        wheel = {name: archive.read(name) for name in archive.namelist()}
    info = f"{stem}.dist-info"
    for files, metadata, prefix in [(sdist, f"{stem}/PKG-INFO", stem), (wheel, f"{info}/METADATA", f"{info}/licenses")]:
        headers = BytesParser().parsebytes(files[metadata], headersonly=True)
        if (headers['Name'] != project['name'] or headers['Version'] != project['version']
                or headers['License-Expression'] != project['license']
                or set(headers.get_all('License-File', [])) != set(texts)
                or any(value.startswith('Private ::') for value in headers.get_all('Classifier', []))):
            raise ValueError(f"published SDK metadata differs: {metadata}")
        for name, expected in texts.items():
            if not expected or files.get(f"{prefix}/{name}") != expected:
                raise ValueError(f"published SDK {name} differs: {project['name']}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--python", default="python3.14")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1] / "python/packages"
    output = args.output.resolve()
    if output == root or root in output.parents:
        parser.error("output must be outside the SDK packages")
    output.mkdir(parents=True, exist_ok=True)
    if any(output.iterdir()):
        parser.error("output must be empty")
    projects = {}
    for directory in sorted(root.iterdir()):
        if directory.is_symlink() or not directory.is_dir():
            raise ValueError(f"expected a physical SDK package: {directory}")
        project = tomllib.loads((directory / "pyproject.toml").read_text())["project"]
        if project["name"] in projects:
            raise ValueError(f"duplicate SDK package: {project['name']}")
        projects[project["name"]] = (directory, project)
    version = projects["aionix-client"][1]["version"]
    pending, visited = ["aionix-client"], set()
    while pending:
        name = pending.pop()
        if name in visited:
            continue
        _, project = projects[name]
        if project["version"] != version:
            raise ValueError("SDK packages must have one release version")
        visited.add(name)
        for dependency in project["dependencies"]:
            target, requirement = dependency.split("==")
            if target not in projects or requirement != version:
                raise ValueError(f"dependency outside SDK release: {dependency}")
            pending.append(target)
    if visited != projects.keys():
        raise ValueError("SDK contains packages outside the client dependency closure")
    with tempfile.TemporaryDirectory(prefix="aionix-sdk-build-") as temporary:
        for directory, project in projects.values():
            copy = Path(temporary) / directory.name
            shutil.copytree(directory, copy, ignore=shutil.ignore_patterns("__pycache__", "*.pyc", "*.egg-info", "build", "dist"))
            # uv builds the wheel from its freshly built sdist by default.
            subprocess.run(["uv", "build", "--python", args.python, "--out-dir", str(output), str(copy)], check=True)
            verify_artifacts(directory, project, output)
    print(f"Built {len(projects)} SDK sdists and wheels ({version})")


if __name__ == "__main__":
    main()
