/**
 * Created by lc on 2021/5/16.
 */

import {VNodeFlags, ChildrenFlags} from './flags'
import {createTextVNode} from './h'
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

function mount(vnode, container, isSVG) {
    const {flags} = vnode;
    if (flags & VNodeFlags.ELEMENT) {
        // 挂载普通标签
        mountElement(vnode, container, isSVG);
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


function mountElement(vnode, container, isSVG) {
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
    container.appendChild(el);
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
    const instance = new vnode.tag();
    // 渲染VNode
    instance.$vnode = instance.render();
    // 挂载
    mount(instance.$vnode, container, isSVG);
    // el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
    instance.$el = vnode.el = instance.$vnode.el;
}

function mountFunctionalComponent(vnode, container, isSVG) {
    // 获取 VNode
    const $vnode = vnode.tag();
    // 挂载
    mount($vnode, container, isSVG);
    // el 元素引用该组件的根元素
    vnode.el = $vnode.el;
}

function mountText(vnode, container) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.appendChild(el);
}

function mountFragment(vnode, container, isSVG) {
    // 拿到 children 和 childFlags
    const {children, childFlags}  = vnode;
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
    const {tag, children, childFlags} = vnode;
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
    mountText(placeholder, container, null);
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
    }
}

function replaceVNode(prevVNode, nextVNode, container) {
    // 将旧的 VNode 渲染的 DOM 从容器中删除
    container.removeChild(prevVNode.el);
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
    } else {
        replaceVNode(prevVNode, nextVNode, container);
        return;
    }
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

function patchChildren(
    prevChildFlags,
    nextChildFlags,
    prevChildren,
    nextChildren,
    container
) {
    console.log('prevChildFlags',prevChildFlags);
    console.log('nextChildFlags',prevChildFlags);
    console.log('prevChildren',prevChildren);
    console.log('nextChildren',nextChildren);
    switch(prevChildFlags) {
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
                    for(let vNode of nextChildren){
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
                    break;
                // 新的 children 没有子节点时，会执行该case语句
                case ChildrenFlags.NO_CHILDREN:
                    break;
                // 新的 children 是多个子节点时，会执行该case语句
                default:
                    break;
            }
            break;
        // 旧的 children 是多个子节点时，会执行该case语句
        default:
            switch (nextChildFlags) {
                // 新的 children 是单个子节点时，会执行该case语句
                case ChildrenFlags.SINGLE_VNODE:
                    break;
                // 新的 children 没有子节点时，会执行该case语句
                case ChildrenFlags.NO_CHILDREN:
                    break;
                // 新的 children 是多个子节点时，会执行该case语句
                default:
                    break;
            }
            break;
    }
}

