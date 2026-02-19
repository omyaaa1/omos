# Omos Desktop Window Manager (Plan)

## Goals
- Tiling + floating modes
- Configurable keybindings
- Workspaces
- Single-process stability

## Candidate Base
- Wayland: wlroots-based (e.g., river/sway fork) or custom
- X11: i3/awesome fork with custom config

## Decision
Start with X11+i3-compatible config for speed, then migrate to wlroots.
