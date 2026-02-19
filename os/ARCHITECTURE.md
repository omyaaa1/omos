# Omos OS Architecture Blueprint

## Goal
Build a Debian-based, security-focused Linux distribution with a custom lightweight desktop, developer stack, and pentest tooling. The system must boot on bare metal, VM, and live ISO, and remain modular and reproducible.

## Base System
- Kernel: Linux LTS (latest stable LTS track).
- Init: systemd.
- Package manager: APT-compatible.
- Filesystem: ext4 default, btrfs optional.
- Secure boot compatibility: signed kernel + shim + GRUB.

## Boot Targets
- Bare metal install (UEFI + BIOS).
- Virtual machines (VirtualBox, VMware).
- Live ISO with optional persistence.

## Editions / Profiles
- minimal: headless base + CLI tools.
- full: desktop + developer stack + browser + utilities.
- pentest: full + security toolchain.

## Major Subsystems
1) Build System
- Debian live-build driven ISO generation.
- Profile-based package lists and hooks.
- Reproducible build output (pin versions, snapshot repo).

2) Installer
- Graphical installer for partitioning, encryption, users, GRUB setup.
- Supports dual-boot, timezone, language selection.
- Exposes LUKS full disk encryption option.

3) Desktop Environment
- Custom lightweight shell, or Xfce-based with custom WM.
- WM must support tiling + floating and configurable shortcuts.
- Panel with launcher, monitors, audio, battery, notifications.
- Dark hacker-style theme.

4) Browser
- Chromium base with hardened defaults.
- Preinstalled privacy extensions and proxy support.
- DevTools enabled and safe defaults for telemetry.

5) Terminal
- Bash + Zsh + Oh-My-Zsh.
- Syntax highlighting, tabs, splits, SSH, Git.

6) File Explorer
- Local FS navigation, root toggle, disk tools.
- SMB/NFS, archive extraction, permissions editor.
- Integrated terminal panel.

7) Dev Stack
- Apache, Nginx, PHP, Python, Node LTS.
- MariaDB/MySQL, phpMyAdmin.
- Docker + Compose.
- Localhost dashboard + GUI start/stop + vhost automation.

8) Security & Pentest
- Kali-equivalent tools preinstalled and updated via APT.
- Menu integration + GUI launchers.

9) Networking
- Network manager GUI.
- Monitor mode tooling, MAC randomization.
- VPN client, TOR routing toggle.
- Firewall UI + packet capture.

10) Hardening
- AppArmor (default) or SELinux option.
- Fail2ban, firewall enabled, auto security updates toggle.
- User separation and least privilege defaults.

## Security Model
- Hardened defaults, defense-in-depth.
- Privileged actions gated via policykit and sudo.
- Secure boot signing, verified boot chain.

## Delivery Artifacts
- OS source tree.
- Kernel config and patches.
- Desktop shell code and theming.
- Installer code.
- Package lists and scripts.
- ISO build scripts.
- Setup and VM deployment docs.
