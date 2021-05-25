# 新旧节点都是多个且有key情况下的diff流程图

![新旧节点都是多个且有key情况下的diff流程图](https://github.com/LcLichong/vue-design/blob/master/static/key_diff.svg)

### 关键代码

```javascript
import { h, Fragment, Portal } from './h'
import { Component } from './component'
import render from './render'

const prevNode = h('ul', null, [
    h('li', { key: 'a' }, 1),
    h('li', { key: 'b' }, 2),
    h('li', { key: 'c' }, 4),
    h('li', { key: 'd' }, 3)
])

setTimeout(() => {
    const nextNode = h('ul', null, [
        h('li', { key: 'c' }, 4),
        h('li', { key: 'a' }, 1),
        h('li', { key: 'd' }, 3),
        h('li', { key: 'b' }, 2)
    ])
    render(nextNode, document.querySelector('#app'));
}, 2000)

render(prevNode, document.querySelector('#app'));
```

```javascript
function patchElement(prevVNode, nextVNode, container) {
    // 拿到 el 元素，注意这时要让 nextVNode.el 也引用该元素
    const el = (nextVNode.el = prevVNode.el);
  	// ...
}
```

```javascript
function patchChildren(prevChildFlags, nextChildFlags, prevChildren, nextChildren, container) {
    switch (prevChildFlags) {
        // 旧的 children 是单个子节点时，会执行该case语句
        case ChildrenFlags.SINGLE_VNODE:
            // ...
            break;
        // 旧的 children 没有子节点时，会执行该case语句
        case ChildrenFlags.NO_CHILDREN:
            // ...
            break;
        // 旧的 children 是多个子节点时，会执行该case语句
        default:
            switch (nextChildFlags) {
                // ...
                // 新的 children 是多个子节点时，会执行该case语句
                default:
                    // diff 新旧子节点都是多个的情况
                    // 用来存储寻找过程中遇到的最大索引值
                    let lastIndex = 0;
                    // 遍历新的 children
                    for (let i = 0; i < nextChildren.length; i++) {
                        const nextVNode = nextChildren[i];
                        let j = 0;
                        // 遍历旧的 children
                        for (j; j < prevChildren.length; j++) {
                            const prevVNode = prevChildren[j];
                            // 如果找到了具有相同 key 值的两个节点，则调用 patch 函数更新之
                            if (prevVNode.key === nextVNode.key) {
                                patch(prevVNode, nextVNode, container);
                                if (j < lastIndex) {
                                    // 需要移动
                                    // refNode 是为了下面调用 insertBefore 函数准备的
                                    const refNode = nextChildren[i - 1].el.nextSibling;
                                    // 调用 insertBefore 函数移动 DOM
                                    container.insertBefore(prevVNode.el, refNode);
                                } else {
                                    // 更新 lastIndex
                                    lastIndex = j;
                                }
                                break; // 找到了就退出本次循环，继续下一次比对
                            }
                        }
                    }
                    break;
            }
            break;
    }
}
```

