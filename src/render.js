/*
 * @Author: LcLichong 
 * @Date: 2021-05-23 01:41:26 
 * @Last Modified by: LcLichong
 * @Last Modified time: 2021-05-28 17:15:16
 */

import { VNodeFlags, ChildrenFlags } from './flags'
import { createTextVNode } from './h'
import patchData from './patchData'

export default function render(vnode, container) {
    const prevVNode = container.vnode;
    if (prevVNode == null) {
        if (vnode) {
            // 没有旧的 vNode，只有新的 vNode。使用`mount`函数挂载全新的 VNode
            mount(vnode, container);
            // 将新的 VNode 添加到 container.vnode 属性下，这样下一次渲染时旧的 VNode 就存在了
            container.vnode = vnode;
        }
    } else {
        if (vnode) {
            // 有旧的 vNode 也有新的 vNode，则调用`patch`函数打补丁
            patch(prevVNode, vnode, container);
            // 更新 container.vnode
            container.vnode = vnode;
        } else {
            // 有旧的 vNode 没有新的 vNode ，这说明应该移除DOM，在浏览器中可以使用 removeChild 函数
            container.removeChild(prevVNode.el);
            container.vnode = null;
        }
    }
}

function mount(vnode, container, isSVG, refNode) {
    const { flags } = vnode;
    if (flags & VNodeFlags.ELEMENT) {
        // 挂载普通标签
        mountElement(vnode, container, isSVG, refNode);
    } else if (flags & VNodeFlags.COMPONENT) {
        // 挂载组件
        mountComponent(vnode, container, isSVG);
    } else if (flags & VNodeFlags.TEXT) {
        // 挂载纯文本
        mountText(vnode, container);
    } else if (flags & VNodeFlags.FRAGMENT) {
        // 挂载Fragment
        mountFragment(vnode, container, isSVG);
    } else if (flags & VNodeFlags.PORTAL) {
        // 挂载Portal
        mountPortal(vnode, container, isSVG);
    }
}


function mountElement(vnode, container, isSVG, refNode) {
    isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG;
    const el = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag) : document.createElement(vnode.tag);
    if (vnode.flags & VNodeFlags.ELEMENT_SVG) {
        el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        el.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }
    vnode.el = el;
    const data = vnode.data;
    if (data) {
        // 如果 VNodeData 存在，则遍历之
        for (let key in data) {
            patchData(el, key, null, data[key], isSVG);
        }
    }
    // 拿到 children 和 childFlags
    const childFlags = vnode.childFlags;
    const children = vnode.children;
    // 检测如果没有子节点则无需递归挂载
    if (childFlags !== ChildrenFlags.NO_CHILDREN) {
        if (childFlags & ChildrenFlags.SINGLE_VNODE) {
            // 如果是单个子节点则调用 mount 函数挂载
            mount(children, el, isSVG);
        } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
            // 如果是多个子节点则遍历并调用 mount 函数挂载
            for (let i = 0; i < children.length; i++) {
                mount(children[i], el, isSVG);
            }
        }
    }
    // container.appendChild(el);
    refNode ? container.insertBefore(el, refNode) : container.appendChild(el);
}

function mountComponent(vnode, container, isSVG) {
    if (vnode.flags & VNodeFlags.COMPONENT_STATEFUL) {
        mountStatefulComponent(vnode, container, isSVG);
    } else {
        mountFunctionalComponent(vnode, container, isSVG);
    }
}

function mountStatefulComponent(vnode, container, isSVG) {
    // 创建组件实例
    const instance = (vnode.children = new vnode.tag());
    // 初始化 props
    instance.$props = vnode.data;

    instance._update = function () {
        if (instance._mounted) {
            // 1.拿到旧的 VNode
            const prevVNode = instance.$vnode;
            // 2.重新渲染新的 VNode
            const nextVNode = (instance.$vode = instance.render());
            // 3.patch 更新
            patch(prevVNode, nextVNode, prevVNode.el.parentNode);
            // 4.更新 vnode.el 和 $el
            instance.$el = vnode.el = instance.$vnode.el;
        } else {
            // 1.渲染VNode
            instance.$vnode = instance.render();
            // 2.挂载
            mount(instance.$vnode, container, isSVG);
            // 3.组件已挂载标识
            instance._mounted = true;
            // 4.el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
            instance.$el = vnode.el = instance.$vnode.el;
            // 5.调用 mounted 钩子
            instance.mounted && instance.mounted();
        }
    }
    instance._update();
}

function mountFunctionalComponent(vnode, container, isSVG) {
    // 在函数式组件类型的 vnode 上添加 handle 属性，它是一个
    vnode.handle = {
        prev: null,
        next: vnode,
        container,
        update: () => {
            if (vnode.handle.prev) {
                // 更新
                // prevVNode 是旧的组件VNode，nextVNode 是新的组件VNode
                const prevVNode = vnode.handle.prev;
                const nextVNode = vnode.handle.next;
                // prevTree 是组件产出的旧的 VNode
                const prevTree = prevVNode.children;
                // 更新 props 数据
                const props = nextVNode.data;
                // nextTree 是组件产出的新的 VNode
                const nextTree = (nextVNode.children = nextVNode.tag(props));
                // 调用 patch 函数更新
                patch(prevTree, nextTree, vnode.handle.container);
            } else {
                // 获取 props
                const props = vnode.data;
                // 获取 VNode
                const $vnode = (vnode.children = vnode.tag(props));
                // 挂载
                mount($vnode, container, isSVG);
                // el 元素引用该组件的根元素
                vnode.el = $vnode.el;
            }
        }
    }
    // 立即调用 vnode.handle.update 完成初次挂载
    vnode.handle.update();
}

function mountText(vnode, container) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.appendChild(el);
}

function mountFragment(vnode, container, isSVG) {
    // 拿到 children 和 childFlags
    const { children, childFlags } = vnode;
    switch (childFlags) {
        case ChildrenFlags.SINGLE_VNODE:
            // 如果是单个子节点，则直接调用 mount
            mount(children, container, isSVG);
            // 单个子节点，就指向该节点
            vnode.el = children.el;
            break;
        case ChildrenFlags.NO_CHILDREN:
            // 如果没有子节点，等价于挂载空片段，会创建一个空的文本节点占位
            const placeholder = createTextVNode('');
            mountText(placeholder, container);
            // 没有子节点指向占位的空文本节点
            vnode.el = placeholder.el;
            break;
        default:
            // 多个子节点，遍历挂载之
            for (let i = 0; i < children.length; i++) {
                mount(children[i], container, isSVG);
            }
            // 多个子节点，指向第一个子节点
            vnode.el = children[0].el;
    }
}

function mountPortal(vnode, container, isSVG) {
    const { tag, children, childFlags } = vnode;
    // 获取挂载点
    const target = typeof tag === 'string' ? document.querySelector(tag) : tag;
    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
        // 将 children 挂载到 target 上，而非 container
        mount(children, target);
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
        for (let i = 0; i < children.length; i++) {
            // 将 children 挂载到 target 上，而非 container
            mount(children[i], target);
        }
    }
    // 占位的空文本节点
    const placeholder = createTextVNode('');
    // 将该节点挂载到 container 中
    mountText(placeholder, container);
    // el 属性引用该节点
    vnode.el = placeholder.el;
}


function patch(prevVNode, nextVNode, container) {
    // 分别拿到新旧 vNode 的类型,也就是 flags
    const prevFlags = prevVNode.flags;
    const nextFlags = nextVNode.flags;

    // 如果新旧 VNode 的 flags 根本不一致，直接调用 replaceVNode 用新的 VNode 替换旧的VNode
    // 如果新旧 VNode 的 flags 一致，根据 flags 的值调用不同的比对函数
    if (prevFlags !== nextFlags) {
        replaceVNode(prevVNode, nextVNode, container);
    } else if (nextFlags & VNodeFlags.ELEMENT) {
        // 更新标签元素
        patchElement(prevVNode, nextVNode, container);
    } else if (nextFlags & VNodeFlags.COMPONENT) {
        // 更新组件
        patchComponent(prevVNode, nextVNode, container);
    } else if (nextFlags & VNodeFlags.TEXT) {
        // 更新文本元素
        patchText(prevVNode, nextVNode);
    } else if (nextFlags & VNodeFlags.FRAGMENT) {
        // 更新fragment
        patchFragment(prevVNode, nextVNode, container);
    } else if (nextFlags & VNodeFlags.PORTAL) {
        // 更新Portal
        patchPortal(prevVNode, nextVNode);
    }
}

function replaceVNode(prevVNode, nextVNode, container) {
    // 将旧的 VNode 渲染的 DOM 从容器中删除
    container.removeChild(prevVNode.el);
    // 如果将要被移除的 VNode 类型是组件，则需要调用该组件实例的 unmounted 钩子函数
    if (prevVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
        const instance = prevVNode.children;
        instance.unmounted && instance.unmounted();
    }
    // 再将新的 VNode 挂载到容器中
    mount(nextVNode, container);
}

function patchElement(prevVNode, nextVNode, container) {
    // 如果新旧 VNode 描述的是不同的标签，则调用 replaceVNode 函数，使用新的 VNode 替换旧的 VNode
    if (prevVNode.tag !== nextVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container);
        return;
    }

    // 拿到 el 元素，注意这时要让 nextVNode.el 也引用该元素
    const el = (nextVNode.el = prevVNode.el);
    // 拿到 新旧 VNodeData
    const prevData = prevVNode.data;
    const nextData = nextVNode.data;

    if (nextData) {
        // 遍历新的 VNodeData，将旧值和新值都传递给 patchData 函数
        for (let key in nextData) {
            // 根据 key 拿到新旧 VNodeData 的值
            const prevValue = prevData[key];
            const nextValue = nextData[key];
            patchData(el, key, prevValue, nextValue);
        }
    }
    // else {
    //     replaceVNode(prevVNode, nextVNode, container);
    //     return;
    // }
    // 旧的存在，新的不存在时需要通过它
    if (prevData) {
        // 遍历旧的 VNodeData，将已经不存在于新的 VNodeData 中的数据移除
        for (let key in prevData) {
            const prevValue = prevData[key];
            if (prevValue && !nextData.hasOwnProperty(key)) {
                patchData(el, key, prevValue, null);
            }
        }
    }
    patchChildren(
        prevVNode.childFlags,
        nextVNode.childFlags,
        prevVNode.children,
        nextVNode.children,
        el
    )
}

function patchChildren(prevChildFlags, nextChildFlags, prevChildren, nextChildren, container) {
    switch (prevChildFlags) {
        // 旧的 children 是单个子节点时，会执行该case语句
        case ChildrenFlags.SINGLE_VNODE:
            switch (nextChildFlags) {
                // 新的 children 是单个子节点时，会执行该case语句
                case ChildrenFlags.SINGLE_VNODE:
                    // 此时 prevChildren 和 nextChildren 都是 VNode 对象
                    patch(prevChildren, nextChildren, container);
                    break;
                // 新的 children 没有子节点时，会执行该case语句
                case ChildrenFlags.NO_CHILDREN:
                    container.removeChild(prevChildren.el);
                    break;
                // 新的 children 是多个子节点时，会执行该case语句
                default:
                    // container 删除旧的 prevChildren ，更新新的 nextChildren
                    container.removeChild(prevChildren.el);
                    for (let vNode of nextChildren) {
                        mount(vNode, container);
                    }
                    break;
            }
            break;
        // 旧的 children 没有子节点时，会执行该case语句
        case ChildrenFlags.NO_CHILDREN:
            switch (nextChildFlags) {
                // 新的 children 是单个子节点时，会执行该case语句
                case ChildrenFlags.SINGLE_VNODE:
                    mount(nextChildren, container);
                    break;
                // 新的 children 没有子节点时，会执行该case语句
                case ChildrenFlags.NO_CHILDREN:
                    // 什么都不做
                    break;
                // 新的 children 是多个子节点时，会执行该case语句
                default:
                    for (let vNode of nextChildren) {
                        mount(vNode, container);
                    }
                    break;
            }
            break;
        // 旧的 children 是多个子节点时，会执行该case语句
        default:
            switch (nextChildFlags) {
                // 新的 children 是单个子节点时，会执行该case语句
                case ChildrenFlags.SINGLE_VNODE:
                    for (let vNode of prevChildren) {
                        container.removeChild(vNode.el);
                    }
                    mount(nextChildren, container);
                    break;
                // 新的 children 没有子节点时，会执行该case语句
                case ChildrenFlags.NO_CHILDREN:
                    for (let vNode of prevChildren) {
                        container.removeChild(vNode.el);
                    }
                    break;
                // 新的 children 是多个子节点时，会执行该case语句
                default:
                    // 根据lastindex，diff 新旧子节点都是多个的情况
                    // patchByLastIndex(prevChildren, nextChildren, container);

                    // 双端比较的diff
                    // patchByBothEnds(prevChildren, nextChildren, container);

                    // vue3 的 diff
                    patchByInferno(prevChildren, nextChildren, container);
                    break;
            }
            break;
    }
}

function patchText(prevVNode, nextVNode) {
    const el = (nextVNode.el = prevVNode.el);
    if (nextVNode.children !== prevVNode.children) {
        el.nodeValue = nextVNode.children;
    }
}

function patchFragment(prevVNode, nextVNode, container) {
    patchChildren(
        prevVNode.childFlags,
        nextVNode.childFlags,
        prevVNode.children,
        nextVNode.children,
        container
    )

    switch (nextVNode.childFlags) {
        case ChildrenFlags.SINGLE_VNODE:
            nextVNode.el = nextVNode.children.el;
            break;
        case ChildrenFlags.NO_CHILDREN:
            const placeholder = createTextVNode('');
            mountText(placeholder, container);
            nextVNode.el = placeholder.el;
            break;
        default:
            nextVNode.el = nextVNode.children[0].el;
            break;
    }
}

function patchPortal(prevVNode, nextVNode) {
    patchChildren(
        prevVNode.childFlags,
        nextVNode.childFlags,
        prevVNode.children,
        nextVNode.children,
        prevVNode.tag // 注意容器元素是旧的 container
    )

    nextVNode.el = prevVNode.el;

    // 如果新旧容器不同，才需要搬运
    if (nextVNode.tag !== prevVNode.tag) {
        const container = typeof nextVNode.tag === 'string' ? document.querySelector(nextVNode.tag) : nextVNode.tag;
        switch (nextVNode.childFlags) {
            case ChildrenFlags.SINGLE_VNODE:
                /*
                 * 这里利用了 appendChild 的特性，如果 appendChild 要添加的子节点已经存在于文档树，它将从文档树中删除，然后重新插入它的新位置
                 * 而在 patchText 函数里通过 const el = (nextVNode.el = prevVNode.el)
                 * 让 nextVNode.children.el 等于 prevVNode.children.el
                 * 而 prevVNode.children.el 在第一次render的时候已经存在于文档树了
                 * 所以 container.appendChild(nextVNode.children.el)
                 * 根据 appendChild 的特性，删除旧的 prevVNode.children.el，添加新的 nextVNode.children.el 到 container
                 */
                container.appendChild(nextVNode.children.el);
                break;
            case ChildrenFlags.NO_CHILDREN:
                // nothing to do
                break;
            case ChildrenFlags.KEYED_VNODES:
                for (let vNode of nextVNode.children) {
                    container.appendChild(vNode.el);
                }
                break;
        }
    }
}

function patchComponent(prevVNode, nextVNode, container) {
    // tag 属性的值是组件类，通过对比新旧组件类是否相等来判断是否是相同组件
    if (nextVNode.tag !== prevVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container);
    } else if (nextVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
        // 更新有状态的组件
        // 1.获取组件实例
        const instance = (nextVNode.children = prevVNode.children);
        // 2.更新两个组件实例的 props
        instance.$props = nextVNode.data;
        // 3.重新渲染
        instance._update();
    } else {
        // 更新函数式组件
        // 通过 prevVNode.handle 拿到 handle 对象
        const handle = (nextVNode.handle = prevVNode.handle);
        // 更新 handle 对象
        handle.prev = prevVNode;
        handle.next = nextVNode;
        handle.container = container;
        // 调用 update 函数完成更新
        handle.update();
    }
}

function patchByLastIndex(prevChildren, nextChildren, container) {
    // 根据lastindex，diff 新旧子节点都是多个的情况
    // lastIndex 用来存储寻找过程中遇到的最大索引值
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
}

function patchByBothEnds(prevChildren, nextChildren, container) {
    // 双端比较的diff
    // 旧 children 的两个端点的位置索引
    let oldStartIdx = 0;
    let oldEndIdx = prevChildren.length - 1;
    // 新 children 的两个端点的位置索引 
    let newStartIdx = 0;
    let newEndIdx = nextChildren.length - 1;

    let oldStartVNode = prevChildren[oldStartIdx];
    let oldEndVNode = prevChildren[oldEndIdx];
    let newStartVNode = nextChildren[newStartIdx];
    let newEndVNode = nextChildren[newEndIdx];

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (!oldStartVNode) {
            oldStartVNode = prevChildren[++oldStartIdx];
        } else if (!oldEndVNode) {
            oldEndVNode = prevChildren[--oldEndVNode];
        } else if (oldStartVNode.key === newStartVNode.key) {
            // 步骤一：oldStartVNode 和 newStartVNode 比对
            // 调用 patch 函数更新
            patch(oldStartVNode, newStartVNode, container);
            // 更新索引，指向下一个位置
            oldStartVNode = prevChildren[++oldStartIdx];
            newStartVNode = nextChildren[++newStartIdx];
        } else if (oldEndVNode.key === newEndVNode.key) {
            // 步骤二：oldEndVNode 和 newEndVNode 比对
            // 先调用 patch 函数完成更新
            patch(oldEndVNode, newEndVNode, container);
            // 更新索引，指向下一个位置
            oldEndVNode = prevChildren[--oldEndIdx];
            newEndVNode = nextChildren[--newEndIdx];
        } else if (oldStartVNode.key === newEndVNode.key) {
            // 步骤三：oldStartVNode 和 newEndVNode 比对
            // 先调用 patch 函数完成更新
            patch(oldStartVNode, newEndVNode, container);
            // 将 oldStartVNode.el 移动到 oldEndVNode.el 的后面，也就是 oldEndVNode.el.nextSibling 的前面
            container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling);
            // 更新索引，指向下一个位置
            oldStartVNode = prevChildren[++oldStartIdx];
            newEndVNode = nextChildren[--newEndIdx];
        } else if (oldEndVNode.key === newStartVNode.key) {
            // 步骤四：oldEndVNode 和 newStartVNode 比对
            // 先调用 patch 函数完成更新
            patch(oldEndVNode, newStartVNode, container);
            // 更新完成后，将容器中最后一个子节点移动到最前面，使其成为第一个子节点
            container.insertBefore(oldEndVNode.el, oldStartVNode.el);
            // 更新索引，指向下一个位置
            oldEndVNode = prevChildren[--oldEndIdx];
            newStartVNode = nextChildren[++newStartIdx];
        } else {
            // 遍历旧 children，试图寻找与 newStartVNode 拥有相同 key 值的元素
            const idxInOld = prevChildren.findIndex(
                node => node.key === newStartVNode.key
            )
            if (idxInOld >= 0) {
                // vnodeToMove 就是在旧 children 中找到的节点，该节点所对应的真实 DOM 应该被移动到最前面
                const vnodeToMove = prevChildren[idxInOld];
                // 先调用 patch 函数完成更新
                patch(vnodeToMove, newStartVNode, container);
                // 把 vnodeToMove.el 移动到最前面，即 oldStartVNode.el 的前面
                container.insertBefore(vnodeToMove.el, oldStartVNode.el);
                // 由于旧 children 中该位置的节点所对应的真实 DOM 已经被移动，所以将其设置为 undefined
                prevChildren[idxInOld] = undefined;
            } else {
                // 使用 mount 函数挂载新节点
                mount(newStartVNode, container, false, oldStartVNode.el);
            }
            // 将 newStartIdx 下移一位
            newStartVNode = nextChildren[++newStartIdx]
        }
    }
    if (oldEndIdx < oldStartIdx) {
        // 添加新节点
        for (let i = newStartIdx; i <= newEndIdx; i++) {
            mount(nextChildren[i], container, false, oldStartVNode ? oldStartVNode.el : null);
        }
    } else if (newEndIdx < newStartIdx) {
        // 移除节点
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
            container.removeChild(prevChildren[i].el);
        }
    }
}

function patchByInferno(prevChildren, nextChildren, container) {
    // vue3 的 diff，借鉴于 ivi 和 inferno
    // j 为指向新旧 children 中第一个节点的索引
    let j = 0;
    let prevVNode = prevChildren[j];
    let nextVNode = nextChildren[j];
    // 指向旧 children 最后一个节点的索引
    let prevEnd = prevChildren.length - 1;
    // 指向新 children 最后一个节点的索引
    let nextEnd = nextChildren.length - 1;

    outer: {
        // 更新相同的前缀节点
        // while 循环向后遍历，直到遇到拥有不同 key 值的节点为止
        while (prevVNode.key === nextVNode.key) {
            // 调用 patch 函数更新
            patch(prevVNode, nextVNode, container);
            j++;
            if (j > prevEnd || j > nextEnd) {
                break outer;
            }
            prevVNode = prevChildren[j];
            nextVNode = nextChildren[j];
        }
        // 更新相同的后缀节点
        prevVNode = prevChildren[prevEnd];
        nextVNode = nextChildren[nextEnd];
        // while 循环向前遍历，直到遇到拥有不同 key 值的节点为止
        while (prevVNode.key === nextVNode.key) {
            // 调用 patch 函数更新
            patch(prevVNode, nextVNode, container);
            prevEnd--;
            nextEnd--;
            if (j > prevEnd || j > nextEnd) {
                break outer;
            }
            prevVNode = prevChildren[prevEnd];
            nextVNode = nextChildren[nextEnd];
        }
    }
    console.log('j', j);
    console.log('prevEnd', prevEnd);
    console.log('nextEnd', nextEnd);
    // 满足条件，则说明从 j -> nextEnd 之间的节点应作为新节点插入
    if (j > prevEnd && j <= nextEnd) {
        // 所有新节点应该插入到位于 nextPos 位置的节点的前面
        const nextPos = nextEnd + 1;
        const refNode = nextPos < nextChildren.length ? nextChildren[nextPos].el : null;
        // 采用 while 循环，调用 mount 函数挂载节点
        while (j <= nextEnd) {
            mount(nextChildren[j++], container, false, refNode);
        }
    } else if (j > nextEnd) {
        // 满足条件，则说明从 j -> prevEnd 位置的节点需要移除
        while (j <= prevEnd) {
            container.removeChild(prevChildren[j++].el);
        }
    } else {
        // 构造 source 数组
        const nextLeft = nextEnd - j + 1;
        const source = [];
        console.log('nextLeft', nextLeft);
        for (let i = 0; i < nextLeft; i++) {
            source.push(-1);
        }
        console.log('source', source);
        const prevStart = j;
        const nextStart = j;
        let moved = false;
        let pos = 0;
        // 构建索引表, key-value 对应 nextChildren 的 key 值和位置索引
        const keyIndex = {};
        for (let i = nextStart; i <= nextEnd; i++) {
            keyIndex[nextChildren[i].key] = i;
        }
        console.log('keyIndex', keyIndex);
        let patched = 0;
        // 遍历旧 children 的剩余未处理节点
        for (let i = prevStart; i <= prevEnd; i++) {
            let prevVNode = prevChildren[i];
            if (patched < nextLeft) {
                // 通过索引表快速找到新 children 中具有相同 key 的节点的位置
                const k = keyIndex[prevVNode.key];
                if (typeof k !== 'undefined') {
                    let nextVNode = nextChildren[k];
                    // patch 更新
                    patch(prevVNode, nextVNode, container);
                    patched++;
                    // 更新 source 数组
                    source[k - nextStart] = i;
                    // 判断是否需要移动
                    if (k < pos) {
                        moved = true;
                    } else {
                        pos = k;
                    }
                } else {
                    // 没找到，说明旧节点在新 children 中已经不存在了，应该移除
                    container.removeChild(prevVNode.el);
                }
            } else {
                // 多余的节点，应该移除
                container.removeChild(prevVNode.el);
            }
        }
        console.log('source', source);
        if (moved) {
            // 如果 moved 为真，则需要进行 DOM 移动操作
            // 计算最长递增子序列
            const seq = lis(source);
            console.log('seq',seq);
            // j 指向最长递增子序列的最后一个值
            let j = seq.length - 1;
            // 从后向前遍历新 children 中剩余未处理节点
            for (let i = nextLeft - 1; i >= 0; i--) {
                if (source[i] === -1) {
                    // 作为全新的节点挂载

                    // 该节点在新 children 中的真实位置索引
                    const pos = i + nextStart;
                    const nextVNode = nextChildren[pos];
                    // 该节点下一个节点的位置索引
                    const nextPos = pos + 1;
                    // 挂载
                    mount(
                        nextVNode,
                        container,
                        false,
                        nextPos < nextChildren.length
                            ? nextChildren[nextPos].el
                            : null
                    )
                } else if (i !== seq[j]) {
                    // 说明该节点需要移动

                    // 该节点在新 children 中的真实位置索引
                    const pos = i + nextStart
                    const nextVNode = nextChildren[pos]
                    // 该节点下一个节点的位置索引
                    const nextPos = pos + 1
                    // 移动
                    container.insertBefore(
                        nextVNode.el,
                        nextPos < nextChildren.length
                            ? nextChildren[nextPos].el
                            : null
                    )
                } else {
                    // 当 i === seq[j] 时，说明该位置的节点不需要移动
                    // 并让 j 指向下一个位置
                    j--
                }
            }
        }
    }
}

function lis(seq) {
    // 求解最长递增子序列
    const valueToMax = {}
    let len = seq.length
    for (let i = 0; i < len; i++) {
      valueToMax[seq[i]] = 1
    }
  
    let i = len - 1
    let last = seq[i]
    let prev = seq[i - 1]
    while (typeof prev !== 'undefined') {
      let j = i
      while (j < len) {
        last = seq[j]
        if (prev < last) {
          const currentMax = valueToMax[last] + 1
          valueToMax[prev] =
            valueToMax[prev] !== 1
              ? valueToMax[prev] > currentMax
                ? valueToMax[prev]
                : currentMax
              : currentMax
        }
        j++
      }
      i--
      last = seq[i]
      prev = seq[i - 1]
    }
  
    const lis = []
    i = 1
    while (--len >= 0) {
      const n = seq[len]
      if (valueToMax[n] === i) {
        i++
        lis.unshift(len)
      }
    }
  
    return lis
  }