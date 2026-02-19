# Installer

Graphical installer providing:
- Partitioning and dual-boot
- User and root creation
- Encryption (LUKS)
- GRUB configuration
- Language and timezone

Implementation plan:
- UI: GTK frontend
- Backend: debian-installer components + custom glue
- Policy: enforce secure defaults
