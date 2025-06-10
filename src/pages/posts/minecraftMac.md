---
layout: "../../layouts/MarkdownPost.astro"
title: "在Apple Silicon Mac上使用Minecraft光影和模组"
pubDate: 2025-06-10
description: "🤪"
author:
  name: "小明"
  url: "https://m1ng.space/"
cover:
  url: "https://i.pinimg.com/736x/6f/00/d7/6f00d73e426549d0f5b1bb873bf2015f.jpg"
  alt: "cover"
tags: ["指南"]
---

# 简介

> 在本指南中，我们将向您展示如何使用Iris Shaders模组在Mac上为Minecraft添加光影和模组。这种方法可以增强Mac上Minecraft的视觉效果和游戏体验，包括使用Apple Silicon芯片的Mac。我们将介绍安装过程，确保您能获得视觉效果出众且运行流畅的Minecraft体验。无论您是刚接触模组和光影，还是想要升级您的Minecraft设置，这个简明的指南都能满足您的需求。
>
> **您需要的所有链接都在这里：**

- Minecraft Java: <https://www.minecraft.net/>
- Fabric: <https://fabricmc.net/use/installer/>
- Fabric API: <https://modrinth.com/mod/fabric-api/>
- Sodium: <https://modrinth.com/mod/sodium>
- Iris: <https://modrinth.com/mod/iris>

## 目录

## 1. 安装Fabric

第一步是安装Fabric加载器。前往 <https://fabricmc.net/use/installer/> 并点击Download installer (Universal/.JAR)下载fabric。

双击.jar包安装Fabric加载器。根据您的情况安装特定版本或最新版本。

## 2. 安装必要的模组

安装Fabric加载器后，打开Minecraft启动器。您会发现有一个fabri-loader-1.XX.
X，只需点击开始游戏下载一些必要的包。如果一切正确，您就会进入游戏。现在关闭游戏并前往**/Library/Application Support/minecraft**。您需要创建两个新文件夹，一个叫mods（在这里放模组）和一个叫shaderpacks（在这里放光影）。

现在您需要下载：

- Fabric API
  <https://modrinth.com/mod/fabric-api/>

> Fabric API是一个极简的Minecraft模组工具链，提供了一个灵活的框架来创建模组。以其快速更新和与新Minecraft版本的兼容性而闻名，它支持客户端和服务器端模组，使其成为模组社区中的热门选择。

- Sodium
  <https://modrinth.com/mod/sodium>

  > Sodium是一个Minecraft性能优化模组，可以显著提高游戏的帧率并减少延迟。它设计用于与Fabric模组加载器一起工作，专注于优化游戏的渲染引擎。通过重写游戏图形引擎的关键部分，Sodium提供了更流畅的游戏体验，特别是在低端硬件上。它以能够在不影响游戏视觉质量的情况下提升性能而备受好评，是希望改善Minecraft体验的玩家的热门选择。

- Iris
  <https://modrinth.com/mod/iris>
  Iris是一个用于在Fabric上使用光影的Minecraft模组，提供与Sodium的兼容性以增强性能和视觉效果。它简化了光影管理，允许高级照明和效果。
  将下载的文件放入`mods`文件夹。

```bash
➜  mods tree
.
├── fabric-api-0.102.0+1.21.jar
├── iris-fabric-1.8.8+mc1.21.1.jar
├── litematica-fabric-1.21-0.19.58.jar
├── malilib-fabric-1.21-0.21.8.jar
├── reeses-sodium-options-fabric-1.8.3+mc1.21.4.jar
├── sodium-extra-fabric-0.6.0+mc1.21.1.jar
└── sodium-fabric-0.6.13+mc1.21.1.jar

1 directory, 7 files
```
