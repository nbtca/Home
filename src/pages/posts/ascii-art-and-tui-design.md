---
layout: "../../layouts/MarkdownPost.astro"
title: "字符的形状，终端的秩序：ASCII 艺术与 TUI 设计调研"
pubDate: 2026-10-24
description: "从 1898 年的打字机蝴蝶、Rogue 的 @、BBS 字标到今天的 fzf 与 btop，看字符怎样成为图像，又怎样组成界面，再把 NBTCA Prompt 放进真实终端里逐页检查。"
author:
  name: "NBTCA"
  url: "https://github.com/nbtca"
cover:
  url: "https://nbtca.space/images/posts/ascii-art-and-tui-design/cover.webp"
  alt: "深色背景中央，由上千个小字符按明暗拼成的 @ 符号"
tags: ["设计", "ASCII", "TUI", "Prompt"]
---

[NBTCA Prompt](https://github.com/nbtca/Prompt) 是社团写的命令行工具，在终端里输入 `nbtca`，就能看到课表、校历、活动和知识库。它启动时会先画一个用 Braille 点阵拼成的社团会徽。终端不支持 Unicode 时，程序曾经改读一个叫 `ascii-logo.txt` 的文件。有一天我们打开这个文件，发现里面装的还是 Braille 字符，于是在只支持 ASCII 的终端上，用户看到的会徽是一片乱码。

要修它，得先弄明白几件事：一个字符在终端里占多大地方，同一段字符画为什么换个字体就散架，别的 TUI 程序怎样在 80 列里放下那么多信息。我们从一百多年前的打字机艺术看到今天的 btop 和 fzf，又把 Prompt 放进伪终端，一页一页地检查。

这次调研的结果直接进了 Prompt：乱码修好了，空白的页面里多了几幅用字符画成的图，窗口太小时丢什么、留什么也重新定过。下面是调研的笔记，也是我们对 ASCII art 的一点整理，希望能引出更多讨论。资料查阅截至 2026 年 10 月 24 日，Prompt 的截图摄于 10 月 30 日，版本是 v1.5.23。

## 一、一个单元格

终端屏幕是一张网格，经典尺寸是 80 列、24 行，每个格子放一个字符。先看其中一个格子。

![一张 Rogue 式小地图中玩家 @ 所在的单元格，以及画出它所需的四段字节。|inline](/images/posts/ascii-art-and-tui-design/cell-anatomy.webp)

高亮的格子在第 2 行第 4 列，里面是黄色加粗的 `@`，背景是紫色。程序要画出它，会向终端依次发送四段字节：

```text
ESC[2;4H       把光标移到第 2 行第 4 列
ESC[1;33;45m   粗体、黄字、紫底
@              字符本身
ESC[0m         恢复默认样式
```

以 ESC 开头的那几段，终端会执行，但不会显示出来。它们的格式由 [ECMA-48](https://ecma-international.org/publications-and-standards/standards/ecma-48/) 规定，大家习惯叫它 ANSI 转义序列。至于 `@` 代表玩家，那是游戏自己的规则，终端并不知道。

先分清三个常被混用的词。ASCII 是一套字符编码，[RFC 20](https://www.rfc-editor.org/rfc/rfc20) 记录的 ASCII 有 128 个码位，其中从空格到波浪号的 95 个可以打印出来，严格意义上的 ASCII art 只用这 95 个字符。ANSI art 是 BBS 时代的叫法，指用上面那种转义序列加上 IBM PC 字符集里的方块字符画出的彩色画面。TUI 则是 Text User Interface，说的是交互方式，一个只靠反显标出选中行的文件选择器也算 TUI。

Anders Carlsson 在 [Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/) 里指出，这些按编码起的名字说明不了作品长什么样。同样是 ASCII 字符，Amiga 字体里的斜线能首尾相连，DOS 字体里却留着缝隙，两边的风格就这样分开了。后文沿用这些常见叫法，遇到字体影响大的作品再单独说明。

还有一种情况容易混淆：Kitty graphics、Sixel 等协议能让终端直接显示位图，[Yazi 的文档](https://yazi-rs.github.io/docs/image-preview/)列出了各终端的支持情况。网上很多漂亮的终端截图，里面其实混着真正的图片。

## 二、在屏幕出现之前

### 打字机

用字符画画，比计算机早得多。Isaac Pitman 1893 年出版的打字教材 [*A Manual of the Typewriter*](https://books.google.com/books/about/A_Manual_of_the_Typewriter.html?id=xadbAAAAQAAJ)，1897 年再版时改名 *Pitman's Typewriter Manual*，见 [Sue Walker 对早期打字手册的研究](https://centaur.reading.ac.uk/69514/)。[Heikki Lotvonen](https://blog.glyphdrawing.club/amiga-ascii-art/) 提到书里的打字机图案，认为它们比下面这只蝴蝶更接近今天的 ASCII 艺术。

蝴蝶出自一位叫 Flora Stacey 的秘书之手，刊登在 1898 年 10 月 15 日的 *The Phonetic Journal* 上。据 Lotvonen，她把同一张纸以不同的角度反复放回打字机，把字母叠在一起来成形，所以整幅画更像铅笔画，不像由字符拼成的马赛克。

![1898 年 10 月 15 日 The Phonetic Journal 第 662 页，刊登 Flora Stacey 的蝴蝶。四周的边框由反复打出的字符组合构成。|inline](/images/posts/ascii-art-and-tui-design/stacey-butterfly-1898.webp)

来源：[oz.Typewriter](https://oztypewriter.blogspot.com/2020/02/flora-fanny-stacey-1845-1909-worlds.html) 对 Stacey 生平的考证。原刊出版于 1898 年，在美国已进入公有领域。更多早期作品见 [The Marginalian 对 Barrie Tullett 著作的介绍](https://www.themarginalian.org/2014/05/23/typewriter-art-laurence-king/)。

蝴蝶四周的边框，单独看只是字母和横线，排在一起成了花纹。

1919 年 6 月，*Photoplay* 杂志登了一幅 Kenneth Taylor 用打字机打出来的卓别林像。

![Kenneth Taylor 的打字机肖像，刊于 1919 年 6 月的 Photoplay。头发和胡子用密集字符，脸部只用稀疏的点。|inline](/images/posts/ascii-art-and-tui-design/typewriter-chaplin-1919.webp)

来源：Kenneth Taylor，*Photoplay* 1919 年 6 月，经 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Typewritten_portrait_of_Charlie_Chaplin.jpg)。在美国属于公有领域。

凑近看是一排排字母，退后几步才是一张脸。蝴蝶的边框用的是字符的形状，卓别林像用的是字符的深浅。这两种用法到今天还是字符画的两条主要路线，第四节我们会实际测一测。

### Bell Labs 的恶作剧

1960 年代中期，Bell Labs 的 Leon Harmon 想趁上司 Ed David 出差搞个恶作剧，找 Ken Knowlton 帮忙。他们扫描了编舞家 Deborah Hay 的一张照片，把灰度换成符号，印成一幅 12 英尺宽的裸体像，挂在 David 的办公室墙上。符号取自晶体管、电阻之类的电子元件。年份各处的记录不一，有 1966 年，也有 1967 年。

据 Knowlton 的[回忆](https://www.kenknowlton.com/pages/04portrait.htm)，这幅画只挂了一天，就因为被认为不适合挂在实验室里而摘了下来。后来它登上了 1967 年 10 月 11 日的《纽约时报》，题为 *Studies in Perception I*，又在 1968 年纽约 MoMA 的 *The Machine as Seen at the End of the Mechanical Age* 展上展出，见 [V&A 的藏品记录](https://collections.vam.ac.uk/item/O1488651/studies-in-perception-i-screenprint-ken-knowlton/)。

它用的是自制符号，不算严格意义上的 ASCII 字符画。但它让计算机接手了卓别林像那种按明暗挑字符的工作。

### VT100 与 Rogue

电传打字机只能一行接一行往下打印，没法回头修改。后来的视频终端能把光标移到屏幕上任意位置，但各家厂商的指令并不统一。DEC 自己的 VT52 要移动光标，得发送 `ESC Y` 再加两个代表行和列的字符，[维修手册](https://vt100.net/docs/vt52-mm/chapter2.html)里就有这样的测试步骤。

1978 年 8 月，DEC 推出了 VT100。据 [DEC 的年表](https://www.vt100.net/timeline/1978.html)，这是它第一台符合 ANSI 标准的视频终端。[VT100 的用户手册](https://vt100.net/docs/vt100-ug/chapter1.html)写明，它在 ANSI 模式下按 X3.64-1977 标准收发控制序列，同时保留了兼容旧软件的 VT52 模式。移动光标的序列叫 CUP，写成 `ESC[行;列H`，见[手册第三章](https://vt100.net/docs/vt100-ug/chapter3.html)。今天的 xterm 等终端模拟器仍以 VT100 及其后继型号为参照，见 [xterm 的控制序列文档](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)。

![DEC VT100 终端，摄于 Living Computer Museum。](/images/posts/ascii-art-and-tui-design/vt100.webp)

来源：Jason Scott 摄，经 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:DEC_VT100_terminal.jpg)，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。

光标能自由移动以后，屏幕就能当成一张地图来用。几年后，Michael Toy 和 Glenn Wichman 开始写 Rogue，他们起初在加州大学圣克鲁兹分校，后来 Toy 转到了伯克利。Wichman 在 [A Brief History of Rogue](https://www.wichman.org/roguehistory.html) 里回忆，正是 Ken Arnold 写的 curses 库让他们能把字符放到屏幕的指定位置，才有了屏幕上的地下城。后来 Rogue 随 4.2BSD 发行，传遍了各地大学的机房。

![BSD 版 Rogue。横线和竖线围出房间，# 是走廊，+ 是门，@ 是玩家，最下面一行是状态栏。|inline](/images/posts/ascii-art-and-tui-design/rogue-bsd.webp)

来源：Thedarkb，经 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Rogue_Screenshot.png)，[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。

在纯文字的冒险游戏里，要用一段话描述“你的东边有一扇门”。在 Rogue 里，`+` 就待在房间墙上，玩家一眼就能看到。代价是每个符号都得有固定的含义，玩家得去查。[NetHack 的 Guidebook](https://www.nethack.org/v367/Guidebook.html) 到今天还在逐个解释这些符号。

### :-)

1982 年 9 月 19 日上午 11 点 44 分，Scott Fahlman 在 CMU 的电子布告栏上提议，用 `:-)` 标记玩笑话，并补了一句“侧着看”。这条消息一度失传，2002 年才有人从备份磁带里把它[找了回来](https://www.cs.cmu.edu/~sef/Orig-Smiley.htm)。

它没有画任何东西，只是告诉读者这句话是玩笑。

### BBS

1978 年 1 月 16 日，Ward Christensen 想到一个主意，和 Randy Suess 商量：让电脑俱乐部的会员用调制解调器拨进一台电脑，互相留言。他们在 30 天后的 2 月 16 日让系统上了线，后来在 [1978 年 11 月的 BYTE 杂志](https://archive.org/details/byte-magazine-1978-11)第 150 页写文章介绍了它。这个叫 CBBS 的系统，被 [Lotvonen](https://blog.glyphdrawing.club/amiga-ascii-art/) 等人称为世界上第一个 BBS。

接下来二十年，人们拨号进入各种 BBS，最先看到的就是用字符画的欢迎画面。据 [scene.org 保存的一篇 1998 年的文章](https://archive.scene.org/pub/mirrors/artpacks/www/mirrors/acheron/articles/ar-history.shtml)，1990 年代初，ANSI 艺术家们开始组成团体，每月把成员的作品打包发布，叫作 art pack。最早的大型团体是 Aces of ANSI Art，随后有了 ACiD、iCE 等一大批。[Sixteen Colors](https://16colo.rs/) 今天还保存着大量原始文件，想看团体自己的记录，可以翻翻 [SAC 的档案](https://www.roysac.com/sac.html)。

BBS 的字符画大多是有用途的：欢迎画面介绍站点，菜单告诉你按什么键，文件列表里还有小字标。上传文件附带的说明文件 FILE_ID.DIZ [通常不超过 10 行、每行 45 个字符](https://blog.glyphdrawing.club/amiga-ascii-art/)，艺术家要在这么小的地方把团体的名字画得认得出来。

## 三、几件作品

下面这些作品，建议都打开原作看。先看整体，再放大看字符。

### Joan Stark 的旋转木马

Joan G. Stark 常以 `jgs` 署名。她的[作品集](https://oldcompcz.github.io/jgs/joan_stark/indexanimals.html)按动物、人物、节庆分类，站上说几乎所有的画都出自她一个人之手。

![左侧是 Joan Stark 的旋转木马，右侧是 Stylez 的透视字标。|inline](/images/posts/ascii-art-and-tui-design/ascii-comparison.webp)

来源：Anders Carlsson，[Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)，图 1。左为 Joan Stark（1998，Usenet 风格），右为 Stylez（1995，scene 风格）。

左边的旋转木马，能认出它靠的是外轮廓、头的朝向、腿的姿势和穿过身体的立柱。

### Amiga 的斜线

右边是 Stylez 的字标，字母被拉进了透视里，大块的内部空白和黑底一起撑起了体积。

这种画法离不开 Amiga 的默认字体 Topaz。Heikki Lotvonen 在 [Amiga ASCII art](https://blog.glyphdrawing.club/amiga-ascii-art/) 里解释了原因：Topaz 的字距和行距都很窄，下划线后面紧跟一条斜线，看起来就是连着的；上下两行的斜线也能接成一条长线，所以许多 Amiga 字标看起来是斜体。同一篇文章还收了芬兰艺术家 Antti “h7” Kiuru 的 *Jungle Fever*。

![h7 的 Jungle Fever 标题图版，以斜线字标、细长竖线和大面积留白组织阅读节奏。|inline](/images/posts/ascii-art-and-tui-design/amiga-jungle-fever.webp)

来源：Heikki Lotvonen，[Amiga ASCII art](https://blog.glyphdrawing.club/amiga-ascii-art/)，图 15。

这张图远看是一个大字标，近看是一列细竖线串起的短句，中间大片留白。这类字标靠空白分开字母，想把它压窄，只删空格是不行的，字母会粘成一团。

### Roy 的小画布

Roy 是 SAC 的组织者，SAC 成立于 1994 年 12 月，[官网](https://www.roysac.com/sac.html)有它的历史。[SAC 字标图集](https://www.roysac.com/sac_asciis.html)收了大量用在 NFO 和 FILE_ID.DIZ 里的小字标。Roy 写过一篇 [Width Restrictions & Challenges](https://www.roysac.com/tutorial/roy-ascii-widthandtips.html)，讲怎样在有限的宽度里画字标，其中一条建议是：在字标下面用普通文字再写一遍名字。他的理由有两个，一是不是每个人都读得懂艺术字，二是搜索引擎只认普通文字。

Prompt 也是这么做的：启动画面画会徽，进入程序后，大多数页面的左上角都写着普通文字的 `nbtca`。

### ACiD 与 Blocktronics

[ECMA-48](https://ecma-international.org/wp-content/uploads/ECMA-48_5th_edition_june_1991.pdf) 第 8.3.117 节的 SGR 只定义了 8 种前景色和 8 种背景色，参数 30 到 37 和 40 到 47。PC 上把“加粗”显示成高亮，前景色就多出 8 种，所以 ANSI art 一般有 [16 种前景色和 8 种背景色](https://blog.glyphdrawing.club/amiga-ascii-art/)。打开 [ACiD 100 的作品包](https://16colo.rs/pack/acid-100/)，再翻翻 [Blocktronics 的档案](https://16colo.rs/group/blocktronics)，能看到艺术家们在同样的限制下画出了多么不同的东西。

其中一件是 ungenannt 的 [ungenannt_1453.ans](https://16colo.rs/pack/blocktronics_blocktober/ungenannt_1453.ans)，收录在 2016 年的 *blocktronics_blocktober* 包里。画的是 1453 年的君士坦丁堡之围，顶端是大字的“1453”，往下依次是 Mehmet II、城墙、攻城的士兵和 Constantine XI。这是一幅 640 × 9904 像素的长卷，要在档案站上一路滚动着看。整幅画只用了红、黑、灰、白四种颜色，大块的明暗反复出现，把很多细节连成了一个整体。

### 东亚的两个传统

日本的 AA（在西方常叫 Shift-JIS art）用日文字符和 MS PGothic 这样的可变宽度字体，Carlsson 说它的字符集更大，所以能画得比西方的 ASCII 更细。Carlsson 的文章里收了 Illiorzilli 在 2013 年画的一个机器人。这类作品是为比例字体排的，换成等宽字体，对齐就会乱。

台湾的 PTT 是另一个传统。

![上方是 PTT 的登录画面，下方是一幅人物群像。](/images/posts/ascii-art-and-tui-design/ptt-ansi.webp)

来源：Anders Carlsson，[Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)，图 5。上为登录画面，作者 jacky90527，Carlsson 未标注日期；下为 else 的作品（2013）。

Carlsson 注意到，PTT 用的中文字符集里方块字符比西方的多得多，那里的艺术家更喜欢用整块的几何色面，很少用明暗渐变的字符。登录画面里是红色的落日、几棵棕榈树的剪影和几条水平色带，一句中文诗竖排在右上角。下方的群像靠清楚的色块边界，让好几个人物同时站得住。

这是我们找到的离 Prompt 最近的传统：中文、终端、色块。不过这些作品是为当年的 BBS 客户端画的，放到今天的 Unicode 终端里，方块字符的宽度未必还一样，我们没有逐个验证。

### Raquel Meyers 的 PETSCII

PETSCII 是 Commodore 机器上的字符集。Raquel Meyers 的[作品列表](https://www.raquelmeyers.com/selected/)里既有 PETSCII，也有 Teletext，还有展览和工作坊。

![Raquel Meyers 的 PETSCII 作品，以白、浅蓝和棕色几何单元形成对称结构。|inline](/images/posts/ascii-art-and-tui-design/raquel-meyers-petscii.webp)

来源：Anders Carlsson，[Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)，图 6，2015 年作品。更多 Teletext 作品见 [Teletext Art 的艺术家页面](https://teletextart.co.uk/artists/raquel-meyers)。

画面里的东西不多，就是几种阶梯、斜线和小方块，换着方向和颜色反复出现。

### FIGlet

[FIGlet](https://www.figlet.org/) 是 Glenn Chappell 和 Ian Chai 写的小工具，能把一行文字排成大字。名字来自“Frank, Ian and Glenn's letters”，[手册页](https://github.com/cmatsuoka/figlet/blob/master/figlet.6)上最早的版权年份是 1991 年。我们用它试了几种字体：

![用 FIGlet 的 Standard、Slant、Small Slant 和 Doom 四种字体排出 nbtca。](/images/posts/ascii-art-and-tui-design/figlet-fonts.webp)

Slant 的斜线写法和 Amiga 字标很像。对 Prompt 这样名字固定的程序，没必要在运行时调用 FIGlet，挑好的字标存成文本文件随程序发布就够了。

## 四、字符的几何

### 哪个字符最黑

卓别林像按深浅挑字符，那么，哪个字符最“黑”？

网上流传着不少密度序列，比如 ` .:-=+*#%@`，但没说是在哪种字体下测的。我们干脆自己测：在浏览器里用 JetBrains Mono 逐个渲染 95 个可打印字符，数每个字符占了单元格多少面积。

![上方是 JetBrains Mono 中 13 个字符的实测墨量。下方左侧是明暗式，按亮度为球体逐格挑选字符；右侧是轮廓式，用字符的线条勾出同一个球。](/images/posts/ascii-art-and-tui-design/shape-tone-structure.webp)

最黑的是 `@`，也只盖住了单元格的 29.8%。`#` 是 22%，`.` 只有 3.1%。换一种字体，排名多半会变，我们只测了这一种。

图中左边的球，就是按测出来的墨量，逐格给每个位置挑了一个字符。右边的球是手画的，只用字符的线条去贴合轮廓。Xu、Zhang 与 Wong 在 SIGGRAPH 2010 的论文 [Structure-based ASCII Art](https://ttwong12.github.io/papers/asciiart/asciiart.html) 里，把这两种做法分别叫作 tone-based 和 structure-based。他们指出，前者要很多字符才有层次，后者直到论文发表时还主要靠手画，因为要用很少的几种字符形状去贴合任意曲线，太难自动完成。

### 格子是窄长的

终端的格子不是正方形。等宽字体的字宽一般约为 0.6 em，终端的行高多在 1.2 到 1.4 em 之间，所以一个格子大约宽 1、高 2。

![8 × 8 与 16 × 8 个字符组成的方块，以及单个单元格的比例。](/images/posts/ascii-art-and-tui-design/cell-aspect.webp)

8 列 × 8 行的字符拼出来是竖长条，要 16 列才接近正方形。把一张照片按字符数等比缩小，结果总是又高又瘦。

行高的影响更隐蔽。文本文件里只存了字符和换行，字体和行高都由看的人的终端决定：

![同一个 FIGlet 字标在行高 1.0 与 1.6 下的样子。](/images/posts/ascii-art-and-tui-design/line-height.webp)

我们自己就踩过这个坑。写这篇文章时，博客上的代码块继承了正文 1.7 倍的行高，一个三行的 NBTCA 字标被拉得斜线全断了。查下去发现，是博客的 Markdown 插件把代码块原有的样式类覆盖掉了，修好以后行高回到 1.35，斜线才重新接上。

### 把格子再切小

想画得更细，可以把一个格子再切开。Unicode 有半格和四分格的方块字符，还有 [Braille 点字](https://www.unicode.org/charts/PDF/U2800.pdf)：每个字符是 2 列 × 4 行共 8 个点，256 种组合，从 U+2800 到 U+28FF。

![把一个单元格分成 1 × 1、1 × 2、2 × 2 和 2 × 4 块，分别对应整格、半格、四分格和 Braille，下方是各自画出的同一条正弦曲线。](/images/posts/ascii-art-and-tui-design/subcell.webp)

Braille 的编码很规整。八个点各有一个权重，从 1、2、4 一直到 128，亮起的点的权重加起来，再加上 U+2800，就是要输出的字符。图里那个例子亮了权重为 1、4、64、128 的四个点，加起来是 197，所以是 U+28C5，也就是 `⣅`。程序不用查表，直接算就行。btop 的曲线和 Prompt 的会徽都是这么画出来的。

点越多，曲线越平滑，但每个点之间都有空隙，看起来也越稀疏。

### 空白和颜色

字符界面没有别的分组手段时，空行和缩进就是排版：课程名、时间和教室连着写三行，会被读成一组，下一门课之前空一行，就分开了。

颜色能表达的东西很多：品牌、选中项、状态。但总有人的终端关了颜色，或者分不清某些颜色。[NO_COLOR](https://no-color.org/) 是一个简单的约定：只要设置了这个环境变量，程序就不该输出颜色。Prompt 的做法是让选中项除了变色还有箭头，“没有安排”和“还没加载”也用不同的符号，第七节会看到。

## 五、别人的 TUI

我们挑了几个口碑不错的终端程序，看它们怎样回答同样几个问题：我在哪一页，选中了什么，数据是不是最新的，下一步能按什么。

Midnight Commander 是 Miguel de Icaza 发起的双栏文件管理器，[项目 FAQ](https://github.com/MidnightCommander/mc/blob/master/doc/FAQ) 列出的早期合作者是从 1994 年下半年起陆续加入的。它最显眼的是底部那行功能键：

![Midnight Commander 官方截图，展示双栏文件列表、打开的 File 菜单和底部功能键提示。](/images/posts/ascii-art-and-tui-design/midnight-commander.webp)

来源：[Midnight Commander 官网](https://midnight-commander.org/)的截图。

F1 到 F10 一直写在屏幕最下面，不用翻手册就能知道每个键干什么。

btop 则把比例条、曲线和精确数值放在一起：

![btop 官方截图，以固定区域显示 CPU、内存、磁盘、网络和进程信息，图形与精确数值并列。](/images/posts/ascii-art-and-tui-design/btop.webp)

来源：[btop 官方仓库](https://github.com/aristocratos/btop#screenshots)的截图。

条形让你一眼看出 CPU 忙不忙，旁边的数字告诉你具体是多少。

fzf 每输入一个字符就重新过滤一次候选项，[预览窗口](https://github.com/junegunn/fzf#preview-window)跟着当前选中项变化。Helix 按下 `space` 或 `g` 这样的前缀键后，会弹出一个小框，列出接下来能按的键，由[配置项 `auto-info`](https://docs.helix-editor.com/editor.html) 控制，默认开启。K9s 在画面顶部固定显示当前连接的集群，你不用记自己在看哪个。

## 六、把 Prompt 跑起来

轮到 Prompt，我们没有看设计稿，直接看它跑起来的样子。

一开始我们用 vhs 录屏，结果被骗了一次：按下 `2` 切到课表页，截图里高亮的却是活动页。我们以为找到了一个 bug，做对照实验才发现，vhs 在隐藏和显示画面之间切换后，截图的帧顺序会乱。后来我们改用 Python 的 `pty` 模块在伪终端里启动 Prompt，用 `pyte` 这个终端模拟库解析它的输出，等画面上出现预期的文字再截图，最后按每个字符的真实宽度和颜色转成图片。下面的截图都是这样得到的。

第一轮我们测的是 v1.5.22，找出了四个问题，记在 nbtca/Prompt 的 #93 到 #96。这些问题后来都改掉了，下面的描述以 [v1.5.23 的提交 1567a2b](https://github.com/nbtca/Prompt/tree/1567a2b826e64909d372ff10a2cd9a59ea8e36cc)为准，截图也基本重拍过。用的是全新的配置目录，没有登录统一认证，活动和文档都是 10 月 30 日的公开数据。

### 启动动画

![Prompt 启动动画的第 3、6、9、12 帧，Braille 点阵会徽从零散的点逐渐成形，最后一帧换成从深蓝到青色的渐变。](/images/posts/ascii-art-and-tui-design/prompt-startup.webp)

动画太快，从外面截不到中间帧，所以这四帧是直接调用 Prompt 自己的 `materializeBraille` 函数、固定随机种子生成的。读了代码才知道它是怎么做的：先把会徽里每个 Braille 字符拆成一个个亮着的点，打乱顺序，然后分 12 帧，每帧多点亮一批，帧与帧之间隔 35 毫秒。每一帧要输出的字符，就是用上一节的办法，把已经点亮的点的权重加起来算出来的。

中间帧都是单一的品牌蓝 #0ea5e9，最后一帧才换成按列从 #124689 经 #0ea5e9 渐变到 #06b6d4。按任意键可以跳过。

会徽有三档。窗口至少 60 列、34 行时，用带外圈文字的大会徽；至少 44 列、24 行时用中号；再小用小号。

终端不支持 Unicode 时，原来换成三行的 ASCII 字标，和 Braille 圆环毫无关系，这就是开头说的那个问题。现在 ASCII 终端看到的是同一个会徽，分四档：

![Prompt 在 LANG=C 下的四档 ASCII 会徽，从左到右依次是 26 行、19 行、12 行和 9 行。每一档都有外圈、两只带瞳孔的月牙形眼睛和一道下弯的笑弧，前两档多一圈内环。](/images/posts/ascii-art-and-tui-design/prompt-emblem.webp)

要把会徽还原到这个程度，我们走了三遍。社团的会徽是一张经典的“滑稽”脸：外面两圈，圈中间写着一圈小字，里面是两只月牙形的眼睛，瞳孔偏向外侧，下面一道笑弧。第一遍，我们把 Braille 点阵缩小，按每一格的明暗从一串由疏到密的字符里挑一个，这是明暗式。圆环粗细不均，眼睛糊成一团。第二遍改成逐格挑笔画最接近的字符，好了一些，但眼睛的轮廓还是对不上，小号则是我们手画的一张笑脸，和会徽几乎没有关系。

两遍都有同一个毛病：它们拿 Braille 点阵当原图，而点阵本身已经是会徽的一份有损的拷贝。第三遍我们回到了社团的 SVG。会徽几乎全是线条，所以先把线条细化成接近字符笔画的粗细，圆环按半径直接画，眼睛和笑弧从 SVG 里取，只有瞳孔保持实心。然后不再一格一格孤立地挑字符，而是让整个网格的渲染结果和原图尽量接近：用 JetBrains Mono 把每个候选字符渲染出来，两边都做一次高斯模糊，逐格挑能让整体误差最小的字符，反复扫几遍，让相邻格子的笔画接得上。眼睛和笑弧的误差权重是圆环的三倍，因为脸才是会徽的辨识点。`@` 只允许出现在瞳孔那样的实心处，其余格子只用 `^` `'` `_` `|` 这类细字符沿着线走。

这个做法借了几份资料。第四节引的 Structure-based ASCII Art 的核心是一个允许错位的形状相似度；我们的“先模糊再比较”是它的一个粗糙替代，同样是为了容忍笔画差几个像素。[AcerolaFX 的 ASCII 着色器](https://github.com/GarrettGunnell/AcerolaFX/blob/main/Shaders/AcerolaFX_ASCII.fx)先做边缘检测，再按每个 8 × 8 像素块里占多数的边缘方向，在竖、横和两个斜向里选一种线条字符，线条交给方向，其余交给亮度。我们没有照搬，因为只看主导方向选不出圆弧和笔画的接缝。[libcaca 研究的第三章](http://caca.zoy.org/study/part3.html)讲误差扩散，Prompt 画风景时用的就是它的蛇形 Floyd–Steinberg；[第七章](http://caca.zoy.org/study/part7.html)提到，给每块只存一个平均值不如存四个角的值，逐格比较 16 × 34 个像素，是把这个想法推到底。

四档的大小是按终端的常见尺寸定的：56 × 26 给高窗口，40 × 19 刚好放进 80 × 24 的默认终端，再往下是 26 × 12 和 20 × 9。放不下就只写 `NBTCA`，再放不下才跳过启动画面。三行 ASCII 字标已经删掉，它画的是字母，不是会徽。

这一版会徽、生成脚本和用到的 SVG 在 [nbtca/Prompt#100](https://github.com/nbtca/Prompt/pull/100) 里，截图取自这个分支。

### 活动页

![Prompt 活动页，80 × 24。五个编号依次标出标签栏、下一场活动的倒计时、近期安排、浏览菜单和底栏按键提示。](/images/posts/ascii-art-and-tui-design/prompt-events.webp)

按前面那四个问题逐条对一下：

1. 我在哪一页：当前标签加了方括号，用加粗的品牌蓝显示。
2. 下一场是什么：顶部写着下一场活动和倒计时。
3. 近期有什么：最近的一场正常显示，更远的日期变暗，`↻` 表示每周重复的活动。
4. 选中了什么：浏览菜单里，选中项前面有 `→`，并且变成品牌蓝。
5. 能按什么：底栏只列当前页面有效的键。首页没有可选的东西，底栏就不写 `↑↓` 和 `⏎`。

活动页里还能打开一张近一年的活跃度热力图：

![Prompt 的近一年活跃度热力图。横向是周，纵向是周一到周日，每格的深浅表示当天的活动数量，选中的一格为蓝色，图例下方写着 2026-10-23 有 1 场活动。](/images/posts/ascii-art-and-tui-design/prompt-heatmap.webp)

每列是一周，每行是星期几，格子的深浅就是那天有几场活动，4 场以上都算最深。行首只标了一、三、五，月份标签放不下的时候会自动省略。

第一轮测试时，这张图只能看，看不出哪一天具体有什么。现在可以用方向键在格子间移动：上下移一天，左右移一周，选中的那天蓝色高亮，下面写着日期、场数和活动，回车把那天展开成列表。今天以后的格子选不中，因为统计的只是过去一年。

### 课表页

![Prompt 课表页，未登录状态。第一行是学年、学期和周次，下方是学期进度条、距期末考试周的天数，以及登录、考试和成绩三个入口。](/images/posts/ascii-art-and-tui-design/prompt-schedule.webp)

第一行永远是学年、学期和第几周，和 K9s 把范围钉在顶部是一个意思。进度条的画法像 btop：`█` 和 `░` 给出大概位置，旁边写着“第 7/17 周”和“距离期末考试周还有 77 天”。

选“登录查看我的课表”会进入统一认证的表单，学号输入框下面写着一行小字：“仅发送给学校统一认证”。

页面下半部分原来是空的，现在画了一列山脊，山路上每一周有一个刻度，旗子随学期进度往上爬。这类图在窗口有空位时才出现，第七节会讲它们怎样随终端的能力变化。

### 文档

文档页可以按分类浏览，也可以搜索。搜索和 fzf 不同，要按回车才提交，因为结果来自远程的文档站，每输入一个字就请求一次并不划算。结果页的排法倒是和 fzf 很像，左边是标题，右边是命中位置附近的摘要：

![Prompt 文档搜索结果。“git”共 20 篇，左列是标题，右列是命中位置附近的摘要，过长的部分以省略号截断。](/images/posts/ascii-art-and-tui-design/prompt-docs-search.webp)

打开一篇以后，顶部的 `nbtca` 换成“文档 › 标题”，正文按 Markdown 排版，右下角显示读到了百分之几：

![Prompt 文档阅读页。标题和小节标题为青色，二级标题下方有横线，列表用圆点，链接单独着色，底栏右侧显示阅读进度 0%。](/images/posts/ascii-art-and-tui-design/prompt-docs-reader.webp)

在这里按 `?`，快捷键页会先列全局按键，再单独列出这一页特有的 `f` 链接模式和 `b` 在浏览器中打开，和 Helix 的做法差不多。

### 不进全屏的时候

`nbtca status`、`nbtca events --week` 这些子命令会直接打印结果然后退出。我们把输出接到管道里，发现符号都变了：

![nbtca status 输出到管道时的结果。在线服务标为“+ 在线”，超时的内网服务标为“! 超时”，分隔线是连字符。](/images/posts/ascii-art-and-tui-design/prompt-pipe.webp)

原因是标准输出不再是终端，程序就假设对面可能不认识 Unicode，换成了纯 ASCII。如果要给脚本用，可以加 `--json`：

```json
{
  "date": "10-27",
  "time": "18:00",
  "title": "下教室招新",
  "location": "待定",
  "description": "",
  "startDateISO": "2026-10-27T10:00:00.000Z",
  "recurring": false,
  "uid": "clh64e316gr66b9i6so3gb9kc8s32bb26dijcb9o64p66dj3c5j68or460@google.com"
}
```

## 七、换一台终端会怎样

### 四项能力

输出接到管道里符号就变了，说明 Prompt 在判断终端的能力。读 `src/core` 下面的代码，一共四项，各自独立：

| 能力 | 在什么情况下关闭 |
| --- | --- |
| 交互 | 标准输入或标准输出不是终端 |
| Unicode 符号 | 设置里选了 ASCII；或者不是终端、`TERM=dumb`、语言环境里没有 UTF-8 |
| 颜色 | 设置了 `NO_COLOR`；或者设置里关了颜色；或者输出不是终端 |
| 动画 | 不是终端、设置了 `NBTCA_NO_MOTION`、在 CI 里、`TERM=dumb`，或者颜色和 Unicode 有一个不可用 |

界面上的每个符号都准备了两份：

| 用途 | Unicode | ASCII |
| --- | --- | --- |
| 选中项 | `→` | `>` |
| 分隔线 | `─` | `-` |
| 分隔点 | `·` | `-` |
| 下一场活动 | `●` | `*` |
| 每周重复 | `↻` | `~` |
| 进度条 | `█` `░` | `#` `-` |
| 热力图五级 | `·` `░` `▒` `▓` `█` | 空格 `.` `:` `-` `=` |
| 警告 | `⚠` | `!` |

我们分别用正常设置、`LANG=C` 和 `NO_COLOR=1` 打开了活动页：

![同一个活动页在三种条件下的样子。上：Unicode 与颜色；中：LANG=C 时换成 ASCII 字符；下：NO_COLOR=1 时去掉所有颜色和粗体，靠方括号、箭头和圆点区分状态。](/images/posts/ascii-art-and-tui-design/prompt-modes.webp)

最下面那张连粗体都没了，但当前页还有方括号，选中项还有箭头，下一场活动前面还有圆点。哪怕一点颜色都没有，也能看出状态。

### 图画也分档

Prompt 现在有不少地方画图：首页是随本地时间变化的海景，月亮按当天的真实月相；课表页是山脊；文档页是一个书架和一只猫；搜不到活动时是星空里的一弯新月；设置里的“关于”页是一颗带条纹的气态行星。海景、山脊这类大图要求至少 30 列、7 行的空位，窗口再小就不画。

![同一个首页的海景在三档下的样子。上：NO_COLOR，只有白色字符；中：有颜色的 ASCII，背景带淡淡的底色；下：开启“图片精细度”后，改用方块和 Braille 画出的平滑画面。](/images/posts/ascii-art-and-tui-design/prompt-tiers.webp)

同一幅图按终端的能力分三档：

| 档位 | 什么时候用 | 画法 |
| --- | --- | --- |
| 精细 | 真彩色、支持 Unicode，且在设置里把“图片精细度”调成精细 | 方块和 Braille，颜色平滑过渡 |
| 彩色 | 有颜色 | 彩色的 ASCII 字符，真彩色下再加一层淡淡的底色 |
| 单色 | 没有颜色或设置了 `NO_COLOR` | 只用 ASCII，靠字符的疏密表现明暗 |

默认不会进入精细档，`LANG=C` 的终端更是永远只有 ASCII。

画法就是前面那两节讲的东西。Prompt 先量出每个 ASCII 字符在 4 × 8 的网格里各占多少墨，再给图里的每一格挑墨量最接近的字符，这是明暗式。单挑最接近的会出现一条条色带，于是它把每格没能表现出来的亮度，按 Floyd–Steinberg 的比例分给右边和下面的格子，让相邻的格子混用不同的疏密，梯度就顺了，做法与 [libcaca 的研究](http://caca.zoy.org/study/index.html)相同。平坦的区域只在 ` .:-=+*#%@` 这十个字符里挑，免得出现一堆杂乱的标点。行星是先算出球面每一点的朝向，再按光照的明暗挑字符，思路来自 [donut.c](https://www.a1k0n.net/2011/07/20/donut-math.html)。

![上：“关于”页的气态行星，右侧是项目信息。下：搜不到活动时的新月和星空。](/images/posts/ascii-art-and-tui-design/prompt-pictures.webp)

### 窗口变小

我们把窗口一路缩到 24 × 10：

![同一个首页在 40 × 16、30 × 12 和 24 × 10 下的样子。标签栏逐步压缩成编号，长标题折行；30 × 12 时只显示 1 条活动，末尾写着“还有 4 项”；24 × 10 时日期留在原位，标题和“还有 4 项”需要向下滚动。](/images/posts/ascii-art-and-tui-design/prompt-narrow.webp)

标签栏先把非当前页换成数字，最后连当前页的名字也去掉，只剩 `[1]`。交互页面的底栏提示在代码里准备了九个版本，从“1-5 / Tab 切换 · ↑↓ 移动 · ⏎ 打开 · Esc 返回 · q 退出 · ? 快捷键”开始，先删说明文字，再删不那么要紧的键，最短的版本只剩一个 `q`。

第一轮测试时，中间那张 30 × 12 的首页有个问题：4 条活动只显示了 1 条，没有任何提示。现在放不下的活动会明说“还有 4 项”。再小到 24 × 10，第一条活动的标题折到了屏幕外，原来整条消失，现在往下滚就能看到。

### 窗口变大

反过来，把窗口拉到 140 × 40：

![Prompt 在 140 × 40 的终端中。内容区限制在 120 列以内并居中，活动页首屏直接嵌入了活跃度热力图，浏览菜单末项是“逐日查看活跃度”。](/images/posts/ascii-art-and-tui-design/prompt-wide.webp)

内容最宽只到 120 列，再宽就居中，两边留白，免得一行字横跨整个屏幕。高度够的时候，活动页会把热力图直接放进首屏，月份标签也从“11”换成了“11月”，浏览菜单里的“近一年活跃度”也相应换成了“逐日查看活跃度”。

### 一个汉字占几格

这些折行和截断，都得先知道一段文字在终端里有多宽。这比看起来麻烦：

| 字符串 | `.length` | 码点 | 用户眼中的字 | 终端列数 |
| --- | --- | --- | --- | --- |
| `A203` | 4 | 4 | 4 | 4 |
| `数据结构` | 4 | 4 | 4 | 8 |
| `👍🏽` | 4 | 2 | 1 | 2 |
| `é`，由 e 和组合重音符构成 | 2 | 2 | 1 | 1 |

如果直接按 JavaScript 的 `.length` 补空格，中文一多，表格就对不齐了：

![上方是“数据结构 A203”在终端网格中的占位，每个汉字占两格；下方左侧按 .length 补空格，分隔线错位，右侧按显示列数补空格，分隔线对齐。|inline](/images/posts/ascii-art-and-tui-design/cjk-width.webp)

Prompt 的 `visualWidth` 是这样算的：先用 [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) 把字符串切成用户眼中的一个个字，再按 [Unicode East Asian Width](https://www.unicode.org/reports/tr11/) 的范围，给汉字、假名和全角符号各记两列，emoji 也记两列，组合符号、零宽连接符和变体选择符记零列。算之前还会先把颜色代码剥掉。TR11 本身也提醒，终端需要按自己的情况调整，所以这套规则只能覆盖大多数情况。

### 只重画变了的那一行

Prompt 运行时会切换到终端的备用屏幕，退出时再切回来，所以你原来终端里的内容不会被冲掉。每次刷新，它先把整屏拼成和窗口一样高的一组字符串，再和上一帧逐行比较。行数没变，就只把光标移到变了的行，重写那一行；行数变了，才整屏重画。在菜单里上下移动时，变化的通常只有新旧两个选中行。curses 当年做的也是这件事。

### 网上来的文字

活动标题、地点和说明来自社团的公开日历，文档来自文档站。第一节说过，终端会执行以 ESC 开头的字节。如果有人在日历里写进一段转义序列，就可能清屏、乱移光标，甚至改掉终端窗口的标题。

所以 Prompt 在显示这些文字之前，会先剥掉其中的 CSI、OSC、DCS 等序列和其他控制字符。具体有哪些序列，可以查 [xterm 的控制序列文档](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)。

## 八、还没想清楚的事

第一轮检查里，好用的地方和别扭的地方，差别在同一件事上：有没有人事先想过放不下时先丢什么。标签栏缩到 24 列也不乱，底栏提示有九个版本，周概览里 `??` 和 `··` 分得清清楚楚，这些地方都有人想好了。别扭的是首页：窗口一小，显示几条活动纯粹取决于前面的内容占了几行。我们据此改了首页，放不下时写明“还有 4 项”，没登录时先显示下一场活动。

但这只是补了漏洞，没有回答根本的问题。24 × 10 的一屏里到底必须有什么？已经登录的用户，大概最想看下一节课；没登录的用户，也许是下一场活动。这两种人能不能共用一个优先级，我们没有答案。热力图也一样，选中某一天以后回车是进列表还是留在原地，我们挑了前者，但没有对比过另一种手感。

会徽重画了三遍，也留下两个问题。第一个是小尺寸：20 × 9 的会徽里，眼睛和笑弧还在，圆环里那圈字和内环已经没了。辨识度究竟在圆环上、眼睛上，还是在那圈字上，我们没有答案。第二个是字体：生成时我们假定了 JetBrains Mono 的字形和 16 × 34 的单元格，换一种字体，笔画的位置会偏，我们没有逐个测过。SAC 的字标不管宽窄都像一家人，这提醒我们可以先画最窄的那一档，再往细的材料里放大。

图画是这次最大的变化，我们对它也最没把握。上一节说过，空行和缩进就是字符界面的排版，那么页面下半部分的空白，到底是该留着的呼吸，还是等着被填的空位？图让首页有了时间和季节，却也让每一页多了和任务无关的东西。字符画对依赖朗读软件的用户是不是噪音，我们没有测过。精细档用 Unicode 方块画出来平滑得多，但依赖终端的字体和真彩色，默认关着，要不要继续只留一个开关，也还没定。

检查的办法这次又用上了。Unicode、颜色、图片档位是各自独立的开关，再乘上窗口尺寸，组合多到没人愿意手动看。我们在伪终端里启动 Prompt，等画面稳定后截图，几分钟就能把几十种组合看一遍。如果把它做成每次改界面都自动跑的文本快照，评审时直接看 diff，大概能挡住不少悄悄发生的退化。代价也很明显：每改一句文案，快照都要跟着变；图画还会随时间和月相变化，快照得先固定时钟。这笔维护成本值不值，要用一阵才知道。

## 九、延伸阅读

历史与文化：Heikki Lotvonen 的 [Amiga ASCII art](https://blog.glyphdrawing.club/amiga-ascii-art/)、Anders Carlsson 的 [Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)、[SAC 档案](https://www.roysac.com/sac.html)。

造型与工具：论文 [Structure-based ASCII Art](https://ttwong12.github.io/papers/asciiart/asciiart.html)、Roy 的 [Width Restrictions & Challenges](https://www.roysac.com/tutorial/roy-ascii-widthandtips.html)、[FIGlet](https://www.figlet.org/)、ANSI 编辑器 [Moebius](https://blocktronics.github.io/moebius/)、把图片转成终端字符的 [Chafa](https://hpjansson.org/chafa/)。

终端与实现：[fzf 文档](https://junegunn.github.io/fzf/)、[Helix 键位](https://docs.helix-editor.com/keymap.html)、[xterm 控制序列](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)、[Unicode East Asian Width](https://www.unicode.org/reports/tr11/)。Prompt 的[源码](https://github.com/nbtca/Prompt)也不长，能力检测、符号表、宽度计算和启动动画都在 `src/core` 目录下，字符画的生成在 `src/art` 里。

## 图版与资料说明

每张第三方图片下面的“来源”写明了作者、年份和出处，“图 N”指来源文章里的图号；来源里没有标注的日期，这里也留空。第五节的应用截图来自各项目官方，实际版本和用户配置可能不同。第六、七节的 Prompt 截图于 2026 年 10 月 30 日在伪终端中实际运行提交 1567a2b（v1.5.23）得到，只有 ASCII 会徽那一张取自 nbtca/Prompt#100 的分支，只有启动动画的四帧和 `nbtca status` 管道输出两张沿用第一轮（v1.5.22）的图，这两处代码没有改动。启动动画的四帧由程序自身的函数以固定随机种子生成。图画的海景、行星等随时间变化，截图只是当时的一帧。

第三方艺术作品、照片和应用截图的权利归各自作者所有，页面底部对本文的许可声明不包括这些材料。Rogue 截图按 CC BY-SA 4.0、VT100 照片按 CC BY 2.0 使用，1898 年与 1919 年的期刊图像已进入公有领域。本文引用这些图版用于评论与比较，完整作品、原始文件和使用条件请查看对应来源。封面、示意图和字符试验为本次调研绘制。
