title: "初识 React 中的 High Order Component"
tags: [ "React" ]
date: "Feb 14, 2016"

---

我们都知道，如果使用ES6 Component语法写React组件的话，mixin是不支持的。而mixin作为一种抽象和共用代码的方案，许过库（比如`react-router`）都依赖这一功能，自己的项目中可能都或多或少有用到mixin来尽量少写重复代码。

如果希望使用ES6 Component，有希望可以用一个像mixin一样的方案的话，可以使用`react-mixin`这样的库，就有种hack的感觉。这里介绍一个新的方案：High Order Component。

## 什么是High Order Component？

High Order Component，下面统一简称为HOC。我理解的HOC实际上是这样一个函数：

```
hoc :: ReactComponent -> ReactComponent
```

它接受一个ReactComponent，并返回一个新的ReactComponent，这一点颇有函数式编程的味道。由于是一个抽象和公用代码的方案，这个新的ReactComponent主要包含一些共用代码的逻辑或者是状态，用一个例子来解释更加直观：

```js
const connect = (mapStateFromStore) => (WrappedComponent) => {
  class InnerComponent extends Component {

    static contextTypes = {
      store: T.object
    }

    state = {
      others: {}
    }

    componentDidMount () {
      const { store } = this.context
      this.unSubscribe = store.subscribe(() => {
        this.setState({ others: mapStateFromStore(store.getState()) }
      })
    }

    componentWillUnmount () {
      this.unSubscribe()
    }

    render () {
      const { others } = this.state
      const props = {
        ...this.props,
        ...others
      }
      return <WrappedComponent {...props} />
    }
  }

  return InnerComponent
}
```

这个例子中定义的connect函数其实和`react-redux`中的connect差不多，我们发现它在内部定义了一个新的ReactComponent并将其返回，它的职责是在订阅store的改变，并将改变传递给子组件，在unmount的时候擦好屁股。这个case和常用的StoreMixin和类似。

**始终要记住的是，HOC最终返回的是一个新的ReactComponent。**

要使用HOC的话可以这样：

```js
class MyContainer extends Component {
  ...
}

export connect(() => ({}))(MyContainer)
```

其实我们还发现HOC的函数类型和class decorator是一样的，所以可以这样：

```js
@connect(() => ({}))
class MyContainer extends Component {
  ...
}

export MyContainer
```

但是**HOC不是decorator**，不能保证decorator最终一定进入ES的规范中，然而HOC始终是那个函数。


## 与mixin作比较

既然HOC的目的和mixin类似，那么我们来比较下这两种方案的区别：

首先，**mixin是react亲生的，而HOC是社区实践的产物**。其实这一点无关紧要，关键是讨论方案是否给开发带来便利，而且从趋势来看，并不看好mixin。

> Unfortunately, we will not launch any mixin support for ES6 classes in React. That would defeat the purpose of only using idiomatic JavaScript concepts.

不过我们还是先来看下mixin的使用场景：

- Lifecycle Hook
- State Provider

第一个应用场景Lifecycle Hook通常是在React组件生命周期函数中做文章，最典型的就是对Store的监听和保证unmount时候取消监听。第二个应用场景State Provider，典型的例子就是`react-router`，它所提供的几个mixin都是route信息的提供者。复杂的mixin则是两者的结合了。

回到HOC，对于Lifecycle Hook而言，由于本身就返回一个新的ReactComponent，这一点毫无压力。对于State Provider而言，可以通过新的ReactComponent的state来维护。

但是：

**两者在生命周期上有差异。**这是我的测试结果，其中hoc表示HOC返回的新的ReactComponent，app表示的是WrappedComponent：

```text
hoc componentWillMount
app componentWillMount
app componentDidMount
hoc componentDidMount
```

*注：这里的componentWillMount是在constructor中输出的。*

然后如果在HOC返回的新组件中更新状态的话：

```text
hoc componentWillUpdate
app componentWillReceiveProps
app componentWillUpdate
app componentDidUpdate
hoc componentDidUpdate
```

最后是unmount的部分：

```text
hoc componentWillUnmount
app componentWillUnmount
```

大家自行和mixin比较下吧。其实得到这样的结果是很正常的，熟悉React父子组件之间生命周期关系的同学一定不会陌生。


**暴露API的方式不同。**在使用mixin时，通过会添加一个方法，比如`StoreListenMixin`提供了一个`this.listen`方法，又或者`react-router`的`Lifecycle`需要我们实现`routerWillLeave`方法。而如果是HOC的话，从开头的例子可以看出，任何API都是通过属性传递的方式传递给WrappedComponent的。


## HOC实践

如果大家用Redux的话，`react-redux`中的connect就算是HOC了。另外，这段来自`react-mixin`的文字：

> 90% of the time you don't need mixins, in general prefer composition via high order components. For the 10% of the cases where mixins are best (e.g. PureRenderMixin and react-router's Lifecycle mixin), this library can be very useful.


`react-router`始终对mixin有依赖，不过`react-mixin`提供了decorate方法，让mixin可以想HOC一样使用：


```js
@reactMixin.decorate(mixin)
class AnotherComponent extends Component {
  ...
}
```

[recompose](https://github.com/acdlite/recompose)这个库可以关注下，里面有大量的HOC实现可以尝试尝试，这个库我也刚接触，就不多展开了。

安利下我的[react-async-script-loader](https://github.com/leozdgao/react-script-loader)，用来异步加载依赖脚本的HOC，可以关注下，欢迎提issue。


## 存在的问题

这是我在实践中遇到的两个问题，可能之后会再更新：

**HOC导致内部ref丢失。**在实践的时候，通常HOC都是“隐身”的，比如：

```js
// Editor.jsx
@scriptLoader(...)
class Editor extends Component {
  ...
}

export default Editor

// --------------------------------------

// Form.jsx
import Editor from './Editor.jsx'

<Editor ref="editor" />
```

这里的`this.refs.editor`返回的是什么？注意HOC返回的是一个新的Component，所以这里的ref指向的是新的Component，那么如果你在Editor组件上定义一些public的方法的话，通过`this.refs.editor`是无法调用到的。

解决办法是定义一个`getInnerInstance()`来返回内部WrappedComponent的ref，不过并不能要求第三方库的HOC都这样实现，所以这里算是有一个坑，不能算真正解决。

**componentWillReceiveProps失控**。由于HOC返回的新组件是通过给子组件传递属性的方式来传递状态的改变的，那么如果应用过多的HOC的话，可能导致`componentWillReceiveProps`里的逻辑变的难以维护。可能可以通过自己写一些utility函数来减压，不过始终是一个隐患。


最后，HOC由于并不是官方解决方案，遇到坑的原因主要也是缺乏一个统一的Convention，不过观察下来HOC是大势所趋，还在持续观望中，大家对HOC有任何看法的话，欢迎交流。

## 相关文章和issue

https://github.com/acdlite/flummox/blob/v3.5.1/docs/docs/guides/why-flux-component-is-better-than-flux-mixin.md
https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750#.trp9l55l0
https://github.com/facebook/react/issues/2669
https://github.com/facebook/react/issues/4213
