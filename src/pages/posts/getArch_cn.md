---
layout: "../../layouts/MarkdownPost.astro"
title: "如何获取属于你的操作系统"
pubDate: 2025-05-20
description: "从零构建ArchLinux"
author: "小明"
cover:
  url: "https://www.svgrepo.com/show/349296/arch-linux.svg"
  alt: "cover"
tags: ["指南"]
---

## 写在前面

> 首先我希望明确一些前提：

- 本文的安装目标是最基础的无图形化的archlinux系统
- 仅本人实际构筑经历，希望你能勤查手册
- 可以复刻安装，请仔细阅读，明白你所敲入的命令意义几何

### 禁用reflector服务

```bash
systemctl stop reflector.service
```

2020年archlinux安装镜像中加入的reflector服务，旨在自更新mirrorlist，即软件包管理器pacman的软件源，但由于地理上造就的特殊网络境遇，此服务并不适合启用。

### 连接网络

经过多次实践，我推荐你有线连接网络，如果一定要使用无线网络，请参阅[iwctl](https://wiki.archlinux.org/title/Iwd)

小声：其实在这一步建议有线网络的原因主要是绕开一些怪问题，比如无线网卡如果是博通一类的闭源驱动依赖硬件，在本地构建闭源驱动前，很可能是不能够使用任何无线网络的。

### 校准系统时钟

```bash
timedatectl set-ntp true
```

使用timedatectl确保系统时间保持准确，正确的系统时间对于绝大部分程序来说都很重要。

### 更换国内软件仓库镜像源以提高下载速度（可选项）

鉴于特殊的网络原因，建议将pacman的软件镜像源更换为国内仓库镜像源

```bash
vim /etc/pacman.d/mirrorlist
```

我在此处使用[vim](https://www.vim.org/)作为编辑器，君可选己所好

```bash
# 推荐的中国镜像源，放在最上面会优先使用
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch # 中国科学技术大学开源镜像站
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch # 清华大学开源软件镜像站
Server = https://repo.huaweicloud.com/archlinux/$repo/os/$arch # 华为开源镜像站
Server = http://mirror.lzu.edu.cn/archlinux/$repo/os/$arch # 兰州大学开源镜像站
```

### 硬盘分区

> [!WARNING]
> 分区操作的部分命令具有危险性！除非你知道每一个命令在干什么，否则请不要执行！

同时，请提前做好数据备份，防止数据丢失！

首先你需要明了本机所安装的全部硬盘以及其分区情况

```bash
lsblk
```

对于单硬盘计算机，很可能是这样的:

```bash
$ lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda      8:0    0 238.5G  0 disk
├─sda1   8:1    0   3.7G  0 part /boot
├─sda2   8:2    0  14.9G  0 part [SWAP]
└─sda3   8:3    0 219.8G  0 part /home
                                 /
➜  ~
```

> 这是我的一块完整安装了archlinux的硬盘分区情况

其中，需要讲明一些基础的术语，如果是sata硬盘，就会是sda、sdb这样的标识，而nvme硬盘则是nvme0、nvme1这样的硬盘顺序标示，其子分区命名则是sda1、sda2、sda3，相应的是nvme0n1p1、nvme0n1p2
详细可参见:

- [tldp关于linux中驱动器命名](https://tldp.org/HOWTO/Partition-Mass-Storage-Definitions-Naming-HOWTO/x99.html)
- [nvme的BSD内核接口手册](<https://man.cx/nvme(4)>)

如果是双硬盘计算机，或者你希望在单硬盘中写入双系统

那么，基于你明白分区的基本概念，那么你只要知道，最重要的是在EFI中写入grub引导即可

鉴于本文面向全新安装玩家，我会介绍建立经典三分区做法，即EFI/Swap/filesystem

在你明确了你目标安装的硬盘对应的编号及格式后，对安装archlinux的硬盘分区

```bash
cfdisk /dev/sdx # 这里的sdx换成你要安装到的硬盘编号
```

cfdisk作为可视化的分区工具，上手十分简单，方向键选择到空余空间，并对空余空间进行操作。

现在假设对sdx（替换成你自己对应的硬盘编号）进行分区

那么选中你提前预留的（或者全新硬盘中的）Free space

选中 Free space > 再选中操作 `[New]` > 然后按下回车 Enter 以新建分区

输入分区大小，记得带单位GB、MB等

回车后选中`[Type]` > 然后按下回车 Enter > 通过方向键 ↑ 和 ↓ 选中希望新建的分区类型 > 最后按下回车 Enter

需要说明的是，EFI为系统的引导分区，如果你希望后期在grub里塞一些个性化的动画或者图片库，又或者里面有一堆多系统引导文件，那么你的EFI分区最好多预留一些，一块小于256GB的硬盘EFI分区可以在256MB，上限则取决于你自己。

Swap分区作为物理内存的延申，在物理内存不足时，暂时不活跃的内存数据会被移动到交换分区，进而实现系统的稳定性，值得注意的是，由于硬盘读写速度远低于内存，频繁使用Swap会显著降低系统性能。

不过我仍然强烈建议你创建该分区，请参见[Chris Down关于Swap的讨论](https://chrisdown.name/2018/01/02/in-defence-of-swap.html)

Swap分区建议在物理内存的60%大小

filesystem则是archlinux文件系统的分区，一般余下的空间都会分配给该分区，这个分区的最小值基本上取决于你自己的希望，如果按照vps的大多数值，20GB也够用，日用最好还是大一些罢XD。

值得注意的是，一旦分区大小确定，恐怕难以压缩大小，至少本人目前还没有掌握无损压缩分区的技术XD

分区调整好后，选中操作 `[Write]` 并回车 Enter > 输入 yes 并回车 Enter 确认分区操作，只有写入了操作，分区表才会做出更改，本步骤不可逆。

选中操作 `[Quit]` 并回车 Enter 以退出 cfdisk 分区工具

```bash
fdisk -l # 复查磁盘情况
```

大概长这样:

```bash
Disk /dev/sda: 238.47 GiB, 256060514304 bytes, 500118192 sectors
Disk model: SanDisk SD9SN8W-
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 20E353E0-A9E2-453F-B00B-DE0F78CF5A5B

Device        Start       End   Sectors   Size Type
/dev/sda1      2048   7815167   7813120   3.7G EFI System
/dev/sda2   7815168  39065599  31250432  14.9G Linux swap
/dev/sda3  39065600 500117503 461051904 219.8G Linux filesystem
```

> 当然这还是我的那块硬盘分区情况

### 格式化并创建Btrfs子卷

关于Btrfs的使用，社区内的争论其实一直都有，不过本人还是持积极态度，只说明采用Btrfs的理由：快照（arch滚挂了可以快速回滚）、透明压缩（节约磁盘使用空间）

本处不赘述传统ext4文件系统分区安装，请参见[ext4](https://wiki.archlinux.org/title/Ext4)

格式化EFI分区

```bash
mkfs.fat -F32 /dev/sdxn # 换成你自己的硬盘分区号，如果是我的硬盘，对应的就是sda1
```

格式化Swap分区

```bash
mkswap /dev/sdxn
```

格式化 Btrfs 分区

```bash
mkfs.btrfs -L myArch /dev/sdxn
```

`-L`参数是指该分区的LABLE，此处myArch可以自定义，但不能使用特殊字符

挂载Btrfs分区

```bash
mount -t btrfs -o compress=zstd /dev/sdxn /mnt # 这里sdxn是你filesystem所在分区，别搞错了
```

`-t`指定了挂载的分区文件系统类型
`-o`添加了挂载参数，`compress=zstd`开启透明压缩

创建Btrfs子卷

```bash
btrfs subvolume create /mnt/@ # 创建 / 目录子卷
btrfs subvolume create /mnt/@home # 创建 /home 目录子卷
```

卸载`/mnt`以挂载子卷

```bash
umount /mnt

```

按顺序挂载，看清楚再挂，对应好分区类型，别挂错了

```bash
mount -t btrfs -o subvol=/@,compress=zstd /dev/sdxn /mnt # 挂载 / 目录
mkdir /mnt/home # 创建 /home 目录
mount -t btrfs -o subvol=/@home,compress=zstd /dev/sdxn /mnt/home # 挂载 /home 目录
mkdir -p /mnt/boot # 创建 /boot 目录
mount /dev/sdxn /mnt/boot # 挂载 /boot 目录
swapon /dev/sdxn # 挂载交换分区
```

### 安装系统

```bash
pacstrap /mnt base base-devel linux linux-firmware btrfs-progs
# 如果使用btrfs文件系统，额外安装一个btrfs-progs包

pacman -S archlinux-keyring
# 如果不是最新的镜像文件，可能会报GPG证书错误

pacstrap /mnt networkmanager vim sudo zsh zsh-completions
# 必要功能性软件
```

对应包我就不介绍了，自己去查手册吧，linux作为内核不建议这一步就更换，提前跟换内核，可能会造成一些驱动不兼容的问题导致

### 生成fstab文件

```bash
genfstab -U /mnt > /mnt/etc/fstab
```

fstab用于定义磁盘分区，genfstab根据当前挂载情况生成fstab文件

### change root

```bash
arch-chroot /mnt
```

进入新系统

### 新系统的基础设置

设置主机名与时区

```bash
vim /etc/hostname
# 取自己喜欢的主机名，不能包含特殊字符与空格，此处示例myarch

vim /etc/hosts
# 加入如下内容
127.0.0.1   localhost
::1         localhost
127.0.1.1   myarch.localdomain myarch
# 此处myarch对应你的主机名

ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 设置上海作为时区
```

某些情况下如不设置主机名，在 KDE 下可能会存在网络情况变更时无法启动 GUI 应用的问题

设置硬件时间与locale

```bash
hwclock --systohc
# 将系统时间同步到硬件时间

vim /etc/locale.gen
# 去掉 en_US.UTF-8 UTF-8 以及 zh_CN.UTF-8 UTF-8 行前的注释符号

locale-gen
# 生成locale

echo 'LANG=en_US.UTF-8'  > /etc/locale.conf
# 设置英文locale，不建议设置任何中文locale，会导致tty乱码
```

Locale 决定了软件使用的语言、书写习惯和字符集

为root用户设置密码

```bash
passwd root
# 密码设置时是隐式输入的，所以正常输入即可，没有显示你的输入内容是正常的
```

安装对应芯片制造商的微码

```bash
pacman -S intel-ucode amd-ucode
```

安装引导程序

```bash
pacman -S grub efibootmgr os-prober
```

安装grub到efi分区

```bash
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH
# ARCH换成你自己的命名，会显示在grub界面
```

编辑grub参数

```bash
vim /etc/default/grub

# 去掉 GRUB_CMDLINE_LINUX_DEFAULT 一行中最后的 quiet 参数
# 把 loglevel 的数值从 3 改成 5，这样是为了后续如果出现系统错误，方便排错
# 加入 nowatchdog 参数，这可以显著提高开关机速度

# 最终该项为GRUB_CMDLINE_LINUX_DEFAULT="loglevel=5 nowatchdog"

# 为了引导 win10，则还需要将最下面一行的注释取消 使得GRUB_DISABLE_OS_PROBER=false语句生效
```

生成配置文件

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

### 完成安装

```bash
exit # 退回安装环境
umount -R /mnt # 卸载新分区
reboot # 重启
```

重启后使用root账户登陆，登陆后设置网络服务模块自启动

```bash
systemctl enable --now NetworkManager # 设置开机自启并立即启动 NetworkManager 服务
ping nbtca.space # 测试网络连接
```

使用nmtui连接网络

```bash
nmtui
```

---

至此完成无图形基础界面安装

🖥 [小明](https://m1ng.space/) 写于2025年05月29日,更新于2025年09月28日
