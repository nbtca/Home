---
layout: "../../../../../layouts/MarkdownPost.astro"
title: 'Go 结构体精要 2：禁用比较'
pubDate: 2026-04-03
description: '深入探讨Go结构体比较机制，介绍如何使用 [0]func() 技巧禁用结构体比较，为 API 设计提供防御性编程的最佳实践。'
cover: https://oss.nbtca.space/blog/clas/image-20220419101405456-wHMqwe.jpeg
author: 'zzh0u'
tags: ["技术","开发","Git"]
featured: true
---

在第一篇中，我们探讨了 `struct{}` 的零内存特性及其应用场景。这次我们把目光转向另一个容易被忽视但同样重要的话题：如何禁止比较结构体。

## 一、比较的规则：结构体何时可比较？

Go 的类型系统有一个基本规则：**结构体是否可比较，取决于其字段的类型**。

```go
type a struct {
    x int
    y string
}

func main() {
    var a1, a2 a
    fmt.Println(a1 == a2)
}
// OUTPUT
// true
```

但如果结构体包含 map、slice 或 func 类型，编译就会失败：

```go
type B struct {
    X int
    Y []int
}

func main() {
    var a1, a2 B
    fmt.Println(a1 == a2)
}
// OUTPUT
// # command-line-arguments
// ./main.go:12:14: invalid operation: a1 == a2 (struct containing []int cannot be compared)
```

这是 Go 语言的设计选择：引用类型（map、slice、func）的比较要么无意义（slice 和 map 比较的是指针），要么不可能（func 无法比较）。编译器通过禁止这种操作来防止潜在的错误。

## 二、如何让结构体不可比较？

理解了规则之后，一个很自然的问题是：如何主动让一个原本可比较的结构体变得不可比较？

### 1. 方法一：添加不可比较字段

最直接的方式是在结构体中添加一个不可比较的字段：

```go
type NoCompare struct {
    Name string
    Data map[string]int
}
```

这样结构体就不可比较了。但这种方法有一个问题：它会给人一种"这个字段需要使用"的错觉。

### 2. 方法二：更优雅的做法 `[0]func()`

我在阅读[博客](https://jianghushinian.cn/2024/06/15/how-to-make-structures-incomparable-in-go)时，发现了这样一种设计：

```go
// go/src/log/slog/value.go
type Value struct {
    _ [0]func() // disallow ==
    num uint64
    any any
}
```

让我们验证一下。

```go
type ProtectedStruct struct {
    _ [0]func()
    Name  string
}

func main() {
    v1 := ProtectedStruct{}
    v2 := ProtectedStruct{}
    fmt.Println(v1 == v2)
}
// OUTPUT
// # command-line-arguments
// ./main.go:15:14: invalid operation: v1 == v2 (struct containing [0]func() cannot be compared)
```

这种做法的好处在于：

1. 函数类型不可比较 — 这是 Go 语言的基本规则
2. `[0]func()` 是长度为 0 的数组 — 不占用任何内存空间
3. `_` 下划线是空白标识符 — 明确告诉读者这是编译器占位符，不暴露给外部

且运行 `fmt.Println("Sizeof:", unsafe.Sizeof(ps))` 时，输出 16，也验证了只占用了 `string` 类型的16字节。结构体大小完全取决于实际字段，空数组被编译器优化掉了。

### 3. 为什么选择 `[0]func()`？

让结构体不可比较的方法不只一种：

| 方案               | 内存占用 | 语义清晰度             | 官方推荐 |
| ------------------ | -------- | ---------------------- | -------- |
| `map[string]int{}` | 有       | 差（看起来像要用）     | 否       |
| `[]int{}`          | 有       | 差（看起来像要用）     | 否       |
| `[0]func()`        | **无**   | **强（明确是占位符）** | **是**   |

### 4. 替代方案：reflect.DeepEqual

虽然不能用 `==` 比较不可比较的结构体，但 Go 提供了 `reflect.DeepEqual`：

```go
fmt.Println(reflect.DeepEqual(v1, v2))
// OUTPUT
// true
```

这说明两者的内容确实相同。但这也带来了一个问题：**`==` 的语义是值相等，而 DeepEqual 比较的是内容相等**。对于大多数场景，我们实际上需要的是后者。

## 三、为什么需要主动禁用比较？

理解了如何禁用之后，更关键的问题是：**可比较的结构体，是否应该被比较？** 以下几个场景可以给出答案。

### 1. 为未来扩展留出余地

这是最常见的原因。假设你开发了一个公共库，里面有一个结构体：

```go
type Config struct {
    Name string
    Timeout int
}
```

目前它可比较，用户代码中可能大量使用了 `configA == Config{}`。但业务发展后，你需要给 Config 增加一个任意类型的不可比较字段：

```go
type Config struct {
    Name    string
    Timeout int
    Cache   map[string]any
}
```

这次修改会导致用户的比较代码全部编译失败。所以提前禁用比较，防止未来 API 演进时破坏用户代码。

### 2. 强制使用自定义 Equal 方法

有时候，简单的值比较（`==`）在逻辑上是不正确或者不够严谨的。

**指针语义 vs 值语义**：结构体内部可能包含指针，`==` 只会比较指针的内存地址是否相同，而不会比较指针指向的底层数据。

**隐藏状态**：例如 `time.Time` 结构体，内部包含了单调时钟（Monotonic Clock）的状态。如果直接用 `==` 比较两个时间，即使它们的墙上时间（Wall Time）一样，由于单调时钟不同，也会返回 false。

将结构体设为不可比较，可以在编译期强制要求用户调用类似 `func (s *MyStruct) Equal(other *MyStruct) bool` 这样的自定义方法，从而保证比较逻辑的绝对正确。

### 3. 防止误用作 Map 的 Key

在 Go 中，只有可比较的类型才能作为 Map 的 Key。如果一个结构体代表的是一个具有内部状态的对象（例如包含配置信息、连接池状态等），将它作为 Map 的 Key 通常是极其危险和不合理的——对象 A 和对象 B 即使内容相同，也是两个不同的引用，将它们作为 key 可能导致数据丢失。将其设为不可比较，可以直接在编译阶段拦截这种错误用法。

## 四、总结

禁用结构体的比较能力，本质上是一种防御性编程实践。它的价值在于：

1. **API 演进的保护** — 防止未来添加不可比较字段时破坏用户代码
2. **语义明确性** — 强制调用方使用显式的比较逻辑，而不是依赖模糊的 `==`
3. **编译期约束** — 利用编译器的类型系统来强制执行设计意图

> 好的 API 设计不仅是提供正确的功能，还要**限制错误的用法**。通过 `[0]func()` 这样的技巧，我们让编译器成为代码质量的守门人，而不是依赖运行时错误来发现问题。
