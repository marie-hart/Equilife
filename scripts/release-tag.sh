#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 vX.Y.Z"
  exit 1
fi

TAG="$1"
if [[ ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid tag format: $TAG"
  echo "Expected: vX.Y.Z"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is not clean. Commit or stash changes before tagging."
  exit 1
fi

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "Tag already exists: $TAG"
  exit 1
fi

echo "Creating annotated tag $TAG"
git tag -a "$TAG" -m "Release $TAG"
echo "Tag created. Push with:"
echo "  git push origin $TAG"
