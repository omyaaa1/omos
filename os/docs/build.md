# Build Instructions (Draft)

## Prereqs
- Debian/Ubuntu host
- live-build
- debootstrap
- xorriso

## Build
```
./os/build/scripts/build-iso.sh full
```

## Notes
- Pin APT sources for reproducibility.
- Use a snapshot mirror for deterministic builds.
