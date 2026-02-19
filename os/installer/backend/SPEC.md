# Installer Backend Spec (Draft)

## Steps
1. Disk detection (lsblk + blkid)
2. Partitioning (libparted or sfdisk)
3. Filesystem (mkfs.ext4 or mkfs.btrfs)
4. Encryption (LUKS via cryptsetup)
5. Mounting target
6. Bootstrap base (debootstrap)
7. fstab, locales, hostname
8. Install packages (apt)
9. Bootloader (grub-install + update-grub)
10. User creation + sudo

## Notes
- Use policykit to gate privileged ops.
- Log everything to /var/log/omos-installer.log
