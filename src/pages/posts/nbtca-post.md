---
layout: "../../layouts/MarkdownPost.astro"
title: "NBTCA主页投稿指南1.0"
pubDate: 2025-10-10
description: "在开源项目中发布你的第一篇博客"
author: "小明"
cover:
  url: "https://oss.nbtca.space/CA-logo.svg"
  alt: "cover"
tags: ["指南", "git", "markdown"]
---

<!-- markdownlint-disable-next-line MD022 -->
##
> 学会使用 Git + Markdown 撰写与提交技术博客

## 一、前言

欢迎加入计算机协会 🎉！  
本指南将教你如何用最主流的开源协作方式——**Git + Markdown + Pull Request**，来撰写并发布你的第一篇博客。

目标是：

> 让每位新社员都能独立完成一篇博客投稿流程。

---

## 二、准备工作

### 1. 安装 Git

#### Windows

前往 [https://git-scm.com/downloads](https://git-scm.com/downloads) 下载并安装，保持默认选项即可。

#### macOS

```bash
xcode-select --install
```

#### Linux（例如 Ubuntu / Arch）

```bash
sudo apt install git
# 或
sudo pacman -S git
```

---

### 2. 注册 GitHub 账号

访问 [https://github.com](https://github.com)，注册并登录，设置一个好记的用户名（建议用英文名或学号）。

---

### 3. 基础配置

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

---

## 三、Fork 与 Clone 协会博客仓库

### 1. Fork

1. 打开协会博客仓库（例如）：  
   👉 [https://github.com/nbtca/home](https://github.com/nbtca/home)
2. 点击右上角的 **Fork** 按钮。

### 2. Clone

```bash
git clone https://github.com/你的用户名/blog.git
cd blog
```

---

## 四、创建分支

```bash
git checkout -b add-my-first-blog
```

---

## 五、撰写博客（Markdown 格式）

### 1. 新建文件

在 `src/pages/posts/` 文件夹中新建：

```
posts/my-first-blog.md
```

### 2. 文件模板

```markdown
---
layout: "../../layouts/MarkdownPost.astro"
title: "题目"
pubDate: 2025-10-10
description: "描述"
author: "张三"
cover:
  url: "封面地址"
  alt: "cover"
tags: ["标签", "可多个"]
---

# Git 与 Markdown 入门指南

大家好，我是计算机协会新社员张三。

本文将介绍如何使用 Git 与 Markdown 撰写并提交博客。

## 一、Git 是什么？

Git 是一个分布式版本控制系统，用于多人协作开发。

## 二、Markdown 是什么？

Markdown 是一种轻量级标记语言，用简单的符号来排版文字。

- **加粗**：`**加粗**`
- _斜体_：`*斜体*`
- 链接：[协会官网](https://example.com)

## 三、总结

学会使用 Git + Markdown，你就能参与到开源协作中了！
```

---

## 六、提交与推送

```bash
git add posts/2025-10-09-my-first-blog.md
git commit -m "Add my first blog: Git 与 Markdown 入门"
git push origin add-my-first-blog
```

---

## 七、创建 Pull Request（PR）

1. 打开你的 GitHub 仓库。
2. 点击 “**Compare & pull request**”。
3. 填写标题与说明（例如 “新增一篇关于 Git 的博客”）。
4. 目标仓库选择 `nbtca/home`。
5. 提交 Pull Request。

---

## 八、常见问题

| 问题                | 解决方案                                               |
| ------------------- | ------------------------------------------------------ |
| push 时提示拒绝访问 | 检查是否使用 HTTPS 地址，并确认你已登录 GitHub。       |
| 提交重复文件或出错  | 使用 `git status` 查看状态，`git reset` 撤销错误提交。 |
| PR 没被合并         | 可能格式不规范，等待管理员审核反馈。                   |

---

## 九、推荐工具

- 编辑器：**VS Code**、**Neovim**、**Typora**
- Markdown 预览插件：_Markdown Preview Enhanced_
- Git 图形界面工具：_GitHub Desktop_、_Sourcetree_

---

## 十、结语

当你第一次成功合并 PR 时：

> 🎉 你正式成为开源协作的一员！
