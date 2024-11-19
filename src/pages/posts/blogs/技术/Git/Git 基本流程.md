---
layout: "../../../../../layouts/MarkdownPost.astro"
title: 'Git 基本流程'
pubDate: 2024-10-13
description: ' '
author: 'zzh0u'
tags: ["技术","开发","Git"]
theme: 'white'
featured: true
---

Git 是一个版本控制系统，帮助用户在项目中追踪文件修改，并在需要时能够还原到之前操作。本文介绍了 Git 的基本流程，包括初始化、添加、提交、推送、拉取等操作。

## 初始化

首先，需要在本地创建一个空文件夹，然后在该文件夹下执行 `git init` 命令，这将创建一个 `.git` 目录，里面包含了 Git 的所有配置信息。然后通过 `touch` 命令新建一个`.txt`文件，并在文件中输入任意内容：

```bash
McDonald's
Hamburger
Coke
```

## 第一次 commit

在 `.txt` 文件中输入内容后，可以执行 `git status` 命令查看当前文件状态：

```bash
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	text.txt

nothing added to commit but untracked files present (use "git add" to track)
```

可以看到，文件处于未跟踪状态（Untracked）。这里引出 `Git` 中文件的第一种状态：**未跟踪状态（Untracked）**。需要执行 `git add` 命令将文件添加到暂存区。执行 `git add text.txt` 命令后，再次执行 `git status` 命令,可以看到：

```bash
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   text.txt
```

可以看到，文件已被添加到暂存区，等待提交。这里引出第二种状态：**暂存状态（Staged）**。暂存区（Stage）是 Git 用来暂存文件的地方。现在我们需要执行 `git commit -m "first commit"` 命令提交文件，`-m` 参数后面是提交信息。也可以不加参数，直接执行 `git commit` 命令，这时会打开默认编辑器，输入提交信息。这个时候再次执行 `git status` 命令，可以看到：

```bash
On branch main
nothing to commit, working tree clean
```

可以看到，暂存区已经清空，工作区也没有未提交的修改。这个时候，所有的文件都属于第三种状态：**已提交状态（Committed）**。至此，第一次 `commit` 圆满完成。

## 你可以吃后悔药

首先，我们现在自己的仓库多提交了几次 `commit` 之后，内容如下：

```bash
McDonald's
Hamburger
Coke
fries
Chicken Nuggets
```

这个时候再次执行 `git status` 命令，可以看到：
```bash
commit b3e4e008af045743defb01ca55b2ddd47c6926e4 (HEAD -> main)
Author: zzh0u <weirong.zhou@outlook.com>
Date:   Sun Oct 13 09:44:57 2024 +0800

    third commit

commit 5c644068ce2184f5b4627aecd77462411355ec4e
Author: zzh0u <weirong.zhou@outlook.com>
Date:   Sun Oct 13 09:43:04 2024 +0800

    second commit

commit 6ccffbb33c7574c27f9a34b1812a5fef1af08696
Author: zzh0u <weirong.zhou@outlook.com>
Date:   Sun Oct 13 09:32:00 2024 +0800

    first commit
```

可以看到，当前仓库有三个 `commit`，当然，如果你觉得输出太多，眼花缭乱，可以加上 `--oneline` 参数，输出简洁版：

```bash
b3e4e00 (HEAD -> main) third commit
5c64406 second commit
6ccffbb first commit
```

oops! 突然我又没那么想吃鸡块了，想回到上一次提交，怎么办？要回到第二个 commit，你可以运行 git reset 命令，后面跟上 commit 的 ID，即 `git reset 5c64406`，注意这里是**第二次**提交的 ID。做完这一步，你可能会满心欢喜的打开文本文档，但很抱歉，这个时候文件还是原来的样子，一如刚提交完第三次 `commit` 时候的样子，你满心疑惑，这到底是怎么回事？于是你又执行 `git status`:
```bash
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   text.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

这时候你注意到终端的 `Git` 提示你现在的状态是 `not staged`，这就引出了第四种状态：**未暂存状态（Unstaged）**。但是别急，不信你试试 `git log --oneline` 命令，第三次提交不会出现在提交日志中：
```bash
5c64406 (HEAD -> main) second commit
6ccffbb first commit
```
我们已经成功回到的之前的 `commit` 了。如果你想撤销一个 commit，**并撤销该提交之后的所有修改**，你可以在 git reset 命令中加上 --hard 标志。让我们测试一下这个方法，回到第一个 commit，执行 `git reset 6ccffbb --hard`，这就会回到第一次修改的样子：
```bash
McDonald's
Hamburger
Coke
```

我们又回到了指定提交时的文件初始状态。所有在那次 `commit` 之后对文件所做的修改都被删除。当我们检查提交日志时，我们将只看到第一次 `commit`。

## 另类的后悔药

我已经重新回到了刚提交过三次 `commit` 后的状态：

```bash
d3b86b2 (HEAD -> main) third commit
5aac07d second commit
6ccffbb first commit
```

这次我们试试另外一个命令 `git revert`，同时输入当前提交的 ID。在我的例子中，我们使用最新的那个 `commit` 的 ID：

```bash
git revert d3b86b2
```

这个命令会撤销指定提交，同时还会创建一个新的提交，记录撤销操作。执行完这个命令后，我们再次查看提交日志：

```bash
ddc8aa6 (HEAD -> main) Revert "third commit"
d3b86b2 third commit
5aac07d second commit
6ccffbb first commit
```

可以看到，新的提交记录了**撤销操作**，同时**保留**了之前的提交记录。这就是 `git revert` 命令的作用。

想必聪明的读者看到这里已经懂了，`git reset` 会直接回到某个 `commit` 的状态，并且直接删除之后的所有提交记录；而 `git revert` 则会创建一个新的提交，保留之前的提交记录，并记录撤销操作。不过虽然 `git revert` 很方便，但是也要注意不要滥用，它会引入新的提交记录，在团队合作中可能会造成混乱。

## Ps

1. 推荐阅读：[freeCodeCamp](https://www.freecodecamp.org/chinese/news/git-reverting-to-previous-commit-how-to-revert-to-last-commit/)
2. 大家可以试试 `git reset --soft` 命令，看看它是怎么回事。
3. 我刚想到一个骚操作，就是 `revert` 我上一次的 `revert`，什么俄罗斯套娃哈哈哈。
4. 远程仓库的操作，先挖坑吧，以后有时间再写:-）
5. 硬重置后的恢复，又挖一个坑orz
