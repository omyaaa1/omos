#!/usr/bin/env python3
"""
Generate merged package list from profile.
Assumes simple YAML with:
name: <profile>
packages:
  - base.list
  - desktop.list
"""
import argparse
from pathlib import Path


def parse_profile(path: Path):
    packages = []
    in_packages = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("packages:"):
            in_packages = True
            continue
        if in_packages:
            if line.startswith("-"):
                item = line.lstrip("-").strip()
                if item:
                    packages.append(item)
            else:
                # stop if a new section begins
                if ":" in line:
                    in_packages = False
    return packages


def read_package_list(path: Path):
    pkgs = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        pkgs.append(line)
    return pkgs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", required=True)
    ap.add_argument("--profiles-dir", required=True)
    ap.add_argument("--packages-dir", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    profile_path = Path(args.profiles_dir) / f"{args.profile}.yaml"
    if not profile_path.exists():
        raise SystemExit(f"profile not found: {profile_path}")

    list_files = parse_profile(profile_path)
    if not list_files:
        raise SystemExit("no packages defined in profile")

    merged = []
    seen = set()
    for list_name in list_files:
        list_path = Path(args.packages_dir) / list_name
        if not list_path.exists():
            raise SystemExit(f"package list not found: {list_path}")
        for pkg in read_package_list(list_path):
            if pkg not in seen:
                seen.add(pkg)
                merged.append(pkg)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(merged) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
