---
layout: "../../../../../layouts/MarkdownPost.astro"
title: Go语言极限入门
pubDate: 2022-04-19 10:11:26
categories:
  - 技术
  - Go语言
cover: https://oss.nbtca.space/blog/clas/image-20220419101405456-wHMqwe.jpeg
tid: go-first-tutorial
description: Go语言入门教程。
permalink: /pages/bd144d/
author:
  name: N3ptune
  link: https://www.cnblogs.com/N3ptune
tags:
  - 技术
  - Go语言
---

## Go 语言极限入门

> 参考书目: 《Go 程序设计语言》

#### 快速入门

如下是 hello world 程序：

```go
// hello.go
package main

import "fmt"

func main() {
        fmt.Println("Hello World")
}
```

终端执行 `go run hello.go`。

Go 代码是用包来组织的，包类似于其他语言中的库和模块。

`package main`指明了这个文件属于哪个包。

后面跟着导入的是其他包的列表，fmt 用于格式化输出和扫描输入。

main 包比较特殊，它用来定义一个独立的可执行程序，而不是库。import 声明必须跟在 package 声明之后。import 导入声明后，是组成程序的函数。

一个函数的声明由 func 关键字、函数名、参数列表(main 函数为空)、返回值列表和函数体构成。

###### 命令行参数

命令行参数以 os 包中 Args 名字的变量供程序访问，在 os 包外面，使用 os.Args 这个名字，这是一个字符串 slice。

```go
// echo.go 输出命令行参数
package main

import (
    "fmt"
    "os"
)

func main() {
    var s, sep string
    for i := 1; i < len(os.Args); i++ {
        s += sep + os.Args[i]
        sep = " "
    }
    fmt.Println(s)
}
```

```shell
$ go build echo.go
./echo hello
hello
```

var 关键字声明了两个 string 类型的变量 s 和 sep。变量可以声明的时候初始化。如果变量没有明确地初始化，它将隐式初始化这个类型的空值。

for 是 go 里面唯一的循环语句。

```go
for initlization; condition; post {
    //语句
}
```

可选的 initialization(初始化)语句在循环开始之前执行。如果存在，它必须是一个简单的语句。三部分都是可省的，如果三部分都不存在，只有一个 for，那就是无限循环。

另一种形式的 for 循环是在字符串或 slice 数据上迭代。

如下是第二种 echo 程序：

```go
// echo.go
package main

import (
    "fmt"
    "os"
)

func main() {
    var s, sep string
    for _, arg := range os.Args[1:] {
        s += sep + arg
        sep = " "
    }
    fmt.Println(s)
}
```

每一次迭代，range 都产生一对值: 索引和这个索引处元素的值。因为这个例子里用不到索引，但是语法上 range 循环需要处理。应次也必须处理索引。可以将索引赋予一个临时变量，然后忽略它，但是**go 不允许存在无用的变量**。选择使用**空标识符**"\_\_"。空标识符可以用在任何语法需要变量名但逻辑不需要的地方。

如果有大量的数据要处理，这样做的代价会比较大。可以使用 strings 包中的`Join`函数。

```go
package main

import (
    "fmt"
    "os"
    "strings"
)

func main() {
    fmt.Println(strings.Join(os.Args[1:], " "))
}
```

###### 找出重复行

如下程序要输出标准输入中出现次数大于 1 的行，前面是次数。

```go
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    counts := make(map[string]int)
    input := bufio.NewScanner(os.Stdin)
    for input.Scan() {
        counts[input.Text()]++
    }
    for line, n := range counts {
        if n > 1 {
            fmt.Printf("%d\t%s\n", n, line)
        }
    }
}
```

在上述这个程序中，引入了 if 语句、map 类型和 bufio 包。

像 for 一样，if 语句中的条件部分也从不放在圆括号里。

map 存储一个键值对集合。在这里 map 的键是字符串，值是数字。内置的函数 make 可以用来新建 map，它还可以有其他用途。

`counts := make(map[string]int)`

每次从输入读取一行内容，这一行就作为 map 中的键，对应的值递增 1。键在 map 中不存在时也是没有问题的。为了输出结果，使用基于 range 的 for 循环。

bufio 包，使用它可以简便和高效地处理输入和输出。其中一个最有用的特性是称为扫描器(Scanner)的类型，可以读取输入，以行或者单词为单位断开。

`input := bufio.NewScanner(os.Stdin)`

Printf 函数有超过 10 个转义字符：

| verb     | 描述                         |
| -------- | ---------------------------- |
| %d       | 十进制整数                   |
| %x,%o,%b | 十六进制、八进制、二进制整数 |
| %f,%g,%e | 浮点数                       |
| %t       | 布尔类型                     |
| %c       | 字符                         |
| %s       | 字符串                       |
| %q       | 带引号字符串                 |
| %v       | 内置格式的任何值             |
| %T       | 任何值的类型                 |
| %%       | 百分号本身                   |

如下是从文件中读取字符串：

```go
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    counts := make(map[string]int)
    files := os.Args[1:]
    if len(files) == 0 {
        countLines(os.Stdin, counts)
    } else {
        for _, arg := range files {
            f, err := os.Open(arg)
            if err != nil {
                fmt.Fprintf(os.Stderr, "dup: %v\n", err)
                continue
            }
            countLines(f, counts)
            f.Close()
        }
    }
    for line, n := range counts {
        if n > 1 {
            fmt.Printf("%d\t%s\n", n, line)
        }
    }
}

func countLines(f *os.File, counts map[string]int) {
    input := bufio.NewScanner(f)
    for input.Scan() {
        counts[input.Text()]++
    }
}
```

读取的文件如下：

```shell
$ cat test.txt
AAAAAAAA
BBBBBBB
AAAAAAAA
CCCCCCC
HHHHHH
```

输入如下：

```shell
$ ./main test.txt
2       AAAAAAAA
```

上述程序是采用"流式"模式读取输入，然后按需拆分为行。

这里引入一个 ReadFile 函数(从 io/ioutil 包导入)，它读取整个命名文件的内容，还引入一个 strings.Split 函数，将一个字符串分割为一个由子串组成的 slice：

```go
package main

import (
    "fmt"
    "io/ioutil"
    "os"
    "strings"
)

func main() {
    counts := make(map[string]int)
    for _,filename := range os.Args[1:] {
        data,err := ioutil.ReadFile(filename)
        if err != nil {
            fmt.Fprintf(os.Stderr,"dup: %v\n",err)
            continue
        }
        for _,line := range strings.Split(string(data),"\n") {
            counts[line]++
        }
    }
    for line,n := range counts {
        if n > 1 {
            fmt.Printf("%d\t%s\n",n,line)
        }
    }
}
```

ReadFile 函数返回一个可以转化成字符串的字节 slice，这样它可以被 strings.Split 分割。

###### **获取一个 URL**

Go 提供了一系列包，在 net 包下面分组管理，使用它们可以方便地通过互联网发送和接受信息。

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "os"
)

func main() {
    for _,url := range os.Args[1:] {
        resp,err := http.Get(url)
        if err != nil {
            fmt.Fprintf(os.Stderr,"fetch: %v\n",err)
            os.Exit(1)
        }
        b,err := ioutil.ReadAll(resp.Body)
        resp.Body.Close()
        if err != nil {
            fmt.Fprintf(os.Stderr,"fetch: reading %s: %v\n",url,err)
            os.Exit(1)
        }
        fmt.Printf("%s",b)
    }
}
```

程序 fetch 展示从互联网获取信息的最小需求，它获取每个指定 URL 的内容，然后不加解析地输出。fetch 来自 curl 工具。

这个程序使用的函数来自两个包: net/http 和 io/ioutil。http.Get 函数产生一个 HTTP 请求，如果没有出错，返回结果存在响应结构 resp 里面，其中 resp 的 Body 域包含服务器端响应的一个可读取数据流。随后 ioutil.ReadAll 读取整个响应结果并存入 b。

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "os"
)

func main() {
    for _, url := range os.Args[1:] {
        resp, err := http.Get(url)
        if err != nil {
            fmt.Fprintf(os.Stderr, "fetch: %v\n", err)
            os.Exit(1)
        }
        b, err := ioutil.ReadAll(resp.Body)
        resp.Body.Close()
        if err != nil {
            fmt.Fprintf(os.Stderr, "fetch: reading %s: %v\n", url, err)
            os.Exit(1)
        }
        fmt.Printf("%s\n", b)
    }
}
```

关闭 Body 数据流来避免资源泄露。

运行结果：

```shell
$ ./fetch https://www.baidu.com
<html>
<head>
        <script>
                location.replace(location.href.replace("https://","http://"));
        </script>
</head>
<body>
        <noscript><meta http-equiv="refresh" content="0;url=http://www.baidu.com/"></noscript>
</body>
</html>
```

也可将程序改写：

```go
package main

import (
    "fmt"
    "io"
    "net/http"
    "os"
)

func main() {
    for _, url := range os.Args[1:] {
        resp, err := http.Get(url)
        if err != nil {
            _, err = fmt.Fprintf(os.Stderr, "fetch: %v\n", err)
            os.Exit(1)
        }
        for {
            written, err := io.Copy(os.Stdout, resp.Body)
            if written == 0 {
                break
            }
            if err != nil {
                _, err = fmt.Fprintf(os.Stderr, "fetch: %v\n", err)
                os.Exit(1)
            }
        }
    }
}
```

###### 并发获取多个 URL

```go
package main

import (
    "fmt"
    "io"
    "io/ioutil"
    "net/http"
    "os"
    "time"
)

func main() {
    start := time.Now()
    ch := make(chan string)
    for _, url := range os.Args[1:] {
        go fetch(url, ch) // 启动一个goroutine
    }
    for range os.Args[1:] {
        fmt.Println(<-ch) // 从通道ch接收
    }
    fmt.Printf("%.2fs elapsed\n", time.Since(start).Seconds())
}

func fetch(url string, ch chan<- string) {
    start := time.Now()
    resp, err := http.Get(url)
    if err != nil {
        ch <- fmt.Sprint(err)
        return
    }
    nbytes, err := io.Copy(ioutil.Discard, resp.Body)
    resp.Body.Close() // 防止泄露资源
    if err != nil {
        ch <- fmt.Sprintf("while reading %s: %v", url, err)
        return
    }
    secs := time.Since(start).Seconds()
    ch <- fmt.Sprintf("%.2fs  %7d  %s", secs, nbytes, url)
}
```

运行结果：

```shell
$ ./fetchall http://www.baidu.com http://www.qq.com
0.08s   352723  http://www.baidu.com
0.14s   173953  http://www.qq.com
0.14s elapsed
```

这个进程可以并发获取很多 URL 内容，于是这个进程使用的时间不超过耗时最长时间的任务。这个程序不保存响应内容，但会报告每个响应的大小和花费的时间。

gorotine 是一个并发执行的函数。通道是一种允许某一进程向另一种进程传递制定类型的值的通信机制。main 函数在一个 goroutine 中执行，然后 go 语句创建额外的 goroutine。

main 函数使用 make 创建一 个字符串通道。对于每个命令行参数，go 语句在第一轮循环中启动一个新的 goroutine，它异步调用 fetch 来使用 http.Get 获取 URL 内容。io.Copy 函数读取响应的内容，然后通过写入 ioutil.Discard 输出流进行丢弃。Copy 返回字节数和错误信息。每一个结果返回时，fetch 发送一行汇总信息到通道 ch。main 中第二轮循环接收并且输出那些汇总行。

###### 一个 WEB 服务器

如下代码，实现一个简单的服务器，将返回服务器 URL 路径部分：

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe("localhost:8000", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "URL.Path = %q\n", r.URL.Path)
}
```

运行结果：

```shell
$ ./fetch http://localhost:8000/help
URL.Path = "/help"
```

这里的库函数做了大部分工作。main 函数将一个处理函数和以/开头的 URL 链接在一起，代表所有的 URL 使用这个函数处理，然后启动服务器监听 8000 端口处的请求。一个请求由 http.Request 类型的结构体表示，它包含很多关联的域，其中一个是所请求的 URL。当一个请求到达时，它被转交给处理函数，并从请求的 URL 中提取路径部分，使用 fmt.Printf 格式化，然后作为响应发送回去。

为服务器添加功能也很简单，如下程序会返回收到的请求数量：

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
)

var mu sync.Mutex
var count int

func main() {
	http.HandleFunc("/", handler)
	http.HandleFunc("/count", counter)
	log.Fatal(http.ListenAndServe("localhost:8000", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	count++
	mu.Unlock()
	fmt.Fprintf(w, "URL.Path = %q\n", r.URL.Path)
}

// 回显目前为止调用的次数
func counter(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	fmt.Fprintf(w, "Count %d\n", count)
	mu.Unlock()
}
```

运行结果：

```shell
$ ./fetch http://localhost:8000/
URL.Path = "/"
$ ./fetch http://localhost:8000/
URL.Path = "/"
$ ./fetch http://localhost:8000/count
Count 2
```

这个服务器有两个处理函数，通过请求的 URL 来决定哪一个被调用: 请求/count 调用 counter，其他的调用 handler。

以/结尾的处理模式匹配所有含有这个前缀的 URL。在后台，对于每个传入的请求，服务器在不同的 goroutine 中运行该处理函数，这样它可以同时处理多个请求。

然而，如果两个并发的请求试图同时更新计数值 count，count 可能会不一致地增加，程序会产生一个严重的竞态 BUG。为了避免该问题，必须确保最多只有一个 goroutine 在同一时间访问变量，这正是 mu.Lock()和 mu.Unlock()语句的作用。

修改处理函数，使其可以报告接收到的消息头和表单数据，这样可以方便服务器审查和调试请求。

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe("localhost:8000", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "%s %s %s\n", r.Method, r.URL, r.Proto)
	for k, v := range r.Header {
		fmt.Fprintf(w, "Header[%q] = %q\n", k, v)
	}
	fmt.Fprintf(w, "Host = %q\n", r.Host)
	fmt.Fprintf(w, "RemoteAddr = %q\n", r.RemoteAddr)
	if err := r.ParseForm(); err != nil {
		log.Print(err)
	}
	for k, v := range r.Form {
		fmt.Fprintf(w, "Form[%q] = %q\n", k, v)
	}
}
```

运行结果：

```shell
$ ./fetch http://localhost:8000/
GET / HTTP/1.1
Header["User-Agent"] = ["Go-http-client/1.1"]
Header["Accept-Encoding"] = ["gzip"]
Host = "localhost:8000"
RemoteAddr = "127.0.0.1:47766"
```

#### 程序结构

声明是给一个程序实体**命名**，并且设定其部分或全部属性。有 4 个主要声明: 变量(var)、常量(const)、类型(type)函数(func)。

Go 程序存储在一个或多个以.go 为后缀的文件里。每一个文件以 package 声明开头，表明文件属于哪个包。package 声明后面是 import 声明，然后是*包级别*的类型、变量、常量、函数的声明，不区分顺序。

例如，下面的程序声明一个常量、一个函数和一对变量：

```go
// 输出水的沸点
package main

import "fmt"

const boilingF = 212.0

func main() {
    var f = boilingF
    var c = (f - 32) * 5 / 9
    fmt.Printf("boiling point = %g F or %g C\n", f, c)
}

// 输出: boiling point = 212 F or 100 C
```

常量 boilingF 是一个包级别的声明(main 包)，f 和 c 是属于 main 函数的局部变量。包级别的实体名字不仅对于包含其声明的源文件可见，而且对于同一个包里面的所有源文件可见。

另一方面，局部声明仅仅是在声明所在的函数内部可见，并且可能对于函数中的一小块区域可见。

**函数的声明**包含一个名字、参数列表(由函数的调用者提供的变量)、一个可选的返回值列表，以及函数体。

下面的函数 fToC 封装了温度转换的逻辑，这样可以只定义一次而在多个地方使用。

```go
package main

import "fmt"

func main() {
    const freezingF, boilingF = 32.0, 212.0
    fmt.Printf("%g F = %g C\n", freezingF, fToC(freezingF))
    fmt.Printf("%g F = %g C\n", boilingF, fToC(boilingF))
}

func fToC(f float64) float64 {
    return (f - 32) * 5 / 9
}


/* 输出:
32 F = 0 C
212 F = 100 C
*/
```

#### 变量

通用形式: `var name type = expression`。

类型和表达式部分可以省略一个，但不能都省略。

如果类型省略，它的类型将由初始化表达式决定。如果表达式省略，其初始值对应于类型的零值，因此 Go 中不存在未初始化变量。

###### 短变量声明

在函数中，一种称作**短变量声明**的可选形式可以用来初始化局部变量。

形式: `name := expression`，name 的类型由 expression 的类型来决定。

在局部变量的声明和初始化主要使用短声明。

var 声明通常是为那些跟初始化表达式类型不一致的局部变量保留的，或者用于后面才对变量赋值以及变量初始值不重要的情况。

```go
i := 100
var boiling float64 = 100
i,j := 0,1
```

###### 指针

指针的值是一个变量的地址。

如果一个变量声明为`var x int`，表达式&x 获取一个指向整型变量的指针。

```go
x := 1
p := &x         // p 是整型指针 只想x
fmt.Println(*p) // "1"
*p = 2          // 等价于x = 2
fmt.Println(x)  // 结果"2"
```

每个聚合类型变量的组成都是变量，所以也有一个地址。

指针类型的零值是 nil。

函数可以返回局部变量的地址。

```go
var p = f()

func f() *int {
    v := 1
    return &v
}
```

因为一个指针包含变量的地址，所以传递一个指针参数给函数，能够让函数更新间接传递的变量值。

```go
func incr(p *int) int {
    *p++     // 递增p所指向的值 p自身保持不变
    return *p
}

v := 1
incr(&v)     // v 等于 2
fmt.Println(incr(&v)) // "3"
```

指针对于 flag 包是很关键的，它使用程序的命令行参数来设置整个程序内某些变量的值。

```go
package main

import (
    "flag"
    "fmt"
    "strings"
)

var n = flag.Bool("n", false, "omit trailing newline")
var sep = flag.String("s", " ", "separator")

func main() {
    flag.Parse()
    fmt.Print(strings.Join(flag.Args(), *sep))
    if !*n {
        fmt.Println()
    }
}
```

flag.Bool 函数创建一个新的布尔标识变量，它有 3 个参数。变量 sep 和 n 是指向标识变量的指针，必须通过 sep 和 n 来访问。

当程序运行前，在使用标识前，必须调用 flag.Parse 来更新标识变量的默认值。非标识参数也可以从 flag.Args()返回的字符串 slice 来访问。如果 flag.Parse 遇到错误，它输出一条帮助信息，然后调用 os.Exit(2)来结束程序。

运行示例：

```shell
$ ./echo4 a bc def
a bc def
$ ./echo4 -s / a bc def
a/bc/def
$ ./echo4 -help
Usage of ./echo4:
  -n    omit trailing newline
  -s string
        separator (default " ")
```
