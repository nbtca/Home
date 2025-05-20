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

# 前言
Arch奉行[极简主义](https://wiki.archlinux.org/title/Arch_Linux)，用户可以自行构建任何想要的功能，接下来以实际本机部署为例简单介绍如何构建属于自己的archlinux

# 目录

- [准备工作](#准备工作)
- [安装介质构建](#安装介质构建)
- [基础安装](#基础安装)
    - [1. 使用arch引导盘](#1.使用arch引导盘)
    - [2. UEFI检查](#2.uefi检查)
    - [3. 联网](#3.-联网)
    - [4. 测试连通性](#4.-测试连通性)
    - [5. 同步系统时钟](#5.-同步系统时钟)
    - [6. 换国内源](#6.-换国内源（在国际互联网内可忽略）)
    - [7. 建立btrfs分区](#7.-建立btrfs分区)
    - [8. 挂载，请依序从根目录开始挂载](#8.-挂载，请依序从根目录开始挂载)
    - [9. 安装系统](#9.-安装系统)
    - [10. 生成fstab文件](#10.-生成fstab文件)
    - [11. 进入写好的新系统](#11.-进入写好的新系统)
    - [12. 设置主机名称与时区](#12.-设置主机名称与时区)
    - [13. 硬件时间设置](#13.-硬件时间设置)
    - [14. 设置区域](#14.-设置区域)
    - [15. 设置root密码](#15.-设置root密码)
    - [16. 安装微码](#16.-安装微码)
    - [17. 安装Grub引导](#17.-安装grub引导)
    - [18. 完成安装](#18.-完成安装)

# 准备工作

电脑，U盘（任何移动存储介质），网络，基本检索能力

1. 不论你采取何种镜像方案，即使是离线版镜像构建我也推荐你准备网络条件，这样可以确保内核和工具的更新，当然如果你足够熟练也可自行抉择

2. 如果是无线网络，请确保wifi名称是自己记得住的英文名，因为tty环境下是没有办法显示中文的，会变成一个个没办法识别的方块

3. 如果你希望在同一块硬盘上安装双系统，请为archlinux留下足够大小的硬盘空间，为了给自己留下安装其他软件的余地，请至少[准备100GB(貌似还没有补充相关教学，请自行搜索)](请补充磁盘分区教学)；并且确保EFI分区容量不小于256MB，或者[新增一个额外的挂载点](https://wiki.archlinux.org/title/EFI_system_partition)

4. 检查Win10分区是否启用Bitlocker加密，请提前获取恢复密钥，并且关闭电源计划中的快速启动！

> 在操作前请确保仔细阅读并对不太理解的检索学习，谨慎操作，及时备份，数据无价。

# 安装介质的构建

1. 仅推荐从[archlinux官方的镜像源](https://archlinux.org/download/)下载，请注意，arch是滚动发行版

2. 如果你要自行编译，请参考[“内核/传统编译”](https://wiki.archlinux.org/title/Kernel/Traditional_compilation)

3. 如果使用官方提供的安装镜像，我推荐你使用[ventory](https://www.ventoy.net/)烧录

# 基础安装

## 1.使用arch引导盘
> 关机，插入U盘后启动，进入bios选择从U盘启动，在第一个选项回车，以进入arch安装环境

## 2.UEFI检查

```bash
$ systemctl stop reflector.service
# 禁用自动更新软件源，因为地理上造成的特殊网络环境最好关掉
```

```bash
$ ls /sys/firmware/efi/efivars
# 若输出了一堆efi变量，则启动方式确实为UEFI模式，本帖发布的2025年绝大多数机器是UEFI引导的
```

## 3. 联网

> archlinux的安装必须要求网络环境，离线安装步骤则更为繁琐，可参考社区的[Offline installation](https://wiki.archlinux.org/title/Offline_installation)
  有线网络连接则按下不表，连上网线检查接口提示灯是否闪烁，等待几秒地址分配完成建立连接后即可联网
  当然在校园网环境下则需要上级路由完成认证，可以参考[nbtverify](https://github.com/nbtca/nbtverify)项目
  无线网络则调用iwctl进行连接

```bash
$ lspci -k | grep Network
# 检查无线网卡有没有干活，若明确无问题可以跳过检查
```
> 检查内核是否加载了无线网卡驱动

> 一般会显示形如: 00:14.3 Network controller: Intel Corporation Wi-Fi 6 AX201 (rev 20)

> 若没有执行检查无线连接是否被禁用(blocked: yes)

```bash
$ rfkill list 
# 无线网卡一般叫 wlan0
```

```bash
$ ip link set wlan0 up 
# 若有类似报错:Operation not possible due to RF-kill，则执行
$ rfkill unblock wifi
```
```bash
# 使用iwctl联网
iwctl # 进入交互式命令行
device list # 列出无线网卡设备名，比如无线网卡看到叫 wlan0
station wlan0 scan # 扫描网络
station wlan0 get-networks # 列出所有 wifi 网络
station wlan0 connect wifi-name # 进行连接，注意这里无法输入中文。回车后输入密码即可
exit # 连接成功后退出
```

## 4. 测试连通性
```bash
ping www.bilibili.com # 测试网络连通与否
```
> 若在网络配置上有一些意外情况，可以参见[网络配置/无线网络配置](https://wiki.archlinux.org/title/Network_configuration/Wireless)

## 5. 同步系统时钟
```bash
$ timedatectl set-ntp true # 将系统时间与网络时间进行同步
$ timedatectl status # 检查服务状态
```

## 6. 换国内源（在国际互联网内可忽略）
```bash
$ vim /etc/pacman.d/mirrorlist # 准备换源，若上级路由完成代理即可忽略
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch # 中国科学技术大学开源镜像站
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch # 清华大学开源软件镜像站
Server = https://repo.huaweicloud.com/archlinux/$repo/os/$arch # 华为开源镜像站
```

## 7. 建立btrfs分区
```bash
$ lsblk # 显示当前分区情况
```
- 请仔细检查自己要安装arch的目标硬盘名字
- sda,nvme分别是sata和nvme协议
- sata协议的硬盘排序为sda、sdb、sdc等，sda1、sda2为分区排序
- nvme协议的硬盘排序为nvme0n1、nvme1n1、nvme2n1等，nvme0n1p1、nvme0n1p2为分区排序
- 以sata硬盘为示范，具体硬盘自己更换指令！

```bash
$ cfdisk /dev/sdx # 对安装 archlinux 的磁盘分区
```
> 是不是进入了友好的TUI页面XD
- 因为已经预先留下了空间给arch，所以应该是有若干个G的FreeSpace
- 首先创建 Swap 分区。选中 Free space > 再选中操作 [New] > 然后按下回车 Enter 以新建 swap 分区（类似 Windows 的交换文件）
按下回车后会提示输入 分区大小，Swap 分区建议为电脑内存大小的 60%，或者和内存大小相等 > 然后按下回车 Enter
- 默认新建的类型是 Linux filesystem，我们需要将类型更改为 Linux swap。选中操作 [Type] > 然后按下回车 Enter > 通过方向键 ↑ 和 ↓ 选中 Linux swap > 最后按下回车 Enter
- 我们再只需要一个分区即可（因为使用 Btrfs 文件系统，所以根目录和用户主目录在一个分区上），所以类似的：选中 Free space > 再选中操作 [New] > 然后按下回车 Enter 以新建分区
输入 分区大小（默认是剩余的全部空间。请根据实际情况输入）> 然后按下回车 Enter
- 分区类型默认即可，无需更改。接下来选中操作 [Write] 并回车 Enter > 输入 yes 并回车 Enter 确认分区操作
要是没写入就是白忙活，所以确认[Write]了喔
```
☢️ 警告

再次提醒！请仔细检查命令和操作的正确性，否则将出现不可预料的情况。最危险的是可能造成数据丢失！
常见的错误包括不小心把 Windows 的分区删掉了 😥。
```

```bash
$ fdisk -l 
# 复查磁盘情况
```

```bash
$ mkfs.fat -F32 /dev/sdxn
# 格式化并创建 Btrfs 子卷
```
> 如果你是双系统那么无需格式化，因为linux可以共享Windows的EFI分区，参见[Dual boot with Windows](https://wiki.archlinux.org/title/Dual_boot_with_Windows),只需注意EFI分区大小是否足够你安装

```bash
$ mkswap /dev/sdxn
# 格式化 Swap 分区
```

```bash
$ mkfs.btrfs -L myArch /dev/sdxn
# 格式化 Btrfs 分区
```

```bash
$ mount -t btrfs -o compress=zstd /dev/sdxn /mnt
# 挂载分区以创建子卷
```

```bash
$ btrfs subvolume create /mnt/@ # 创建 / 目录子卷
$ btrfs subvolume create /mnt/@home # 创建 /home 目录子卷
# 创建Btrfs子卷
```

```bash
$ umount /mnt
# 卸载/mnt以挂载子卷
```

## 8. 挂载，请依序从根目录开始挂载

```bash
$ mount -t btrfs -o subvol=/@,compress=zstd /dev/sdxn /mnt # 挂载 / 目录
$ mkdir /mnt/home # 创建 /home 目录
$ mount -t btrfs -o subvol=/@home,compress=zstd /dev/sdxn /mnt/home # 挂载 /home 目录
$ mkdir -p /mnt/boot # 创建 /boot 目录
$ mount /dev/sdxn /mnt/boot # 挂载 /boot 目录
$ swapon /dev/sdxn # 挂载交换分区
```

```zsh
$ df -h # 检查挂载
$ free -h # 复查Swap分区挂载
```

## 9. 安装系统

```bash
$ pacstrap /mnt base base-devel linux linux-firmware btrfs-progs
# 如果使用btrfs文件系统，额外安装一个btrfs-progs包
```

```bash
$ pacman -S archlinux-keyring
# 如果提示 GPG 证书错误，可能是因为使用的不是最新的镜像文件，可以通过更新 archlinux-keyring 解决此问题
```

```zsh
$ pacstrap /mnt networkmanager vim sudo zsh zsh-completions
# 使用pacstrap脚本安装必要功能性软件
```

## 10. 生成fstab文件
> 生成fstab以定义磁盘分区，受当前挂载情况影响
```zsh
$ genfstab -U /mnt > /mnt/etc/fstab
```

## 11. 进入写好的新系统
```zsh
$ arch-chroot /mnt
# 代码高亮消失了？不要慌，说明你已经成功change root了
```

## 12. 设置主机名称与时区
```zsh
$ vim /etc/hostname
# 给电脑起个名字吧XD（不要包含特殊字符和空格，不然有坑的，并且不起主机名会有时候出奇怪问题，一些GUI程序莫名其妙死了，不论怎样还是起一个名字）
```

```zsh
$ vim /etc/hosts
# 编辑主机host
```

> 填入如下内容(其中myarch替换成你自己的主机名，中间间隙不是空格是tab对齐，强迫症狂喜XD)

```zsh
127.0.0.1   localhost
::1         localhost
127.0.1.1   myarch.localdomain  myarch
```

```zsh
$ ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 在上海时区创建符号链接
# 别问为什么是上海，因为没有北京XD，当然你也可以使用其他时区
```

```zsh
$ ls /usr/share/zoneinfo/
# 检查你要的时区，更换上条命令的地址
```

## 13. 硬件时间设置

```zsh
$ hwclock --systohc
# 系统时间同步到硬件时间
```

## 14. 设置区域
```zsh
$ vim /etc/locale.gen
# 编辑 /etc/locale.gen，去掉 en_US.UTF-8 UTF-8 以及 zh_CN.UTF-8 UTF-8 行前的注释符号（#）
# 这一步决定了软件使用的语言和字符集
```

```zsh
$ locale-gen
# 生成locale
```

```zsh
$ echo 'LANG=en_US.UTF-8' > /etc/locale.conf
# 注入locale.conf，不推荐任何中文locale，tty会乱码
```

## 15. 设置root密码
```zsh
$ passwd root
# 输入密码是隐式的，并不会显示，并非键盘坏了XD
```

## 16. 安装微码
```zsh
$ pacman -S intel-ucode # Intel
$ pacman -S amd-ucode #AMD
```

## 17. 安装Grub引导
```zsh
$ pacman -S grub efibootmgr os-prober
# grub是启动引导器，efibootmgr是被启动器用来向nvram写入启动项，os-prober用于引导win10
```

```zsh
$ grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH
# 安装grub到EFI分区
```

```zsh
$ vim /etc/default/grub
# 编辑启动参数
```

```zsh
# 修改"loglevel=3 quiet" 至 "loglevel=5 nowatchdog"
# 文件末尾新增一行：GRUB_DISABLE_OS_PROBER=false
```
- 去掉 GRUB_CMDLINE_LINUX_DEFAULT 一行中最后的 quiet 参数
- 把 loglevel 的数值从 3 改成 5。这样是为了后续如果出现系统错误，方便排错
- 加入 nowatchdog 参数，这可以显著提高开关机速度
- 加入os-prober参数，用于引导win10

```zsh
$ grub-mkconfig -o /boot/grub/grub.cfg
# 生成grub所需配置文件
```

> 若检查到win10，则会多出一行“Found Windows Boot Manager on /dev/nvme0n1p1@/EFI/Microsoft/Boot/bootmgfw.efi done”的回显，若win10在另一块硬盘则不会输出，进系统后重新挂载再跑一遍即可


> 此处的全部参数可参见[archwiki](https://wiki.archlinux.org/title/GRUB)

## 18. 完成安装
```zsh
$ exit # 退回安装环境
$ umount -R /mnt # 卸载新分区
$ reboot # 重启
```
> 重启后用root账户登录

```zsh
$ systemctl enable --now NetworkManager # 设置开机自启并立即启动 NetworkManager 服务
$ ping www.bilibili.com # 测试网络连接
```

> 如果是无线网的话
```zsh
$ nmcli dev wifi list # 显示附近的 Wi-Fi 网络
$ nmcli dev wifi connect "Wi-Fi名（SSID）" password "网络密码" # 连接指定的无线网络
```

```zsh
$ nmtui 
# 个人还是比较喜欢nmtui，比较友好XD
```

```zsh
$ pacman -S fastfetch
$ fastfetch
# 安装fastfetch，检查系统信息
# 喜闻乐见的neofetch时间XD
```

```zsh
$ shutdown 0
$ shutdown -h now
$ poweroff
# 上面三个命令都是关机，🤣记得关机，电源策略还没写呢
```

---

# 恭喜🎉
> 至此，你已经完成一个基础无图形界面的archlinux安装了

> 图形化安装应该会在下一次更新发布，不过还是那句老话：多看手册

> 本文抛砖引玉，希望能吸引更多同好前来计协蕉流♂



