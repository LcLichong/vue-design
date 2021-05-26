# 根据最大索引值的diff算法

## 根据遍历旧 children 中找到最大索引值（lastIndex变量），如果在遍历的过程中发现存在索引值比最大索引值小的节点，意味着该节点需要被移动

![React的diff算法](https://github.com/LcLichong/vue-design/blob/master/static/key_diff.svg)

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
                        let find = false;
                        // 遍历旧的 children
                        for (j; j < prevChildren.length; j++) {
                            const prevVNode = prevChildren[j];
                            // 如果找到了具有相同 key 值的两个节点，则调用 patch 函数更新之
                            if (prevVNode.key === nextVNode.key) {
                                find = true;
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
                        if (!find) {
                            // 挂载新节点
                            // 找到 refNode
                            const refNode = i - 1 < 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling;
                            mount(nextVNode, container, false, refNode);
                        }
                    }
                    // 移除已经不存在的节点
                    // 遍历旧的节点
                    for (let i = 0; i < prevChildren.length; i++) {
                        const prevVnode = prevChildren[i];
                        // 拿着旧 VNode 去新 children 中寻找相同的节点
                        const has = nextChildren.find(nextVNode => nextVNode.key === prevVnode.key);
                        if (!has) {
                            // 如果没有找到相同的节点，则移除
                            container.removeChild(prevVnode.el);
                        }
                    }
                    break;
            }
            break;
    }
}
```
