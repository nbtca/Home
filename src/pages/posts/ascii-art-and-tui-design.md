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

[NBTCA Prompt](https://github.com/nbtca/Prompt) 是社团写的命令行工具，在终端里输入 `nbtca`，就能看到课表、校历、活动和知识库。它启动时会先画一个用 Braille 点阵拼成的社团会徽。终端不支持 Unicode 时，程序会改读一个叫 `ascii-logo.txt` 的文件。有一天我们打开这个文件，发现里面装的还是 Braille 字符。于是在只支持 ASCII 的终端上，用户看到的会徽是一片乱码。

要修它，得先弄明白几件事：一个字符在终端里占多大地方，同一段字符画为什么换个字体就散架，别的 TUI 程序怎样在 80 列里放下那么多信息。我们从一百多年前的打字机艺术看到今天的 btop 和 fzf，又把 Prompt 放进伪终端，一页一页地检查。

下面是这次调研的笔记。资料查阅截至 2026 年 10 月 24 日，Prompt 的截图摄于 10 月 28 日。

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

用字符画画，比计算机早得多。Isaac Pitman 在 1893 年出版的打字教材 [*A Manual of the Typewriter*](https://books.google.com/books/about/A_Manual_of_the_Typewriter.html?id=xadbAAAAQAAJ) 里，已经有用字符排出的装饰图案。这本书 1897 年再版时改名为 *Pitman's Typewriter Manual*，后来的文章多用这个名字称呼它，见 [Sue Walker 对早期打字手册的研究](https://centaur.reading.ac.uk/69514/)。五年后，一位叫 Flora Stacey 的女士用打字机做了一只蝴蝶，刊登在 1898 年 10 月 15 日的 *The Phonetic Journal* 上。

![1898 年 10 月 15 日 The Phonetic Journal 第 662 页，刊登 Flora Stacey 的蝴蝶。四周的边框由反复打出的字符组合构成。|inline](/images/posts/ascii-art-and-tui-design/stacey-butterfly-1898.webp)

图像来自 [oz.Typewriter 对 Stacey 生平的考证](https://oztypewriter.blogspot.com/2020/02/flora-fanny-stacey-1845-1909-worlds.html)，原刊已进入公有领域。更多早期作品可以看 [The Marginalian 对 Barrie Tullett 著作的介绍](https://www.themarginalian.org/2014/05/23/typewriter-art-laurence-king/)。

边框里那些反复出现的字符组合，单独看只是字母和横线，排在一起就成了花纹。

打字机还能叠打：在同一个位置敲好几次，颜色就更深。1919 年 6 月，*Photoplay* 杂志登了一幅 Kenneth Taylor 用打字机打出来的卓别林像。

![Kenneth Taylor 的打字机肖像，刊于 1919 年 6 月的 Photoplay。头发和胡子用密集字符，脸部只用稀疏的点。|inline](/images/posts/ascii-art-and-tui-design/typewriter-chaplin-1919.webp)

图像来源：[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Typewritten_portrait_of_Charlie_Chaplin.jpg)，在美国属于公有领域。

凑近看是一排排字母，退后几步才是一张脸。蝴蝶的边框用的是字符的形状，卓别林像用的是字符的深浅。这两种用法到今天还是字符画的两条主要路线，第四节我们会实际测一测。

### Bell Labs 的恶作剧

1966 年，Bell Labs 的 Leon Harmon 想趁上司 Ed David 出差搞个恶作剧，找同事 Ken Knowlton 帮忙。他们用计算机扫描了一张照片，按明暗挑出晶体管、电阻之类的电子元件符号，拼成一幅 12 英尺宽的裸体像，挂在 David 的办公室墙上。

据 Knowlton 的[回忆](https://www.kenknowlton.com/pages/04portrait.htm)，这幅画只挂了一天，就因为被认为不适合挂在实验室里而摘了下来。后来它登上了 1967 年 10 月 11 日的《纽约时报》，又以 *Studies in Perception I* 的名字进入 MoMA 1968 年的[机器主题展](https://www.moma.org/momaorg/shared/pdfs/docs/press_archives/4149/releases/MOMA_1968_July-December_0081.pdf)。

它用的是自制符号，不算严格意义上的 ASCII 字符画。但它让计算机接手了卓别林像那种按明暗挑字符的工作。

### VT100 与 Rogue

电传打字机只能一行接一行往下打印，没法回头修改。后来的视频终端能把光标移到屏幕上任意位置，但每家厂商的指令都不一样。DEC 自己的 VT52 要移动光标，得发送 `ESC Y` 再加两个代表行和列的字符，[维修手册](https://vt100.net/docs/vt52-mm/chapter2.html)里就有这样的测试步骤。

1978 年 8 月，DEC 推出了 VT100。据 [DEC 的年表](https://www.vt100.net/timeline/1978.html)，这是它第一台符合 ANSI 标准的视频终端。[VT100 的用户手册](https://vt100.net/docs/vt100-ug/chapter1.html)写明，它在 ANSI 模式下按 X3.64-1977 标准收发控制序列，移动光标写成 `ESC[行;列H`，同时保留了兼容旧软件的 VT52 模式。今天的 xterm 等终端模拟器仍以 VT100 及其后继型号为参照，见 [xterm 的控制序列文档](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)。

![DEC VT100 终端，摄于 Living Computer Museum。](/images/posts/ascii-art-and-tui-design/vt100.webp)

照片：Jason Scott，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)，来自 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:DEC_VT100_terminal.jpg)。

光标能自由移动以后，屏幕就能当成一张地图来用。大约同一时期，加州大学的 Michael Toy 和 Glenn Wichman 开始写 Rogue。Wichman 在 [A Brief History of Rogue](https://www.wichman.org/roguehistory.html) 里回忆，正是 Ken Arnold 写的 curses 库让他们能把字符放到屏幕的指定位置，才有了屏幕上的地下城。后来 Rogue 随 4.2BSD 发行，传遍了各地大学的机房。

![BSD 版 Rogue。横线和竖线围出房间，# 是走廊，+ 是门，@ 是玩家，最下面一行是状态栏。|inline](/images/posts/ascii-art-and-tui-design/rogue-bsd.webp)

截图：Thedarkb，[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)，来自 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Rogue_Screenshot.png)。

在纯文字的冒险游戏里，要用一段话描述“你的东边有一扇门”。在 Rogue 里，`+` 就待在房间墙上，玩家一眼就能看到。代价是每个符号都得有固定的含义，玩家得去查。[NetHack 的 Guidebook](https://www.nethack.org/v367/Guidebook.html) 到今天还在逐个解释这些符号。

### :-)

1982 年 9 月 19 日上午 11 点 44 分，Scott Fahlman 在 CMU 的电子布告栏上提议，用 `:-)` 标记玩笑话，并补了一句“侧着看”。这条消息一度失传，2002 年才有人从备份磁带里把它[找了回来](https://www.cs.cmu.edu/~sef/Orig-Smiley.htm)。

它没有画任何东西，只是告诉读者这句话是玩笑。

### BBS

1978 年 1 月 16 日，Ward Christensen 和 Randy Suess 在芝加哥商量出一个主意：让电脑俱乐部的会员用调制解调器拨进一台电脑，互相留言。他们在 30 天后的 2 月 16 日让系统上了线，后来在 [1978 年 11 月的 BYTE 杂志](https://archive.org/details/byte-magazine-1978-11)第 150 页写文章介绍了它。这就是第一个 BBS。

接下来二十年，人们拨号进入各种 BBS，最先看到的就是用字符画的欢迎画面。据 [scene.org 保存的一篇 1998 年的文章](https://archive.scene.org/pub/mirrors/artpacks/www/mirrors/acheron/articles/ar-history.shtml)，1990 年代初，ANSI 艺术家们开始组成团体，每月把成员的作品打包发布，叫作 art pack。最早的大型团体是 Aces of ANSI Art，随后有了 ACiD、iCE 等一大批。[Sixteen Colors](https://16colo.rs/) 今天还保存着大量原始文件，想看团体自己的记录，可以翻翻 [SAC 的档案](https://www.roysac.com/sac.html)。

BBS 的字符画大多是有用途的：欢迎画面介绍站点，菜单告诉你按什么键，文件列表里还有小字标。上传文件附带的说明文件 FILE_ID.DIZ [通常不超过 10 行、每行 45 个字符](https://blog.glyphdrawing.club/amiga-ascii-art/)，艺术家要在这么小的地方把团体的名字画得认得出来。

## 三、几件作品

下面这些作品，建议都打开原作看。先看整体，再放大看字符。

### Joan Stark 的旋转木马

Joan G. Stark 常以 `jgs` 署名，Usenet 上很多流传甚广的 ASCII 小画都出自她手。她的[原站存档](https://www.oocities.org/joan_stark/)按动物、人物、节庆分类，[动物分类](https://oldcompcz.github.io/jgs/joan_stark/indexanimals.html)里有不少小品。

![左侧是 Joan Stark 于 1998 年制作的旋转木马，右侧是 Stylez 于 1995 年制作的透视字标。|inline](/images/posts/ascii-art-and-tui-design/ascii-comparison.webp)

图版来自 Carlsson 的 [Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)，作者与日期按其中署名保留。

左边的旋转木马，能认出它靠的是外轮廓、头的朝向、腿的姿势和穿过身体的立柱。

### Amiga 的斜线

上图右边是 Stylez 的字标，字母被拉进了透视里，大块的内部空白和黑底一起撑起了体积。

这种画法离不开 Amiga 的默认字体 Topaz。Heikki Lotvonen 在 [Amiga ASCII art](https://blog.glyphdrawing.club/amiga-ascii-art/) 里解释了原因：Topaz 的字距和行距都很窄，下划线后面紧跟一条斜线，看起来就是连着的；上下两行的斜线也能接成一条长线。所以 Amiga 上的字标几乎都是斜体。同一篇文章还收了芬兰艺术家 Antti “h7” Kiuru 的 *Jungle Fever*。

![h7 于 2015 年制作的 Jungle Fever 标题图版，以斜线字标、细长竖线和大面积留白组织阅读节奏。|inline](/images/posts/ascii-art-and-tui-design/amiga-jungle-fever.webp)

图版与署名来源：[Lotvonen 的研究](https://blog.glyphdrawing.club/amiga-ascii-art/)。

这张图远看是一个大字标，近看是一列细竖线串起的短句，中间大片留白。这类字标靠空白分开字母，想把它压窄，只删空格是不行的，字母会粘成一团。

### Roy 的小画布

Roy 是 SAC 的成员，[SAC 字标图集](https://www.roysac.com/sac_asciis.html)收了大量用在 NFO 和 FILE_ID.DIZ 里的小字标，可以和 [Roy 的自选作品](https://www.roysac.com/roy_bestof.html)对照着看。他写过一篇 [Width Restrictions & Challenges](https://www.roysac.com/tutorial/roy-ascii-widthandtips.html)，专门讲怎样在有限宽度里画字标，其中一条建议是：艺术字标旁边再写一遍普通文字的名字，因为不是每个人都认得出艺术字。

Prompt 也是这么做的：启动画面画会徽，进入程序后，大多数页面的左上角都写着普通文字的 `nbtca`。

### ACiD 与 Blocktronics

[ECMA-48](https://ecma-international.org/wp-content/uploads/ECMA-48_5th_edition_june_1991.pdf) 第 8.3.117 节的 SGR 只定义了 8 种前景色和 8 种背景色，参数 30 到 37 和 40 到 47。PC 上把“加粗”显示成高亮，前景色就多出 8 种，所以 ANSI art 一般有 [16 种前景色和 8 种背景色](https://blog.glyphdrawing.club/amiga-ascii-art/)。打开 [ACiD 100 的作品包](https://16colo.rs/pack/acid-100/)，再翻翻 [Blocktronics 的档案](https://16colo.rs/group/blocktronics)，能看到艺术家们在同样的限制下画出了多么不同的东西。

其中一件是 ungenannt 的 [ungenannt_1453.ans](https://16colo.rs/pack/blocktronics_blocktober/ungenannt_1453.ans)，收录在 2016 年的 *blocktronics_blocktober* 里。这是一幅长卷，要在档案站上一路滚动着看。整幅画几乎只用了红、黑、灰、白四种颜色，大块的明暗反复出现，把很多细节连成了一个整体。

### 日本的 AA

日本的 AA 用的是日文字符和 MS PGothic 这样的比例字体，能用的字符比纯 ASCII 多得多。Carlsson 的研究里收了 Illiorzilli 在 2013 年画的一个机器人，也讨论了字体对这类作品的影响，见 [Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)。

AA 里的角色，眼睛挪一格、嘴换一个字符，表情就变了。不过它们依赖比例字体，复制到等宽的终端里，比例就全乱了。

### PTT 的中文 ANSI

![上方是 jacky90527 的 PTT 登录画面，下方是 else 于 2013 年制作的人物群像，展示几何块形与中文构图。](/images/posts/ascii-art-and-tui-design/ptt-ansi.webp)

图版、署名与下方作品日期来源：[Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)。上方登录画面的创作日期未见标注。

Carlsson 注意到，台湾 PTT 用的中文字符集里方块字符比西方的多得多，那里的艺术家更喜欢用整块的几何色面，很少用明暗渐变的字符。登录画面里，椰树的剪影、几条水平色带和一句中文，就交代了天空和海面。下方的群像靠清楚的色块边界，让好几个人物同时站得住。

这是我们找到的离 Prompt 最近的传统：中文、终端、色块。不过这些作品是为当年的 BBS 客户端画的，放到今天的 Unicode 终端里，方块字符的宽度未必还一样，我们没有逐个验证。

### Raquel Meyers 的 PETSCII

Raquel Meyers 的[作品](https://www.raquelmeyers.com/selected/)横跨 Commodore 64 的 PETSCII、Teletext 和现场表演。下图是她 2015 年的一件 PETSCII 作品。

![Raquel Meyers 于 2015 年制作的 PETSCII 作品，以白、浅蓝和棕色几何单元形成对称结构。|inline](/images/posts/ascii-art-and-tui-design/raquel-meyers-petscii.webp)

图版与日期来源：[Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)。更多 Teletext 作品见 [Teletext Art 的艺术家页面](https://teletextart.co.uk/artists/raquel-meyers)。

画面里的东西不多，就是几种阶梯、斜线和小方块，换着方向和颜色反复出现。

### FIGlet

[FIGlet](https://www.figlet.org/) 是 Glenn Chappell 和 Ian Chai 写的小工具，能把一行文字排成大字。名字来自“Frank, Ian and Glenn's letters”，[手册页](https://github.com/cmatsuoka/figlet/blob/master/figlet.6)上最早的版权年份是 1991 年。我们用它试了几种字体：

![用 FIGlet 的 Standard、Slant、Small Slant 和 Doom 四种字体排出 nbtca。](/images/posts/ascii-art-and-tui-design/figlet-fonts.webp)

Slant 的斜线写法和 Amiga 字标很像。对 Prompt 这样名字固定的程序，没必要在运行时调用 FIGlet，挑好的字标存成文本文件随程序发布就够了。

### 字符版《星球大战》

[Star Wars ASCIIMATION](https://www.asciimation.co.nz/) 是 Simon Jansen 从 1997 年开始逐帧手工做的字符版《星球大战》。看的时候可以数一数：一个新场景出现后，要过几帧才认得出是哪里；一句字幕停留多久才读得完。

## 四、字符的几何

### 哪个字符最黑

卓别林像按深浅挑字符，那么，哪个字符最“黑”？

网上流传着不少密度序列，比如 ` .:-=+*#%@`，但没说是在哪种字体下测的。我们干脆自己测：在浏览器里用 JetBrains Mono 逐个渲染 95 个可打印字符，数每个字符占了单元格多少面积。

![上方是 JetBrains Mono 中 13 个字符的实测墨量。下方左侧是明暗式，按亮度为球体逐格挑选字符；右侧是轮廓式，用字符的线条勾出同一个球。](/images/posts/ascii-art-and-tui-design/shape-tone-structure.webp)

最黑的是 `@`，也只盖住了单元格的 29.8%。`#` 是 22%，`.` 只有 3.1%。换一种字体，排名多半会变，我们只测了这一种。

图中左边的球，就是按测出来的墨量，逐格给每个位置挑了一个字符。右边的球是手画的，只用字符的线条去贴合轮廓。Xu、Zhang 与 Wong 在 SIGGRAPH 2010 的论文 [Structure-based ASCII Art](https://ttwong12.github.io/papers/asciiart/asciiart.html) 里，把这两种做法分别叫作 tone-based 和 structure-based。他们指出，前者要很多字符才有层次，后者直到论文发表时还主要靠手画，因为要用很少的几种字符形状去贴合任意曲线，太难自动完成。

### 格子是窄长的

终端的格子不是正方形。等宽字体的字宽一般是 0.6 em，行高在 1.2 em 左右，所以一个格子大约宽 1、高 2。

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

Midnight Commander 是 Miguel de Icaza 发起的双栏文件管理器，[项目 FAQ](https://github.com/MidnightCommander/mc/blob/master/doc/FAQ) 记录的第一批合作者在 1994 年加入。它最显眼的是底部那行功能键：

![Midnight Commander 官方截图，展示双栏文件列表、打开的 File 菜单和底部功能键提示。](/images/posts/ascii-art-and-tui-design/midnight-commander.webp)

截图来源：[Midnight Commander](https://midnight-commander.org/)。

F1 到 F10 一直写在屏幕最下面，不用翻手册就能知道每个键干什么。

btop 则把比例条、曲线和精确数值放在一起：

![btop 官方截图，以固定区域显示 CPU、内存、磁盘、网络和进程信息，图形与精确数值并列。](/images/posts/ascii-art-and-tui-design/btop.webp)

截图来源：[btop 官方仓库](https://github.com/aristocratos/btop#screenshots)。

条形让你一眼看出 CPU 忙不忙，旁边的数字告诉你具体是多少。

fzf 每输入一个字符就重新过滤一次候选项，[预览窗口](https://github.com/junegunn/fzf#preview-window)跟着当前选中项变化。Helix 按下 `space` 或 `g` 这样的前缀键后，会弹出一个小框，列出接下来能按的键。K9s 把集群、资源类型和筛选条件固定在画面顶部，你不用记自己在看什么。

## 六、把 Prompt 跑起来

轮到 Prompt，我们没有看设计稿，直接看它跑起来的样子。

一开始我们用 vhs 录屏，结果被骗了一次：按下 `2` 切到课表页，截图里高亮的却是活动页。我们以为找到了一个 bug，做对照实验才发现，vhs 在隐藏和显示画面之间切换后，截图的帧顺序会乱。后来我们改用 Python 的 `pty` 模块在伪终端里启动 Prompt，用 `pyte` 这个终端模拟库解析它的输出，等画面上出现预期的文字再截图，最后按每个字符的真实宽度和颜色转成图片。下面的截图都是这样得到的。

我们测的是 v1.5.22，对应 [PR #92 的提交 2a75b1a](https://github.com/nbtca/Prompt/tree/2a75b1aaa01dd1292f4338df90eae96b3bc38157)。用的是全新的配置目录，没有登录统一认证，活动和文档都是 10 月 28 日的公开数据。

### 启动动画

![Prompt 启动动画的第 3、6、9、12 帧，Braille 点阵会徽从零散的点逐渐成形，最后一帧换成从深蓝到青色的渐变。](/images/posts/ascii-art-and-tui-design/prompt-startup.webp)

动画太快，从外面截不到中间帧，所以这四帧是直接调用 Prompt 自己的 `materializeBraille` 函数、固定随机种子生成的。读了代码才知道它是怎么做的：先把会徽里每个 Braille 字符拆成一个个亮着的点，打乱顺序，然后分 12 帧，每帧多点亮一批，帧与帧之间隔 35 毫秒。每一帧要输出的字符，就是用上一节的办法，把已经点亮的点的权重加起来算出来的。

中间帧都是单一的品牌蓝 #0ea5e9，最后一帧才换成按列从 #124689 经 #0ea5e9 渐变到 #06b6d4。按任意键可以跳过。

会徽有三档。窗口至少 60 列、34 行时，用带外圈文字的大会徽；至少 44 列、24 行时用中号；再小用小号。终端不支持 Unicode 时，换成三行的 ASCII 字标；字标也放不下，就只写 `NBTCA`；还放不下，干脆跳过启动画面。开头说的那个问题，出在 ASCII 字标这一档，我们留到最后一节回头讨论。

### 活动页

![Prompt 活动页，80 × 24。五个编号依次标出标签栏、下一场活动的倒计时、近期安排、浏览菜单和底栏按键提示。](/images/posts/ascii-art-and-tui-design/prompt-events.webp)

按前面那四个问题逐条对一下：

1. 我在哪一页：当前标签加了方括号，用加粗的品牌蓝显示。
2. 下一场是什么：顶部写着下一场活动和倒计时。
3. 近期有什么：最近的一场正常显示，更远的日期变暗，`↻` 表示每周重复的活动。
4. 选中了什么：浏览菜单里，选中项前面有 `→`，并且变成品牌蓝。
5. 能按什么：底栏只列当前页面有效的键。首页没有可选的东西，底栏就不写 `↑↓` 和 `⏎`。

活动页里还能打开一张近一年的活跃度热力图：

![Prompt 的近一年活跃度热力图。横向是 53 周，纵向是周一到周日，每格的深浅表示当天的活动数量，底部是“少”到“多”的图例。](/images/posts/ascii-art-and-tui-design/prompt-heatmap.webp)

每列是一周，每行是星期几，格子的深浅就是那天有几场活动，4 场以上都算最深。行首只标了一、三、五，月份标签放不下的时候会自动省略。

### 课表页

![Prompt 课表页，未登录状态。第一行是学年、学期和周次，下方是学期进度条、距期末考试周的天数，以及登录、考试和成绩三个入口。](/images/posts/ascii-art-and-tui-design/prompt-schedule.webp)

第一行永远是学年、学期和第几周，和 K9s 把范围钉在顶部是一个意思。进度条的画法像 btop：`█` 和 `░` 给出大概位置，旁边写着“第 7/17 周”和“距离期末考试周还有 77 天”。

选“登录查看我的课表”会进入统一认证的表单，学号输入框下面写着一行小字：“仅发送给学校统一认证”。

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

### 窗口变小

我们把窗口一路缩到 24 × 10：

![同一个程序在 40 × 16、30 × 12 和 24 × 10 下的样子。标签栏逐步压缩成编号，长标题折行，底栏只保留关键按键；浏览菜单显示“1/6”提示还有更多项。](/images/posts/ascii-art-and-tui-design/prompt-narrow.webp)

标签栏先把非当前页换成数字，最后连当前页的名字也去掉，只剩 `[3]`。底栏的提示在代码里准备了九个版本，从“1-5 / Tab 切换 · ↑↓ 移动 · ⏎ 打开 · Esc 返回 · q 退出 · ? 快捷键”开始，先删说明文字，再删不那么要紧的键，最短的版本只剩一个 `q`。浏览菜单放不下六项时，标题旁边会写“1/6”，告诉你下面还有。

中间那张 30 × 12 的首页有个问题：4 条活动只显示了 1 条，没有任何提示。

### 窗口变大

反过来，把窗口拉到 140 × 40：

![Prompt 在 140 × 40 的终端中。内容区限制在 120 列以内并居中，活动页首屏直接嵌入了活跃度热力图。](/images/posts/ascii-art-and-tui-design/prompt-wide.webp)

内容最宽只到 120 列，再宽就居中，两边留白，免得一行字横跨整个屏幕。高度够的时候，活动页会把热力图直接放进首屏，月份标签也从“11”换成了“11月”，浏览菜单里相应地少了“近一年活跃度”这一项。

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

Prompt 的 `visualWidth` 是这样算的：先用 [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) 把字符串切成用户眼中的一个个字，再按 [Unicode East Asian Width](https://www.unicode.org/reports/tr11/) 的范围，给汉字、假名和全角符号各记两列，emoji 也记两列，组合符号、零宽连接符和变体选择符记零列。算之前还会先把颜色代码剥掉。TR11 自己也说，终端里的实际宽度要看具体实现，emoji 尤其不统一，所以这套规则只能覆盖大多数情况。

### 只重画变了的那一行

Prompt 运行时会切换到终端的备用屏幕，退出时再切回来，所以你原来终端里的内容不会被冲掉。每次刷新，它先把整屏拼成和窗口一样高的一组字符串，再和上一帧逐行比较。行数没变，就只把光标移到变了的行，重写那一行；行数变了，才整屏重画。在菜单里上下移动时，变化的通常只有新旧两个选中行。curses 当年做的也是这件事。

### 网上来的文字

活动标题、地点和说明来自社团的公开日历，文档来自文档站。第一节说过，终端会执行以 ESC 开头的字节。如果有人在日历里写进一段转义序列，就可能清屏、乱移光标，甚至改掉终端窗口的标题。

所以 Prompt 在显示这些文字之前，会先剥掉其中的 CSI、OSC、DCS 等序列和其他控制字符。具体有哪些序列，可以查 [xterm 的控制序列文档](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)。

## 八、还没想清楚的事

把 Prompt 一页一页看下来，好用的地方和别扭的地方，差别在同一件事上。标签栏缩到 24 列也不乱，底栏提示有九个版本，周概览里 `??` 和 `··` 分得清清楚楚，这些地方都有人事先想好了：放不下时先丢什么，再丢什么，每个符号代表什么。别扭的地方是首页。30 × 12 的窗口里，4 条近期活动只显示了 1 条，没有任何提示；再小到 24 × 10，第一条活动整条不见，“活动”两个字下面空着。这里没有谁决定过留什么，显示几条，纯粹取决于前面的内容占了几行。

所以我们现在觉得，窗口尺寸不是排版阶段才考虑的事，它决定了内容的取舍。可具体到首页，24 × 10 的一屏里到底必须有什么，我们没有答案。已经登录的用户，大概最想看下一节课；没登录的用户，也许是下一场活动。这两种人能不能共用一个优先级，要不要在放不下的时候明说“还有 3 项”，都还没定。这几件事分别记在了 [#93](https://github.com/nbtca/Prompt/issues/93) 和 [#94](https://github.com/nbtca/Prompt/issues/94) 里。

热力图是另一类问题。它能看出哪几周忙，却看不出某一天到底有什么活动，而 btop 的图形旁边总有数字。字符界面有个现成的办法：用方向键在格子间移动，下面显示选中那一天的内容。听起来顺理成章，但热力图统计的只是过去一年，今天以后的格子要不要也能选，选中以后回车是进列表还是留在原地，我们没有试过，不知道哪种手感对（[#96](https://github.com/nbtca/Prompt/issues/96)）。

品牌那一块，我们多少有点心虚。Braille 会徽是个点阵拼的圆环，里面有两只眼睛和一道弧，终端不支持 Unicode 时却换成三行 `NBTCA` 字母，两者毫无关系。SAC 的字标不管宽窄都像一家人，这提醒我们可以反过来做，先画最窄的那一档，再往细的材料里放大。我们手画过一个 26 列宽的版本，画完发现它读起来像一张笑脸。这是好事还是坏事？会徽的辨识度究竟在圆环上，还是在那两只眼睛上？我们还没想清楚（[#95](https://github.com/nbtca/Prompt/issues/95)）。

这次调研留下的东西里，也许最有用的不是上面任何一个想法，而是检查的办法。Unicode、颜色、动画是各自独立的开关，再乘上窗口尺寸，组合多到没人愿意手动看。我们在伪终端里启动 Prompt，等画面稳定后截图，几分钟就能把几十种组合看一遍。如果把它做成每次改界面都自动跑的文本快照，评审时直接看 diff，大概能挡住不少悄悄发生的退化。代价也很明显：每改一句文案，快照都要跟着变，这笔维护成本值不值，要用一阵才知道。

## 九、延伸阅读

历史与文化：Heikki Lotvonen 的 [Amiga ASCII art](https://blog.glyphdrawing.club/amiga-ascii-art/)、Anders Carlsson 的 [Beyond Encoding](https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/)、[SAC 档案](https://www.roysac.com/sac.html)。

造型与工具：论文 [Structure-based ASCII Art](https://ttwong12.github.io/papers/asciiart/asciiart.html)、Roy 的 [Width Restrictions & Challenges](https://www.roysac.com/tutorial/roy-ascii-widthandtips.html)、[FIGlet](https://www.figlet.org/)、ANSI 编辑器 [Moebius](https://blocktronics.github.io/moebius/)、把图片转成终端字符的 [Chafa](https://hpjansson.org/chafa/)。

终端与实现：[fzf 文档](https://junegunn.github.io/fzf/)、[Helix 键位](https://docs.helix-editor.com/keymap.html)、[xterm 控制序列](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)、[Unicode East Asian Width](https://www.unicode.org/reports/tr11/)。Prompt 的[源码](https://github.com/nbtca/Prompt)也不长，能力检测、符号表、宽度计算和启动动画都在 `src/core` 目录下。

## 图版与资料说明

历史作品的作者、年份和出处标在相应图版旁，无法从引文确定的日期保持空缺。第五节的应用截图来自各项目官方，实际版本和用户配置可能不同。第六、七节的 Prompt 截图于 2026 年 10 月 28 日在伪终端中实际运行提交 2a75b1a 得到，启动动画的四帧由程序自身的函数以固定随机种子生成。

第三方艺术作品、照片和应用截图的权利归各自作者所有，页面底部对本文的许可声明不包括这些材料。Rogue 截图按 CC BY-SA 4.0、VT100 照片按 CC BY 2.0 使用，1898 年与 1919 年的期刊图像已进入公有领域。本文引用这些图版用于评论与比较，完整作品、原始文件和使用条件请查看对应来源。封面、示意图和字符试验为本次调研绘制。
