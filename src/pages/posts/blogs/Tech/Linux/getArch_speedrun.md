---
layout: "../../../../../layouts/MarkdownPost.astro"
title: "Install the Archlinux (SpeedRun Version)"
pubDate: 2025-03-28
description: "arch速通纪录，请在专业人士指导下操作XD"
author: "小明"
cover:
  url: "https://www.svgrepo.com/show/349296/arch-linux.svg"
  alt: "cover"
tags: ["技术"]
---

# 🚀 Arch Linux Dual Boot Guide (Speedrun Version)

## **1. Prepare Windows**
- **Shrink Windows Partition**  
  - Open `diskmgmt.msc`, shrink `C:` by **50GB+** (Unallocated Space).  
- **Check Boot Mode**  
  - Press `Win + R`, type `msinfo32`, check **BIOS Mode**:  
    - **UEFI** → Continue with UEFI  
    - **Legacy (MBR)** → Use MBR installation  

---

## **2. Boot into Arch Live USB**
- Create USB:  
  ```sh
  dd if=archlinux.iso of=/dev/sdX bs=4M status=progress
  ```
- Boot from USB in BIOS.

---

## **3. Partition the Disk**
```sh
lsblk  # Identify your disk (e.g., /dev/nvme0n1)
cfdisk /dev/nvme0n1
```
- **Keep Windows partitions**  
- Create **Linux Root Partition** (`ext4`, **50GB+**)
- **(Optional)** Create Swap Partition (8GB)  

---

## **4. Format & Mount**
```sh
mkfs.ext4 /dev/nvme0n1p3
mount /dev/nvme0n1p3 /mnt
mkdir -p /mnt/boot/efi
mount /dev/nvme0n1p1 /mnt/boot/efi  # Use Windows' EFI partition
```
*(If Swap)*
```sh
mkswap /dev/nvme0n1p4
swapon /dev/nvme0n1p4
```

---

## **5. Install Arch**
```sh
pacstrap /mnt base linux linux-firmware vim
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
```

---

## **6. Basic Config**
```sh
ln -sf /usr/share/zoneinfo/Region/City /etc/localtime
hwclock --systohc
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "archlinux" > /etc/hostname
passwd  # Set root password
```

---

## **7. Install & Configure GRUB**
```sh
pacman -S grub efibootmgr os-prober
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
os-prober
grub-mkconfig -o /boot/grub/grub.cfg
```

---

## **8. Finish Installation**
```sh
exit
umount -R /mnt
reboot
```
- **Select Arch Linux from GRUB** 🎉  
- If Windows is missing from GRUB:
  ```sh
  os-prober
  grub-mkconfig -o /boot/grub/grub.cfg
  ```

---

## **Done!** 🚀
